'use client'
import { Trade } from '@/lib/types'
import { formatCurrency, formatPrice, timeAgo, cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Waves } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface WhaleTrackerProps {
  trades: Trade[]
}

export function WhaleTracker({ trades }: WhaleTrackerProps) {
  const whaleTrades = trades
    .filter(t => t.total_value >= 500)
    .slice(0, 8)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Waves className="w-4 h-4 text-blue-400" />
        <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Whale Activity</span>
      </div>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {whaleTrades.length === 0 ? (
            <div className="text-xs text-zinc-700 text-center py-4">No large trades yet</div>
          ) : (
            whaleTrades.map(trade => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-xs"
              >
                <span className="text-base">{(trade.coin as { flag_emoji?: string })?.flag_emoji ?? '🌍'}</span>
                <div className={cn(
                  'flex items-center gap-1 px-1.5 py-0.5 rounded font-medium',
                  trade.type === 'buy'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                )}>
                  {trade.type === 'buy'
                    ? <TrendingUp className="w-3 h-3" />
                    : <TrendingDown className="w-3 h-3" />
                  }
                  {trade.type.toUpperCase()}
                </div>
                <span className="text-zinc-400 font-mono">{formatCurrency(trade.total_value)}</span>
                <span className="text-zinc-600">{trade.coin_id}</span>
                <span className="text-zinc-700 ml-auto">{timeAgo(trade.created_at)}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
