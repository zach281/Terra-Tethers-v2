import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, decimals = 2): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
  }
  return `$${value.toFixed(decimals)}`
}

export function formatPrice(price: number): string {
  if (price < 0.01) return `$${price.toFixed(6)}`
  if (price < 1) return `$${price.toFixed(4)}`
  return `$${price.toFixed(4)}`
}

export function formatPct(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toString()
}

export function getPnlColor(value: number): string {
  if (value > 0) return 'text-emerald-400'
  if (value < 0) return 'text-red-400'
  return 'text-zinc-400'
}

export function getPnlBg(value: number): string {
  if (value > 0) return 'bg-emerald-500/10 text-emerald-400'
  if (value < 0) return 'bg-red-500/10 text-red-400'
  return 'bg-zinc-500/10 text-zinc-400'
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function rarityColor(rarity: string): string {
  const map: Record<string, string> = {
    common: 'text-zinc-400 border-zinc-600',
    rare: 'text-blue-400 border-blue-500',
    epic: 'text-purple-400 border-purple-500',
    legendary: 'text-amber-400 border-amber-500',
  }
  return map[rarity] ?? map.common
}

export function rarityGlow(rarity: string): string {
  const map: Record<string, string> = {
    common: '',
    rare: 'shadow-blue-500/20',
    epic: 'shadow-purple-500/30',
    legendary: 'shadow-amber-500/40',
  }
  return map[rarity] ?? ''
}
