import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { LeaderboardEntry } from '@/lib/types'
import { formatCurrency, formatPct, getPnlBg, cn } from '@/lib/utils'
import React from 'react'
import { Trophy, Crown, Medal } from 'lucide-react'
import Link from 'next/link'

async function getLeaderboard() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/leaderboard`, {
    next: { revalidate: 30 }
  })
  const data = await res.json()
  return (data.leaderboard ?? []) as LeaderboardEntry[]
}

async function getCurrentUserId() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id
  } catch { return null }
}

const RANK_ICONS: Record<number, React.ReactElement> = {
  1: <Crown className="w-5 h-5 text-amber-400" />,
  2: <Medal className="w-5 h-5 text-zinc-300" />,
  3: <Medal className="w-5 h-5 text-amber-700" />,
}

export default async function LeaderboardPage() {
  const [leaderboard, currentUserId] = await Promise.all([
    getLeaderboard(),
    getCurrentUserId(),
  ])

  const currentUserEntry = leaderboard.find(e => e.user_id === currentUserId)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Leaderboard</h1>
          <p className="text-zinc-500 text-sm">Top traders by portfolio value</p>
        </div>
      </div>

      {/* Your rank */}
      {currentUserEntry && (
        <div className="bg-zinc-900 border border-emerald-500/30 rounded-xl p-4 mb-6">
          <div className="text-xs text-emerald-400 font-medium mb-2">Your Standing</div>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-black text-white">#{currentUserEntry.rank}</div>
            <div>
              <div className="font-bold text-white">{currentUserEntry.display_name || currentUserEntry.username}</div>
              <div className="text-sm text-zinc-500">{formatCurrency(currentUserEntry.portfolio_value)}</div>
            </div>
            <div className="ml-auto">
              <span className={cn('text-sm font-bold px-2 py-1 rounded-lg', getPnlBg(currentUserEntry.pnl))}>
                {currentUserEntry.pnl >= 0 ? '+' : ''}{formatPct(currentUserEntry.pnl_pct)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
            const rank = [2, 1, 3][i]
            const heights = ['h-24', 'h-32', 'h-20']
            const colors = ['bg-zinc-700', 'bg-amber-500/20 border-amber-500/40', 'bg-amber-800/20 border-amber-700/30']
            return (
              <div key={entry.user_id} className={cn('border rounded-xl flex flex-col items-center justify-end p-3 text-center', colors[i], heights[i])}>
                <div className="text-2xl font-black text-white">#{rank}</div>
                <div className="text-xs font-bold text-white truncate max-w-full">
                  {entry.display_name || entry.username}
                </div>
                <div className={cn('text-xs mt-0.5', entry.pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                  {formatPct(entry.pnl_pct)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[48px_1fr_auto_auto_auto] gap-4 px-4 py-2.5 border-b border-zinc-800 text-xs text-zinc-500 font-medium uppercase tracking-wider">
          <span>Rank</span>
          <span>Trader</span>
          <span className="text-right hidden sm:block">Trades</span>
          <span className="text-right">Return</span>
          <span className="text-right">Value</span>
        </div>
        <div className="divide-y divide-zinc-800/60">
          {leaderboard.map(entry => {
            const isMe = entry.user_id === currentUserId
            return (
              <div
                key={entry.user_id}
                className={cn(
                  'grid grid-cols-[48px_1fr_auto_auto_auto] gap-4 px-4 py-3 items-center transition-colors',
                  isMe ? 'bg-white/5' : 'hover:bg-white/2'
                )}
              >
                {/* Rank */}
                <div className="flex items-center justify-center">
                  {RANK_ICONS[entry.rank] ?? (
                    <span className="text-sm font-bold text-zinc-500">#{entry.rank}</span>
                  )}
                </div>

                {/* Trader */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
                    {(entry.display_name || entry.username)[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-white truncate">
                      {entry.display_name || entry.username}
                      {isMe && <span className="ml-1 text-xs text-emerald-400">(you)</span>}
                    </div>
                    <div className="text-xs text-zinc-600">@{entry.username}</div>
                  </div>
                </div>

                {/* Trades */}
                <div className="text-sm text-zinc-500 text-right hidden sm:block">
                  {entry.total_trades}
                </div>

                {/* Return */}
                <div className={cn('text-sm font-bold text-right', entry.pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                  {entry.pnl >= 0 ? '+' : ''}{formatPct(entry.pnl_pct)}
                </div>

                {/* Value */}
                <div className="text-sm font-bold text-white text-right">
                  {formatCurrency(entry.portfolio_value)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-16 text-zinc-600">
          <Trophy className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <div>No traders yet. Be the first!</div>
        </div>
      )}
    </div>
  )
}
