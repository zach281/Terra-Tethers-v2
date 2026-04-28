'use client'
import { useState } from 'react'
import { Coin, Holding } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice, formatCurrency, cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, TrendingDown, Info } from 'lucide-react'

interface TradePanelProps {
  coin: Coin
  balance: number
  holding?: Holding
  onClose: () => void
  onTradeSuccess: (newBalance: number) => void
}

const PRESETS = [25, 50, 75, 100]

export function TradePanel({ coin, balance, holding, onClose, onTradeSuccess }: TradePanelProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; pnl?: number } | null>(null)

  const price = coin.current_price
  const dollarAmount = parseFloat(amount) || 0
  const qty = dollarAmount / price
  const fee = dollarAmount * 0.001
  const maxBuy = Math.min(balance, 5000)
  const maxSell = (holding?.quantity ?? 0) * price

  const handlePreset = (pct: number) => {
    const max = mode === 'buy' ? maxBuy : maxSell
    setAmount(((max * pct) / 100).toFixed(2))
  }

  const handleTrade = async () => {
    if (!dollarAmount || dollarAmount <= 0) return
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coin_id: coin.id, type: mode, quantity: qty }),
      })
      const data = await res.json()

      if (!res.ok) {
        setResult({ success: false, message: data.error || 'Trade failed' })
      } else {
        setResult({
          success: true,
          message: mode === 'buy' ? `Bought ${qty.toFixed(4)} ${coin.id}` : `Sold ${qty.toFixed(4)} ${coin.id}`,
          pnl: data.pnl,
        })
        onTradeSuccess(data.new_balance)
        setAmount('')
        setTimeout(() => setResult(null), 4000)
      }
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sticky top-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{coin.flag_emoji}</span>
          <div>
            <div className="font-bold text-white">{coin.id}</div>
            <div className="text-xs text-zinc-500">{formatPrice(price)}</div>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Buy / Sell toggle */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-950 rounded-lg mb-5">
        <button
          onClick={() => { setMode('buy'); setAmount('') }}
          className={cn(
            'py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-1.5',
            mode === 'buy'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'text-zinc-500 hover:text-zinc-300'
          )}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Buy
        </button>
        <button
          onClick={() => { setMode('sell'); setAmount('') }}
          className={cn(
            'py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-1.5',
            mode === 'sell'
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
              : 'text-zinc-500 hover:text-zinc-300'
          )}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          Sell
        </button>
      </div>

      {/* Amount */}
      <div className="space-y-3 mb-4">
        <Input
          label={mode === 'buy' ? 'Amount to spend (USD)' : 'Amount to sell (USD)'}
          type="number"
          prefix="$"
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="0"
          max={mode === 'buy' ? maxBuy : maxSell}
          step="0.01"
        />

        {/* Preset buttons */}
        <div className="grid grid-cols-4 gap-1">
          {PRESETS.map(pct => (
            <button
              key={pct}
              onClick={() => handlePreset(pct)}
              className="text-xs py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white transition-all font-medium"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Order summary */}
      {dollarAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 rounded-lg p-3 space-y-2 mb-4 text-sm"
        >
          <div className="flex justify-between text-zinc-400">
            <span>Quantity</span>
            <span className="text-white font-mono">{qty.toFixed(4)} {coin.id}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Price</span>
            <span className="text-white font-mono">{formatPrice(price)}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Fee (0.1%)</span>
            <span className="text-white font-mono">${fee.toFixed(4)}</span>
          </div>
          <div className="h-px bg-zinc-800" />
          <div className="flex justify-between font-bold">
            <span className="text-zinc-300">{mode === 'buy' ? 'Total cost' : 'You receive'}</span>
            <span className="text-white">{formatCurrency(mode === 'buy' ? dollarAmount + fee : dollarAmount - fee)}</span>
          </div>
        </motion.div>
      )}

      {/* Available */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-600 mb-4">
        <Info className="w-3 h-3" />
        {mode === 'buy'
          ? `Available: ${formatCurrency(balance)}`
          : `Holding: ${(holding?.quantity ?? 0).toFixed(4)} ${coin.id} (${formatCurrency(maxSell)})`
        }
      </div>

      {/* Result message */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'mb-4 p-3 rounded-lg text-sm font-medium',
              result.success ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
            )}
          >
            {result.message}
            {result.pnl !== undefined && result.pnl !== null && (
              <span className={cn('ml-2', result.pnl >= 0 ? 'text-emerald-300' : 'text-red-300')}>
                ({result.pnl >= 0 ? '+' : ''}{formatCurrency(result.pnl)} P/L)
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant={mode === 'buy' ? 'buy' : 'sell'}
        size="lg"
        className="w-full"
        loading={loading}
        disabled={!dollarAmount || dollarAmount <= 0}
        onClick={handleTrade}
      >
        {mode === 'buy' ? `Buy ${coin.id}` : `Sell ${coin.id}`}
      </Button>

      {/* Max order note */}
      <p className="text-center text-xs text-zinc-700 mt-2">Max order: $5,000 · 0.1% fee</p>
    </motion.div>
  )
}
