import { createServiceClient } from '@/lib/supabase/server'
import { NewsEvent } from '@/lib/types'
import { timeAgo, cn } from '@/lib/utils'
import { Newspaper, Flame, Radio } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

async function getNews(): Promise<NewsEvent[]> {
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase
      .from('news_events')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50)
    return data ?? []
  } catch { return [] }
}

const CATEGORY_COLORS: Record<string, string> = {
  military: 'bg-red-500/10 text-red-400 border-red-500/20',
  diplomacy: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  energy: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  nuclear: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  economic: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  political: 'bg-zinc-700/50 text-zinc-400 border-zinc-600',
}

const COIN_FLAGS: Record<string, string> = {
  USA: '🇺🇸', IRN: '🇮🇷', ISR: '🇮🇱', SAU: '🇸🇦', IRQ: '🇮🇶',
  SYR: '🇸🇾', YEM: '🇾🇪', LBN: '🇱🇧', UAE: '🇦🇪', QTR: '🇶🇦',
}

export default async function NewsPage() {
  const news = await getNews()
  const breaking = news.filter(n => n.is_breaking)
  const regular = news.filter(n => !n.is_breaking)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
          <Newspaper className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Intelligence Feed</h1>
          <p className="text-zinc-500 text-sm">Geopolitical events shaping the market</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1 text-xs text-red-400">
          <Radio className="w-3 h-3 animate-pulse" />
          Live
        </div>
      </div>

      {/* Daily briefing */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Daily Market Briefing</span>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed">
          Regional tensions remain elevated across the Middle East corridor. Iranian nuclear developments continue to weigh on ISR and USA coins, while Gulf state coins (SAU, UAE, QTR) show resilience amid OPEC+ coordination. Yemen Houthi activity disrupts Red Sea shipping, pressuring YEM and regional logistics sentiment. Watch for ceasefire signals out of Doha — QTR could spike on successful mediation news.
        </p>
        <div className="mt-3 pt-3 border-t border-zinc-800 flex flex-wrap gap-2">
          <span className="text-xs text-zinc-600">Top risks today:</span>
          {['Iranian escalation', 'Oil price volatility', 'Ceasefire breakthrough', 'Houthi activity'].map(r => (
            <span key={r} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{r}</span>
          ))}
        </div>
      </div>

      {/* Breaking news */}
      {breaking.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">🔴 Breaking</span>
          </div>
          <div className="space-y-3">
            {breaking.map(event => (
              <NewsCard key={event.id} event={event} breaking />
            ))}
          </div>
        </div>
      )}

      {/* Regular news */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Latest Intelligence</span>
        </div>
        <div className="space-y-3">
          {regular.map(event => (
            <NewsCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      {news.length === 0 && (
        <div className="text-center py-16 text-zinc-600">
          <Newspaper className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <div>No intelligence reports yet. Check back soon.</div>
        </div>
      )}
    </div>
  )
}

function NewsCard({ event, breaking }: { event: NewsEvent; breaking?: boolean }) {
  const impact = event.sentiment_impact
  const isPositive = impact > 0
  const categoryStyle = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.political

  return (
    <div className={cn(
      'bg-zinc-900 border rounded-xl p-4 transition-all hover:border-zinc-700',
      breaking ? 'border-red-500/30' : 'border-zinc-800'
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {breaking && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded font-bold animate-pulse">BREAKING</span>
            )}
            <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium capitalize', categoryStyle)}>
              {event.category}
            </span>
            <span className="text-xs text-zinc-600">{event.source}</span>
            <span className="text-xs text-zinc-700 ml-auto">{timeAgo(event.published_at)}</span>
          </div>

          <h3 className="font-bold text-white text-sm leading-snug mb-2">{event.title}</h3>

          {event.summary && (
            <p className="text-sm text-zinc-400 leading-relaxed mb-3">{event.summary}</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {/* Affected coins */}
            {event.affected_coins?.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-zinc-600">Affects:</span>
                {event.affected_coins.map(coinId => (
                  <span key={coinId} className="text-xs" title={coinId}>
                    {COIN_FLAGS[coinId] ?? '🌍'} {coinId}
                  </span>
                ))}
              </div>
            )}

            {/* Impact badge */}
            {Math.abs(impact) > 0 && (
              <div className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium ml-auto',
                isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              )}>
                {isPositive ? '↑' : '↓'} Market Impact {Math.abs(impact).toFixed(0)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
