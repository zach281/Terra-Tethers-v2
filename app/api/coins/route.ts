import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 5

export async function GET() {
  try {
    const supabase = await createServiceClient()
    const { data: coins, error } = await supabase
      .from('coins')
      .select('*')
      .eq('is_active', true)
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
