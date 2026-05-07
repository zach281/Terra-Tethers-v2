import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 0

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })

    const supabase = createClient(url, key)

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
