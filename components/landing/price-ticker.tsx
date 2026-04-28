'use client'
import { Coin } from '@/lib/types'
import { formatPrice, formatPct, cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface PriceTickerProps {
  coins: Coin[]
}

export function PriceTicker({ coins }: PriceTickerProps) {
  const items = [...coins, ...coins]
  return (
    <div className="overflow-hidden border-y border-zinc-800/60 bg-zinc-950/50 py-2">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="flex gap-8 whitespace-nowrap"
      >
        {items.map((coin, i) => {
          const change = coin.change_pct_24h ?? 0
          return (
            <div key={`${coin.id}-${i}`} className="flex items-center gap-2 text-sm">
              <span>{coin.flag_emoji}</span>
              <span className="font-semibold text-white">{coin.id}</span>
              <span className="text-zinc-400 font-mono">{formatPrice(coin.current_price)}</span>
              <span className={cn('text-xs font-medium', change >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {formatPct(change)}
              </span>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
