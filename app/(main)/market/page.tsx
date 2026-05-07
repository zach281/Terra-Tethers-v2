export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { MarketPageClient } from './market-client'

export default async function MarketPage() {
  let initialCoins: any[] = []
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(url, key)
    const { data } = await supabase.from('coins').select('*').order('id')
    initialCoins = (data ?? []).map(coin => ({
      ...coin,
      change_24h: coin.current_price - coin.price_24h_ago,
      change_pct_24h: coin.price_24h_ago > 0
        ? ((coin.current_price - coin.price_24h_ago) / coin.price_24h_ago) * 100
        : 0,
    }))
  } catch {}

  return <MarketPageClient initialCoins={initialCoins} />
}
