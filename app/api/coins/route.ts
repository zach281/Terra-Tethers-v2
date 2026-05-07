import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 0

const PRICE_UPDATE_INTERVAL_MS = 10_000

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: state } = await supabase
      .from('price_engine_state')
      .select('last_run')
      .single()

    const lastUpdated = state?.last_run ? new Date(state.last_run).getTime() : 0
    if (Date.now() - lastUpdated > PRICE_UPDATE_INTERVAL_MS) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/price-engine`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET ?? ''}` },
      }).catch(() => {})
    }

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
