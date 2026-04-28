import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 30

export async function GET() {
  try {
    const supabase = await createServiceClient()

    // Get all profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, balance, total_trades')
      .eq('is_public', true)
      .order('balance', { ascending: false })
      .limit(100)

    if (!profiles) return NextResponse.json({ leaderboard: [] })

    // Get all holdings with current prices
    const { data: holdings } = await supabase
      .from('holdings')
      .select('user_id, quantity, avg_buy_price, total_invested, coin:coins(current_price)')
      .in('user_id', profiles.map(p => p.id))
      .gt('quantity', 0)

    // Compute portfolio values
    const holdingsMap: Record<string, number> = {}
    const investedMap: Record<string, number> = {}

    for (const h of holdings ?? []) {
      const coinData = (h.coin as unknown) as { current_price: number } | null
      const val = h.quantity * (coinData?.current_price ?? 0)
      holdingsMap[h.user_id] = (holdingsMap[h.user_id] ?? 0) + val
      investedMap[h.user_id] = (investedMap[h.user_id] ?? 0) + h.total_invested
    }

    const leaderboard = profiles
      .map(p => {
        const holdingsValue = holdingsMap[p.id] ?? 0
        const totalValue = p.balance + holdingsValue
        const pnl = totalValue - 10000
        const pnl_pct = (pnl / 10000) * 100
        return {
          user_id: p.id,
          username: p.username,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          portfolio_value: totalValue,
          balance: p.balance,
          pnl,
          pnl_pct,
          total_trades: p.total_trades,
        }
      })
      .sort((a, b) => b.portfolio_value - a.portfolio_value)
      .map((entry, i) => ({ ...entry, rank: i + 1 }))

    return NextResponse.json({ leaderboard })
  } catch (err) {
    console.error('[GET /api/leaderboard]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
