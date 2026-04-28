'use client'
import { useState, useEffect } from 'react'
import { Holding, Trade, PortfolioStats } from '@/lib/types'
import { formatCurrency, formatPct, formatPrice, getPnlColor, getPnlBg, timeAgo, cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Share2, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

export default function PortfolioPage() {
  const [stats, setStats] = useState<PortfolioStats | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/portfolio').then(r => r.json()),
      fetch('/api/trades').then(r => r.json()),
    ]).then(([portfolioData, tradesData]) => {
      if (portfolioData.stats) setStats(portfolioData.stats)
      if (portfolioData.holdings) setHoldings(portfolioData.holdings)
      if (tradesData.trades) setTrades(tradesData.trades)
      setLoading(false)
    })
  }, [])

  const handleShare = async () => {
    const text = `I'm up ${formatPct(stats?.unrealized_pnl_pct ?? 0)} on Terra Tethers! Portfolio value: ${formatCurrency(stats?.total_value ?? 0)} 🌍📈 Trade geopolitics at terraTethers.com`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      if (navigator.share) navigator.share({ text })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const totalReturnPct = stats ? ((stats.total_value - 10000) / 10000) * 100 : 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Portfolio</h1>
          <p className="text-zinc-500 text-sm mt-1">Your positions and trade history</p>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-sm px-3 py-1.5 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Value', value: formatCurrency(stats?.total_value ?? 0), change: totalReturnPct, big: true },
          { label: 'Cash Balance', value: formatCurrency(stats?.cash_balance ?? 0), neutral: true },
          { label: 'Unrealized P/L', value: formatCurrency(stats?.unrealized_pnl ?? 0), change: stats?.unrealized_pnl_pct },
          { label: 'Total Return', value: formatPct(totalReturnPct, true), change: totalReturnPct },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">{s.label}</div>
            <div className={cn(
              'text-lg font-bold',
              s.neutral ? 'text-white' :
              (s.change ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}>
              {s.value}
            </div>
            {s.change !== undefined && !s.neutral && (
              <div className={cn('text-xs mt-0.5 flex items-center gap-0.5', (s.change ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                {(s.change ?? 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {formatPct(s.change ?? 0)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Holdings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl mb-6">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="font-bold text-white">Holdings ({holdings.length})</h2>
        </div>
        {holdings.length === 0 ? (
          <div className="p-8 text-center text-zinc-600">
            <div className="text-3xl mb-3">📊</div>
            <div>No positions yet. Go trade something!</div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {holdings.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-4 py-3"
              >
                <span className="text-2xl">{(h.coin as any)?.flag_emoji ?? '🌍'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{h.coin_id}</span>
                    <span className="text-xs text-zinc-600">{(h.coin as any)?.full_name}</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {h.quantity.toFixed(4)} coins · avg {formatPrice(h.avg_buy_price)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white text-sm">{formatCurrency(h.current_value ?? 0)}</div>
                  <div className={cn('text-xs font-medium mt-0.5', getPnlColor(h.pnl ?? 0))}>
                    {(h.pnl ?? 0) >= 0 ? '+' : ''}{formatCurrency(h.pnl ?? 0)} ({formatPct(h.pnl_pct ?? 0)})
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Trade history */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="font-bold text-white">Trade History</h2>
        </div>
        {trades.length === 0 ? (
          <div className="p-8 text-center text-zinc-600">No trades yet.</div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {trades.map(trade => (
              <div key={trade.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="text-xl">{(trade.coin as any)?.flag_emoji ?? '🌍'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={trade.type === 'buy' ? 'positive' : 'negative'}>
                      {trade.type.toUpperCase()}
                    </Badge>
                    <span className="font-medium text-white">{trade.coin_id}</span>
                    <span className="text-zinc-500">{trade.quantity.toFixed(4)}</span>
                  </div>
                  <div className="text-xs text-zinc-600 mt-0.5">@ {formatPrice(trade.price)} · {timeAgo(trade.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">{formatCurrency(trade.total_value)}</div>
                  {trade.pnl !== null && trade.pnl !== undefined && (
                    <div className={cn('text-xs font-medium', getPnlColor(trade.pnl))}>
                      {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
