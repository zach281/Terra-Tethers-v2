import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = await createServiceClient()
    const [holdingsRes, profileRes, coinsRes] = await Promise.all([
      service
        .from('holdings')
        .select('*, coin:coins(*)')
        .eq('user_id', user.id)
        .gt('quantity', 0),
      service.from('profiles').select('*').eq('id', user.id).single(),
      service.from('coins').select('id,current_price').eq('is_active', true),
    ])

    const profile = profileRes.data
    const holdings = (holdingsRes.data ?? []).map(h => {
      const currentPrice = h.coin?.current_price ?? 0
      const currentValue = h.quantity * currentPrice
      const pnl = currentValue - h.total_invested
      const pnl_pct = h.total_invested > 0 ? (pnl / h.total_invested) * 100 : 0
      return { ...h, current_value: currentValue, pnl, pnl_pct }
    })

    const totalHoldingsValue = holdings.reduce((sum, h) => sum + (h.current_value ?? 0), 0)
    const totalInvested = holdings.reduce((sum, h) => sum + h.total_invested, 0)
    const totalValue = (profile?.balance ?? 0) + totalHoldingsValue
    const unrealizedPnl = totalHoldingsValue - totalInvested
    const unrealizedPnlPct = totalInvested > 0 ? (unrealizedPnl / totalInvested) * 100 : 0
    const totalPnl = totalValue - 10000 // vs starting balance

    return NextResponse.json({
      stats: {
        total_value: totalValue,
        total_invested: totalInvested,
        cash_balance: profile?.balance ?? 0,
        unrealized_pnl: unrealizedPnl,
        unrealized_pnl_pct: unrealizedPnlPct,
        total_pnl: totalPnl,
      },
      holdings,
      profile,
    })
  } catch (err) {
    console.error('[GET /api/portfolio]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
