import { Trade, Holding, Profile } from './types'

export interface AchievementCheck {
  achievement_id: string
  earned: boolean
}

export function checkAchievements(params: {
  profile: Profile
  trades: Trade[]
  holdings: Holding[]
  portfolioValue: number
  existingAchievements: string[]
  referralCount?: number
  rank?: number
}): string[] {
  const { profile, trades, holdings, portfolioValue, existingAchievements, referralCount = 0, rank } = params
  const newAchievements: string[] = []

  const add = (id: string) => {
    if (!existingAchievements.includes(id)) {
      newAchievements.push(id)
    }
  }

  // First trade
  if (trades.length >= 1) add('first_trade')

  // Trade count milestones
  if (trades.length >= 10) add('ten_trades')
  if (trades.length >= 50) add('fifty_trades')

  // First profit: any sell with positive pnl
  const hasProfitableTrade = trades.some(t => t.type === 'sell' && (t.pnl ?? 0) > 0)
  if (hasProfitableTrade) add('first_profit')

  // 100% return: portfolio value >= 20000 (2x starting)
  if (portfolioValue >= 20000) add('double_up')

  // Whale: single trade > $5000
  const hasWhaleTrade = trades.some(t => t.total_value >= 5000)
  if (hasWhaleTrade) add('whale')

  // Diversified: 5+ unique holdings with quantity > 0
  const activeHoldings = holdings.filter(h => h.quantity > 0)
  if (activeHoldings.length >= 5) add('diversified')
  if (activeHoldings.length >= 10) add('all_coins')

  // Login streaks
  if ((profile.login_streak ?? 0) >= 7) add('streak_7')
  if ((profile.login_streak ?? 0) >= 30) add('streak_30')

  // Referrals
  if (referralCount >= 1) add('referral_1')
  if (referralCount >= 5) add('referral_5')

  // Rank achievements
  if (rank !== undefined && rank <= 10) add('top_10')
  if (rank !== undefined && rank === 1) add('top_1')

  // Portfolio value milestones
  if (portfolioValue >= 100000) add('portfolio_100k')

  // Early adopter (always give to first 1000 users)
  add('early_adopter')

  return newAchievements
}
