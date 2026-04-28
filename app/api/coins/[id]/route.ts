import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServiceClient()

    const [coinRes, historyRes] = await Promise.all([
      supabase.from('coins').select('*').eq('id', id).single(),
      supabase
        .from('price_history')
        .select('*')
        .eq('coin_id', id)
        .order('timestamp', { ascending: true })
        .limit(288), // 24h of 5m candles
    ])

    if (coinRes.error || !coinRes.data) {
      return NextResponse.json({ error: 'Coin not found' }, { status: 404 })
    }

    const coin = {
      ...coinRes.data,
      change_24h: coinRes.data.current_price - coinRes.data.price_24h_ago,
      change_pct_24h: coinRes.data.price_24h_ago > 0
        ? ((coinRes.data.current_price - coinRes.data.price_24h_ago) / coinRes.data.price_24h_ago) * 100
        : 0,
    }

    return NextResponse.json({ coin, history: historyRes.data ?? [] })
  } catch (err) {
    console.error('[GET /api/coins/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
