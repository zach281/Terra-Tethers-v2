import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'positive' | 'negative' | 'neutral' | 'breaking' | 'rarity'
  rarity?: string
  className?: string
}

export function Badge({ children, variant = 'default', rarity, className }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    positive: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    negative: 'bg-red-500/15 text-red-400 border-red-500/30',
    neutral: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    breaking: 'bg-red-500 text-white border-red-400 animate-pulse',
    rarity: rarity === 'legendary' ? 'bg-amber-500/15 text-amber-400 border-amber-500/40' :
            rarity === 'epic' ? 'bg-purple-500/15 text-purple-400 border-purple-500/40' :
            rarity === 'rare' ? 'bg-blue-500/15 text-blue-400 border-blue-500/40' :
            'bg-zinc-800 text-zinc-400 border-zinc-700',
  }
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
