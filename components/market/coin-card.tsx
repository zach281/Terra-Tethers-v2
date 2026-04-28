'use client'
import { Coin } from '@/lib/types'
import { formatPrice, formatPct, getPnlBg, cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CoinCardProps {
  coin: Coin
  onClick: (coin: Coin) => void
  isSelected?: boolean
  compact?: boolean
}

export function CoinCard({ coin, onClick, isSelected, compact }: CoinCardProps) {
  const change = coin.change_pct_24h ?? 0
  const isPositive = change >= 0

  if (compact) {
    return (
      <motion.button
        onClick={() => onClick(coin)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left',
          isSelected ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent'
        )}
      >
        <span className="text-2xl">{coin.flag_emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-white">{coin.id}</span>
            <span className="text-sm font-bold text-white">{formatPrice(coin.current_price)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 truncate">{coin.full_name}</span>
            <span className={cn('text-xs font-medium', isPositive ? 'text-emerald-400' : 'text-red-400')}>
              {formatPct(change)}
            </span>
          </div>
        </div>
      </motion.button>
    )
  }

  return (
    <motion.button
      onClick={() => onClick(coin)}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative w-full text-left bg-zinc-900 border rounded-xl p-4 transition-all cursor-pointer overflow-hidden',
        isSelected
          ? 'border-white/30 shadow-lg shadow-white/5'
          : 'border-zinc-800 hover:border-zinc-700'
      )}
    >
      {/* Color accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-60"
        style={{ backgroundColor: coin.color }}
      />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{coin.flag_emoji}</span>
          <div>
            <div className="font-bold text-white text-base">{coin.id}</div>
            <div className="text-xs text-zinc-500">{coin.full_name}</div>
          </div>
        </div>
        <span className={cn('text-xs px-1.5 py-0.5 rounded-md font-medium flex items-center gap-1', getPnlBg(change))}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {formatPct(change)}
        </span>
      </div>

      <div className="mt-2">
        <div className="text-xl font-bold text-white tabular-nums">{formatPrice(coin.current_price)}</div>
        <div className={cn('text-xs mt-0.5', isPositive ? 'text-emerald-400' : 'text-red-400')}>
          {isPositive ? '+' : ''}{(coin.change_24h ?? 0).toFixed(4)} today
        </div>
      </div>

      {/* Sentiment bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-zinc-600 mb-1">
          <span>Bearish</span>
          <span>Sentiment {coin.sentiment.toFixed(0)}%</span>
          <span>Bullish</span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${coin.sentiment}%`,
              backgroundColor: coin.sentiment > 55 ? '#10b981' : coin.sentiment < 45 ? '#ef4444' : '#f59e0b',
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
        <span>{coin.total_holders.toLocaleString()} holders</span>
        <span>Vol ${(coin.volume_24h / 1000).toFixed(1)}K</span>
      </div>
    </motion.button>
  )
}
