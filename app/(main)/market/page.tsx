'use client'
import { useState, useEffect, useCallback } from 'react'
import { Coin, Holding } from '@/lib/types'
import { CoinCard } from '@/components/market/coin-card'
import { TradePanel } from '@/components/market/trade-panel'
import { SentimentMeter } from '@/components/market/sentiment-meter'
import { WhaleTracker } from '@/components/market/whale-tracker'
import { PriceChart } from '@/components/charts/price-chart'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatPct, formatCurrency, cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { RefreshCw, TrendingUp, TrendingDown, Search } from 'lucide-react'

export default function MarketPage() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [balance, setBalance] = useState(10000)
  const [recentTrades, setRecentTrades] = useState<any[]>([])
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const fetchData = useCallback(async () => {
    const [coinsRes, portfolioRes, tradesRes] = await Promise.all([
      fetch('/api/coins').then(r => r.json()),
      fetch('/api/portfolio').then(r => r.json()),
      fetch('/api/trades').then(r => r.json()),
    ])
    if (coinsRes.coins) setCoins(coinsRes.coins)
    if (portfolioRes.stats) setBalance(portfolioRes.stats.cash_balance)
    if (portfolioRes.holdings) setHoldings(portfolioRes.holdings)
    if (tradesRes.trades) setRecentTrades(tradesRes.trades.slice(0, 20))
    setLastUpdated(new Date())
    setLoading(false)
  }, [])

  const fetchCoinHistory = useCallback(async (coinId: string) => {
    const res = await fetch(`/api/coins/${coinId}`)
    const data = await res.json()
    if (data.history) setPriceHistory(data.history)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  useEffect(() => {
    if (selectedCoin) fetchCoinHistory(selectedCoin.id)
  }, [selectedCoin, fetchCoinHistory])

  const handleCoinSelect = (coin: Coin) => {
    setSelectedCoin(prev => prev?.id === coin.id ? null : coin)
  }

  const handleTradeSuccess = (newBalance: number) => {
    setBalance(newBalance)
    fetchData()
    // Check achievements
    fetch('/api/achievements', { method: 'POST' })
  }

  const filteredCoins = coins.filter(c =>
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.full_name.toLowerCase().includes(search.toLowerCase())
  )

  const topGainer = [...coins].sort((a, b) => (b.change_pct_24h ?? 0) - (a.change_pct_24h ?? 0))[0]
  const topLoser = [...coins].sort((a, b) => (a.change_pct_24h ?? 0) - (b.change_pct_24h ?? 0))[0]
  const selectedHolding = holdings.find(h => h.coin_id === selectedCoin?.id)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-zinc-500 text-sm">Loading market data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Market</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-zinc-500">
              Live · updated {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
            <span className="text-xs text-zinc-500">Cash</span>
            <span className="text-sm font-bold text-emerald-400">{formatCurrency(balance)}</span>
          </div>
          <button
            onClick={fetchData}
            className="p-2 text-zinc-600 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top movers */}
      {topGainer && topLoser && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-zinc-500">Top Gainer</div>
              <div className="flex items-center gap-2">
                <span>{topGainer.flag_emoji}</span>
                <span className="font-bold text-sm text-white">{topGainer.id}</span>
                <Badge variant="positive">{formatPct(topGainer.change_pct_24h ?? 0)}</Badge>
              </div>
            </div>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-zinc-500">Top Loser</div>
              <div className="flex items-center gap-2">
                <span>{topLoser.flag_emoji}</span>
                <span className="font-bold text-sm text-white">{topLoser.id}</span>
                <Badge variant="negative">{formatPct(topLoser.change_pct_24h ?? 0)}</Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Left: coins + chart */}
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search coins..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
            />
          </div>

          {/* Coin grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredCoins.map(coin => (
              <CoinCard
                key={coin.id}
                coin={coin}
                onClick={handleCoinSelect}
                isSelected={selectedCoin?.id === coin.id}
              />
            ))}
          </div>

          {/* Price chart for selected coin */}
          <AnimatePresence>
            {selectedCoin && priceHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedCoin.flag_emoji}</span>
                    <div>
                      <div className="font-bold text-white">{selectedCoin.full_name}</div>
                      <div className="text-sm font-mono text-zinc-400">{formatPrice(selectedCoin.current_price)}</div>
                    </div>
                  </div>
                  <Badge variant={(selectedCoin.change_pct_24h ?? 0) >= 0 ? 'positive' : 'negative'}>
                    {formatPct(selectedCoin.change_pct_24h ?? 0)} 24H
                  </Badge>
                </div>
                <PriceChart
                  data={priceHistory}
                  color={selectedCoin.color}
                  startPrice={selectedCoin.price_24h_ago}
                  height={200}
                />
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-zinc-800">
                  {[
                    { label: '24H High', value: formatPrice(selectedCoin.high_24h) },
                    { label: '24H Low', value: formatPrice(selectedCoin.low_24h) },
                    { label: 'Volume', value: `$${(selectedCoin.volume_24h / 1000).toFixed(1)}K` },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <div className="text-xs text-zinc-500 mb-1">{s.label}</div>
                      <div className="font-mono text-sm font-bold text-white">{s.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Trade panel */}
          <AnimatePresence mode="wait">
            {selectedCoin ? (
              <TradePanel
                key={selectedCoin.id}
                coin={selectedCoin}
                balance={balance}
                holding={selectedHolding}
                onClose={() => setSelectedCoin(null)}
                onTradeSuccess={handleTradeSuccess}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-3">📈</div>
                <div className="text-white font-bold mb-1">Select a coin</div>
                <div className="text-zinc-500 text-sm">Click any coin card to open the trade panel</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sentiment meter */}
          <SentimentMeter coins={coins} />

          {/* Whale tracker */}
          <WhaleTracker trades={recentTrades} />
        </div>
      </div>
    </div>
  )
}
