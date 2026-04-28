'use client'
import { Coin } from '@/lib/types'

interface SentimentMeterProps {
  coins: Coin[]
}

export function SentimentMeter({ coins }: SentimentMeterProps) {
  const avgSentiment = coins.length
    ? coins.reduce((s, c) => s + c.sentiment, 0) / coins.length
    : 50

  const label =
    avgSentiment >= 75 ? 'Extreme Greed' :
    avgSentiment >= 60 ? 'Greed' :
    avgSentiment >= 45 ? 'Neutral' :
    avgSentiment >= 30 ? 'Fear' :
    'Extreme Fear'

  const color =
    avgSentiment >= 75 ? '#10b981' :
    avgSentiment >= 60 ? '#34d399' :
    avgSentiment >= 45 ? '#f59e0b' :
    avgSentiment >= 30 ? '#f97316' :
    '#ef4444'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wider">Market Sentiment</div>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#27272a" strokeWidth="4" />
            <circle
              cx="18" cy="18" r="14" fill="none"
              stroke={color}
              strokeWidth="4"
              strokeDasharray={`${(avgSentiment / 100) * 87.96} 87.96`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{avgSentiment.toFixed(0)}</span>
          </div>
        </div>
        <div>
          <div className="text-lg font-bold" style={{ color }}>{label}</div>
          <div className="text-xs text-zinc-500 mt-0.5">Regional average</div>
          <div className="flex gap-2 mt-2">
            {['Fear', 'Neutral', 'Greed'].map((l, i) => (
              <div key={l} className="flex items-center gap-1 text-xs text-zinc-600">
                <div className="w-1.5 h-1.5 rounded-full" style={{
                  backgroundColor: i === 0 ? '#ef4444' : i === 1 ? '#f59e0b' : '#10b981'
                }} />
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
