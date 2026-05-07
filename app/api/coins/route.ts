import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: coins, error } = await supabase
      .from('coins')
      .select('*')
      .order('id')

    if (error) throw error

    const enriched = (coins ?? []).map(coin => ({
      ...coin,
      change_24h: coin.current_price - coin.price_24h_ago,
      change_pct_24h: coin.price_24h_ago > 0
        ? ((coin.current_price - coin.price_24h_ago) / coin.price_24h_ago) * 100
        : 0,
    }))

    return NextResponse.json({ coins: enriched })
  } catch (err) {
    console.error('[GET /api/coins]', err)
    return NextResponse.json({ error: 'Failed to fetch coins' }, { status: 500 })
  }
}
