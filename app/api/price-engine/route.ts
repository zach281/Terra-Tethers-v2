import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { calculateNewPrice, generateSimulatedEvent } from '@/lib/price-engine'
import { Coin } from '@/lib/types'

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createServiceClient()

    // Get all active coins
    const { data: coins } = await supabase
      .from('coins')
      .select('*')
      .eq('is_active', true)

    if (!coins?.length) return NextResponse.json({ message: 'No coins' })

    // Get engine state
    const { data: state } = await supabase
      .from('price_engine_state')
      .select('*')
      .eq('id', 1)
      .single()

    const regime = state?.market_regime ?? 'normal'
    const now = new Date()
    const shouldFireEvent = state?.next_event_at && new Date(state.next_event_at) <= now

    let eventAffectedCoins: Record<string, number> = {}

    // Occasionally fire a simulated news event
    if (shouldFireEvent) {
      const event = generateSimulatedEvent()
      await supabase.from('news_events').insert({
        title: event.title,
        summary: event.summary,
        category: event.category,
        affected_coins: event.affected_coins,
        sentiment_impact: event.sentiment_impact,
        is_breaking: event.is_breaking,
        is_simulated: true,
        published_at: now.toISOString(),
      })
      event.affected_coins.forEach(coinId => {
        eventAffectedCoins[coinId] = event.sentiment_impact
      })

      // Update next event time (15-45 minutes from now)
      const nextEventMins = 15 + Math.floor(Math.random() * 30)
      await supabase
        .from('price_engine_state')
        .update({
          last_run: now.toISOString(),
          next_event_at: new Date(now.getTime() + nextEventMins * 60000).toISOString(),
          market_regime: pickRegime(),
        })
        .eq('id', 1)
    } else {
      await supabase
        .from('price_engine_state')
        .update({ last_run: now.toISOString() })
        .eq('id', 1)
    }

    // Get recent trade volumes (last 5 minutes)
    const fiveMinAgo = new Date(now.getTime() - 5 * 60000).toISOString()
    const { data: recentTrades } = await supabase
      .from('trades')
      .select('coin_id, type, total_value')
      .gte('created_at', fiveMinAgo)

    const volumeMap: Record<string, { buy: number; sell: number }> = {}
    for (const trade of recentTrades ?? []) {
      if (!volumeMap[trade.coin_id]) volumeMap[trade.coin_id] = { buy: 0, sell: 0 }
      if (trade.type === 'buy') volumeMap[trade.coin_id].buy += trade.total_value
      else volumeMap[trade.coin_id].sell += trade.total_value
    }

    // Process each coin
    const updates = []
    const historyRows = []

    for (const coin of coins as Coin[]) {
      const vol = volumeMap[coin.id] ?? { buy: 0, sell: 0 }
      const update = calculateNewPrice({
        coin,
        buyVolume: vol.buy,
        sellVolume: vol.sell,
        sentimentShock: eventAffectedCoins[coin.id] ?? 0,
        regime: regime as 'normal' | 'volatile' | 'trending' | 'crash',
      })

      const newSentiment = eventAffectedCoins[coin.id]
        ? Math.max(0, Math.min(100, coin.sentiment + eventAffectedCoins[coin.id] * 0.5))
        : Math.max(0, Math.min(100, coin.sentiment + (Math.random() - 0.5) * 2))

      updates.push({
        id: coin.id,
        current_price: update.new_price,
        high_24h: Math.max(coin.high_24h, update.new_price),
        low_24h: Math.min(coin.low_24h, update.new_price),
        sentiment: newSentiment,
        buy_volume_1h: 0,
        sell_volume_1h: 0,
        updated_at: now.toISOString(),
      })

      historyRows.push({
        coin_id: coin.id,
        open: update.open,
        high: update.high,
        low: update.low,
        close: update.close,
        volume: update.volume,
        interval: '1m',
        timestamp: now.toISOString(),
      })
    }

    // Batch update coins and insert history
    await Promise.all([
      ...updates.map(u =>
        supabase.from('coins').update(u).eq('id', u.id)
      ),
      supabase.from('price_history').insert(historyRows),
    ])

    // Reset 24h prices once per day (at midnight UTC)
    if (now.getUTCHours() === 0 && now.getUTCMinutes() < 2) {
      for (const coin of coins) {
        await supabase
          .from('coins')
          .update({
            price_24h_ago: coin.current_price,
            open_price: coin.current_price,
            high_24h: coin.current_price,
            low_24h: coin.current_price,
            volume_24h: 0,
          })
          .eq('id', coin.id)
      }
    }

    return NextResponse.json({ updated: updates.length, event: shouldFireEvent })
  } catch (err) {
    console.error('[POST /api/price-engine]', err)
    return NextResponse.json({ error: 'Engine error' }, { status: 500 })
  }
}

function pickRegime(): 'normal' | 'volatile' | 'trending' | 'crash' {
  const r = Math.random()
  if (r < 0.7) return 'normal'
  if (r < 0.85) return 'trending'
  if (r < 0.95) return 'volatile'
  return 'crash'
}
