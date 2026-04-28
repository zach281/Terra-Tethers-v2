import { Coin } from './types'

export interface PriceUpdate {
  coin_id: string
  new_price: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const MEAN_REVERSION_STRENGTH = 0.0005
const BASE_VOLATILITY = 0.003
const MAX_PRICE = 50.0
const MIN_PRICE = 0.01

export function calculateNewPrice(params: {
  coin: Coin
  buyVolume: number
  sellVolume: number
  sentimentShock?: number
  regime?: 'normal' | 'volatile' | 'trending' | 'crash'
}): PriceUpdate {
  const { coin, buyVolume, sellVolume, sentimentShock = 0, regime = 'normal' } = params
  const price = coin.current_price

  // Net volume pressure (normalized by price level)
  const netVolume = buyVolume - sellVolume
  const totalVolume = buyVolume + sellVolume
  const volumePressure = totalVolume > 0 ? netVolume / (price * 1000 + totalVolume) : 0

  // Sentiment factor (-1 to +1)
  const sentimentFactor = (coin.sentiment - 50) / 100

  // Holder momentum (more holders = mild bullish bias)
  const holderMomentum = Math.log(Math.max(coin.total_holders, 1) + 1) * 0.00005

  // Regime multiplier
  const regimeMultiplier = { normal: 1, volatile: 2.5, trending: 1.5, crash: 3 }[regime]

  // Brownian motion
  const sigma = BASE_VOLATILITY * regimeMultiplier
  const brownian = gaussianRandom() * sigma

  // Mean reversion toward $1.00 base (weakens at extremes)
  const meanReversion = (1.0 - price) * MEAN_REVERSION_STRENGTH

  // News/event shock
  const eventShock = sentimentShock / 100 * 0.02

  // Total movement
  const totalMovement =
    volumePressure * 0.8 +
    sentimentFactor * 0.001 +
    holderMomentum +
    brownian +
    meanReversion +
    eventShock

  const newPrice = Math.max(MIN_PRICE, Math.min(MAX_PRICE, price * (1 + totalMovement)))

  const candleNoise = Math.abs(gaussianRandom()) * sigma * 0.5
  const high = Math.max(price, newPrice) * (1 + candleNoise)
  const low = Math.min(price, newPrice) * (1 - candleNoise)

  return {
    coin_id: coin.id,
    new_price: newPrice,
    open: price,
    high: Math.min(MAX_PRICE, high),
    low: Math.max(MIN_PRICE, low),
    close: newPrice,
    volume: totalVolume,
  }
}

function gaussianRandom(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

export function applyNewsShock(
  coin: Coin,
  sentimentImpact: number
): number {
  // Clamp to ±25 sentiment points per event
  const delta = Math.max(-25, Math.min(25, sentimentImpact))
  return Math.max(0, Math.min(100, coin.sentiment + delta))
}

export function generateSimulatedEvent(): {
  title: string
  summary: string
  affected_coins: string[]
  sentiment_impact: number
  is_breaking: boolean
  category: string
} {
  const events = [
    {
      title: 'US drone strike targets militia commander in Iraq',
      summary: 'A US military drone struck a vehicle carrying a senior militia commander near Baghdad, raising fears of retaliation.',
      affected_coins: ['USA', 'IRQ', 'IRN'],
      sentiment_impact: -12,
      is_breaking: true,
      category: 'military',
    },
    {
      title: 'Iran nuclear talks resume in Vienna after 6-month pause',
      summary: 'Delegations from Iran, the EU, and the P5+1 gathered in Vienna to restart nuclear deal negotiations.',
      affected_coins: ['IRN', 'USA', 'ISR'],
      sentiment_impact: 18,
      is_breaking: false,
      category: 'diplomacy',
    },
    {
      title: 'Houthi forces seize commercial vessel in Red Sea',
      summary: 'Houthi rebels captured a cargo ship flagged under Liberia, threatening major shipping disruptions through the Bab al-Mandab strait.',
      affected_coins: ['YEM', 'SAU', 'UAE'],
      sentiment_impact: -15,
      is_breaking: true,
      category: 'military',
    },
    {
      title: 'Saudi Arabia announces $500B renewable energy investment',
      summary: 'Riyadh unveiled a landmark clean energy plan, signaling a long-term strategic pivot that could reshape Gulf economics.',
      affected_coins: ['SAU', 'UAE', 'QTR'],
      sentiment_impact: 20,
      is_breaking: false,
      category: 'energy',
    },
    {
      title: 'Israel-Hezbollah exchange fire along Lebanon border',
      summary: 'An exchange of rockets and artillery fire erupted along the Blue Line, the most significant escalation in months.',
      affected_coins: ['ISR', 'LBN', 'IRN'],
      sentiment_impact: -18,
      is_breaking: true,
      category: 'military',
    },
    {
      title: 'Qatar brokers prisoner exchange between warring factions',
      summary: 'Doha announced a successful 50-for-50 prisoner swap, earning praise from international observers.',
      affected_coins: ['QTR', 'ISR'],
      sentiment_impact: 12,
      is_breaking: false,
      category: 'diplomacy',
    },
    {
      title: 'Oil prices surge 8% on OPEC+ surprise cut announcement',
      summary: 'OPEC+ members agreed to extend and deepen production cuts, catching traders off guard and sending crude soaring.',
      affected_coins: ['SAU', 'IRQ', 'UAE', 'IRN'],
      sentiment_impact: 22,
      is_breaking: true,
      category: 'energy',
    },
    {
      title: 'Syria reports Israeli airstrike near Damascus military airport',
      summary: 'Syrian state media reported explosions near Damascus International Airport, which Israel neither confirmed nor denied.',
      affected_coins: ['SYR', 'ISR', 'IRN'],
      sentiment_impact: -10,
      is_breaking: false,
      category: 'military',
    },
    {
      title: 'Lebanon central bank collapses, IMF emergency talks begin',
      summary: 'Beirut\'s central bank governor resigned amid a foreign exchange crisis, triggering emergency meetings with IMF officials.',
      affected_coins: ['LBN', 'USA'],
      sentiment_impact: -25,
      is_breaking: true,
      category: 'economic',
    },
    {
      title: 'US-UAE defense pact upgraded to Tier 1 alliance status',
      summary: 'Washington and Abu Dhabi signed an enhanced defense cooperation agreement, including joint air defense systems.',
      affected_coins: ['UAE', 'USA', 'IRN'],
      sentiment_impact: 15,
      is_breaking: false,
      category: 'diplomacy',
    },
  ]
  return events[Math.floor(Math.random() * events.length)]
}
