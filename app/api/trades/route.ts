import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { TradeRequest } from '@/lib/types'

const MAX_ORDER_USD = 5000
const TRADE_COOLDOWN_MS = 2000
const FEE_RATE = 0.001

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: trades } = await supabase
      .from('trades')
      .select('*, coin:coins(id,name,flag_emoji,color,current_price)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    return NextResponse.json({ trades: trades ?? [] })
  } catch (err) {
    console.error('[GET /api/trades]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const service = await createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: TradeRequest = await req.json()
    const { coin_id, type, quantity } = body

    if (!coin_id || !type || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid trade parameters' }, { status: 400 })
    }

    // Get current coin price
    const { data: coin } = await service.from('coins').select('*').eq('id', coin_id).single()
    if (!coin) return NextResponse.json({ error: 'Coin not found' }, { status: 404 })

    const price = coin.current_price
    const totalValue = quantity * price
    const fee = totalValue * FEE_RATE

    // Enforce max order size
    if (totalValue > MAX_ORDER_USD) {
      return NextResponse.json(
        { error: `Maximum order size is $${MAX_ORDER_USD.toLocaleString()}` },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile } = await service
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Check cooldown: last trade in last 2s?
    const { data: recentTrades } = await service
      .from('trades')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (recentTrades && recentTrades.length > 0) {
      const lastTradeMs = new Date(recentTrades[0].created_at).getTime()
      if (Date.now() - lastTradeMs < TRADE_COOLDOWN_MS) {
        return NextResponse.json({ error: 'Please wait a moment between trades' }, { status: 429 })
      }
    }

    if (type === 'buy') {
      const cost = totalValue + fee
      if (profile.balance < cost) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
      }

      // Deduct balance
      await service
        .from('profiles')
        .update({ balance: profile.balance - cost, total_trades: profile.total_trades + 1 })
        .eq('id', user.id)

      // Upsert holding
      const { data: existing } = await service
        .from('holdings')
        .select('*')
        .eq('user_id', user.id)
        .eq('coin_id', coin_id)
        .single()

      if (existing && existing.quantity > 0) {
        const newQty = existing.quantity + quantity
        const newAvg = (existing.avg_buy_price * existing.quantity + price * quantity) / newQty
        await service
          .from('holdings')
          .update({
            quantity: newQty,
            avg_buy_price: newAvg,
            total_invested: existing.total_invested + totalValue,
          })
          .eq('id', existing.id)
      } else {
        await service.from('holdings').upsert({
          user_id: user.id,
          coin_id,
          quantity,
          avg_buy_price: price,
          total_invested: totalValue,
        }, { onConflict: 'user_id,coin_id' })
      }

      // Record trade
      const { data: trade } = await service.from('trades').insert({
        user_id: user.id,
        coin_id,
        type: 'buy',
        quantity,
        price,
        total_value: totalValue,
        fee,
      }).select().single()

      // Update coin volumes
      await service
        .from('coins')
        .update({
          buy_volume_1h: coin.buy_volume_1h + totalValue,
          volume_24h: coin.volume_24h + totalValue,
        })
        .eq('id', coin_id)

      return NextResponse.json({ trade, new_balance: profile.balance - cost })
    }

    if (type === 'sell') {
      const { data: holding } = await service
        .from('holdings')
        .select('*')
        .eq('user_id', user.id)
        .eq('coin_id', coin_id)
        .single()

      if (!holding || holding.quantity < quantity) {
        return NextResponse.json({ error: 'Insufficient holdings' }, { status: 400 })
      }

      const proceeds = totalValue - fee
      const pnl = (price - holding.avg_buy_price) * quantity - fee
      const newQty = holding.quantity - quantity

      await service
        .from('profiles')
        .update({ balance: profile.balance + proceeds, total_trades: profile.total_trades + 1 })
        .eq('id', user.id)

      await service
        .from('holdings')
        .update({
          quantity: newQty,
          total_invested: newQty > 0 ? holding.avg_buy_price * newQty : 0,
        })
        .eq('id', holding.id)

      const { data: trade } = await service.from('trades').insert({
        user_id: user.id,
        coin_id,
        type: 'sell',
        quantity,
        price,
        total_value: totalValue,
        fee,
        pnl,
      }).select().single()

      await service
        .from('coins')
        .update({
          sell_volume_1h: coin.sell_volume_1h + totalValue,
          volume_24h: coin.volume_24h + totalValue,
        })
        .eq('id', coin_id)

      return NextResponse.json({ trade, new_balance: profile.balance + proceeds, pnl })
    }

    return NextResponse.json({ error: 'Invalid trade type' }, { status: 400 })
  } catch (err) {
    console.error('[POST /api/trades]', err)
    return NextResponse.json({ error: 'Trade failed' }, { status: 500 })
  }
}
