export interface Coin {
  id: string
  name: string
  full_name: string
  flag_emoji: string
  color: string
  current_price: number
  open_price: number
  price_24h_ago: number
  high_24h: number
  low_24h: number
  volume_24h: number
  buy_volume_1h: number
  sell_volume_1h: number
  total_holders: number
  sentiment: number
  description: string
  market_cap: number
  is_active: boolean
  updated_at: string
  change_24h?: number
  change_pct_24h?: number
}

export interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  balance: number
  referral_code: string
  referred_by: string | null
  login_streak: number
  last_login_date: string | null
  total_trades: number
  is_public: boolean
  bio: string | null
  created_at: string
}

export interface Holding {
  id: string
  user_id: string
  coin_id: string
  quantity: number
  avg_buy_price: number
  total_invested: number
  updated_at: string
  coin?: Coin
  current_value?: number
  pnl?: number
  pnl_pct?: number
}

export interface Trade {
  id: string
  user_id: string
  coin_id: string
  type: 'buy' | 'sell'
  quantity: number
  price: number
  total_value: number
  fee: number
  pnl: number | null
  created_at: string
  coin?: Coin
}

export interface NewsEvent {
  id: string
  title: string
  summary: string | null
  source: string
  url: string | null
  category: string
  affected_coins: string[]
  sentiment_impact: number
  is_breaking: boolean
  is_simulated: boolean
  published_at: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  requirement_type: string | null
  requirement_value: number | null
}

export interface UserAchievement {
  user_id: string
  achievement_id: string
  earned_at: string
  achievement?: Achievement
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  display_name: string
  portfolio_value: number
  balance: number
  pnl: number
  pnl_pct: number
  total_trades: number
  avatar_url: string | null
}

export interface PricePoint {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Tournament {
  id: string
  name: string
  start_date: string
  end_date: string
  starting_balance: number
  status: 'upcoming' | 'active' | 'ended'
}

export interface TradeRequest {
  coin_id: string
  type: 'buy' | 'sell'
  quantity: number
}

export interface PortfolioStats {
  total_value: number
  total_invested: number
  cash_balance: number
  unrealized_pnl: number
  unrealized_pnl_pct: number
  total_pnl: number
  holdings: Holding[]
}
