'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { PricePoint } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'

interface PriceChartProps {
  data: PricePoint[]
  color: string
  startPrice?: number
  height?: number
}

export function PriceChart({ data, color, startPrice = 1, height = 200 }: PriceChartProps) {
  if (!data || data.length === 0) return (
    <div className="flex items-center justify-center text-zinc-700 text-sm" style={{ height }}>
      No chart data yet
    </div>
  )

  const chartData = data.map(d => ({
    time: format(new Date(d.timestamp), 'HH:mm'),
    price: d.close,
    volume: d.volume,
  }))

  const currentPrice = data[data.length - 1]?.close ?? startPrice
  const isPositive = currentPrice >= startPrice

  const gradientColor = isPositive ? '#10b981' : '#ef4444'
  const strokeColor = isPositive ? '#10b981' : '#ef4444'

  const prices = data.map(d => d.close)
  const minPrice = Math.min(...prices) * 0.999
  const maxPrice = Math.max(...prices) * 1.001

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gradientColor} stopOpacity={0.15} />
            <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          tick={{ fill: '#52525b', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minPrice, maxPrice]}
          tickFormatter={v => formatPrice(v)}
          tick={{ fill: '#52525b', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={70}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#fff',
          }}
          formatter={(value) => [formatPrice(Number(value)), 'Price']}
          labelStyle={{ color: '#71717a' }}
        />
        <ReferenceLine
          y={startPrice}
          stroke="#52525b"
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={strokeColor}
          strokeWidth={2}
          fill={`url(#grad-${color})`}
          dot={false}
          activeDot={{ r: 4, fill: strokeColor, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function MiniChart({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null
  const chartData = data.map((v, i) => ({ i, v }))
  const color = positive ? '#10b981' : '#ef4444'
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={`mini-${positive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#mini-${positive})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
