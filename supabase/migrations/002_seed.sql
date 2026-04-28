-- ============================================================
-- COINS SEED
-- ============================================================
INSERT INTO coins (id, name, full_name, flag_emoji, color, current_price, open_price, price_24h_ago, high_24h, low_24h, description) VALUES
  ('USA', 'USA', 'United States', '🇺🇸', '#3b82f6', 1.000000, 1.000000, 1.000000, 1.000000, 1.000000, 'The world''s reserve currency power. USA Coin tracks sentiment around US foreign policy and military presence in the Middle East.'),
  ('IRN', 'IRN', 'Iran', '🇮🇷', '#22c55e', 1.000000, 1.000000, 1.000000, 1.000000, 1.000000, 'The Islamic Republic of Iran. IRN Coin reflects sentiment around sanctions, nuclear negotiations, and regional proxy power.'),
  ('ISR', 'ISR', 'Israel', '🇮🇱', '#6366f1', 1.000000, 1.000000, 1.000000, 1.000000, 1.000000, 'A key US ally in the region. ISR Coin tracks military operations, diplomatic relations, and regional security dynamics.'),
  ('SAU', 'SAU', 'Saudi Arabia', '🇸🇦', '#f59e0b', 1.000000, 1.000000, 1.000000, 1.000000, 1.000000, 'OPEC''s heavyweight. SAU Coin is sensitive to oil prices, US-Saudi relations, and regional power dynamics.'),
  ('IRQ', 'IRQ', 'Iraq', '🇮🇶', '#ef4444', 1.000000, 1.000000, 1.000000, 1.000000, 1.000000, 'A nation at the crossroads of US and Iranian influence. IRQ Coin moves on security events and political stability.'),
  ('SYR', 'SYR', 'Syria', '🇸🇾', '#a855f7', 1.000000, 1.000000, 1.000000, 1.000000, 1.000000, 'Syria remains a major flashpoint. SYR Coin tracks reconstruction prospects, foreign troop presence, and ceasefire developments.'),
  ('YEM', 'YEM', 'Yemen', '🇾🇪', '#f97316', 1.000000, 1.000000, 1.000000, 1.000000, 1.000000, 'Scene of a devastating proxy war. YEM Coin tracks Houthi activity, Saudi coalition operations, and shipping disruptions.'),
  ('LBN', 'LBN', 'Lebanon', '🇱🇧', '#ec4899', 1.000000, 1.000000, 1.000000, 1.000000, 1.000000, 'Lebanon balances between Hezbollah and Western influence. LBN Coin reacts to Hezbollah activity and reconstruction news.'),
  ('UAE', 'UAE', 'UAE', '🇦🇪', '#14b8a6', 1.000000, 1.000000, 1.000000, 1.000000, 1.000000, 'A financial and diplomatic hub. UAE Coin tracks normalization deals, trade relationships, and regional stability.'),
  ('QTR', 'QTR', 'Qatar', '🇶🇦', '#8b5cf6', 1.000000, 1.000000, 1.000000, 1.000000, 1.000000, 'Home to the largest US airbase in the region and a key mediator. QTR Coin tracks diplomatic missions and energy exports.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ACHIEVEMENT DEFINITIONS SEED
-- ============================================================
INSERT INTO achievement_definitions (id, name, description, icon, rarity, points, requirement_type, requirement_value) VALUES
  ('first_trade', 'First Blood', 'Execute your first trade', '⚔️', 'common', 10, 'trades', 1),
  ('ten_trades', 'Active Trader', 'Complete 10 trades', '📊', 'common', 25, 'trades', 10),
  ('fifty_trades', 'Market Veteran', 'Complete 50 trades', '🏆', 'rare', 100, 'trades', 50),
  ('first_profit', 'Green Day', 'Close your first profitable trade', '💚', 'common', 15, 'profit', 0.01),
  ('double_up', '100% Return', 'Double your starting balance', '🚀', 'epic', 250, 'portfolio_value', 20000),
  ('diamond_hands', 'Diamond Hands', 'Hold a position for 7+ days', '💎', 'rare', 75, 'hold_days', 7),
  ('conflict_oracle', 'Conflict Oracle', 'Profit from 5 geopolitical events', '🔮', 'legendary', 500, 'event_profits', 5),
  ('whale', 'Whale Alert', 'Execute a single trade over $5,000', '🐋', 'rare', 100, 'single_trade', 5000),
  ('diversified', 'Diplomat', 'Hold 5 or more different coins', '🌍', 'common', 30, 'unique_holdings', 5),
  ('streak_7', 'Week Warrior', '7-day login streak', '🔥', 'rare', 75, 'login_streak', 7),
  ('streak_30', 'Iron Will', '30-day login streak', '⚡', 'epic', 300, 'login_streak', 30),
  ('referral_1', 'Ambassador', 'Refer your first friend', '🤝', 'common', 50, 'referrals', 1),
  ('referral_5', 'Recruiter', 'Refer 5 friends', '📣', 'rare', 200, 'referrals', 5),
  ('top_10', 'Elite Trader', 'Reach top 10 on leaderboard', '👑', 'epic', 400, 'rank', 10),
  ('top_1', 'Market King', 'Reach #1 on leaderboard', '🏅', 'legendary', 1000, 'rank', 1),
  ('loss_recovery', 'Comeback Kid', 'Recover from a 50% drawdown', '💪', 'epic', 300, 'recovery', 50),
  ('early_adopter', 'Early Adopter', 'Join during beta launch', '🌟', 'legendary', 250, 'special', 1),
  ('news_trader', 'Breaking News', 'Trade within 5 minutes of a headline', '📰', 'rare', 100, 'news_trade', 1),
  ('portfolio_100k', 'Six Figures', 'Reach $100,000 portfolio value', '💰', 'legendary', 750, 'portfolio_value', 100000),
  ('all_coins', 'World Tour', 'Hold all 10 coins at once', '🗺️', 'epic', 350, 'unique_holdings', 10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SIMULATED NEWS EVENTS SEED
-- ============================================================
INSERT INTO news_events (title, summary, category, affected_coins, sentiment_impact, is_breaking, is_simulated, published_at) VALUES
  ('US Navy deploys carrier group to Persian Gulf amid rising tensions', 'The USS Abraham Lincoln carrier strike group has been ordered to the Persian Gulf as a show of force following recent provocations from Iranian-backed militias.', 'military', ARRAY['USA', 'IRN', 'IRQ'], 15.0, true, true, NOW() - INTERVAL '2 hours'),
  ('Iran announces nuclear enrichment milestone, IAEA inspectors denied access', 'Iranian officials confirmed they have enriched uranium to 90% purity at the Fordow facility. International Atomic Energy Agency inspectors were turned away for the third consecutive week.', 'nuclear', ARRAY['IRN', 'ISR', 'USA'], -20.0, true, true, NOW() - INTERVAL '4 hours'),
  ('Saudi Arabia and Iran restore full diplomatic ties in historic agreement', 'In a landmark deal brokered by China, Saudi Arabia and Iran have agreed to restore diplomatic relations and reopen embassies, signaling a potential thaw in their decades-long rivalry.', 'diplomacy', ARRAY['SAU', 'IRN', 'UAE', 'QTR'], 25.0, false, true, NOW() - INTERVAL '6 hours'),
  ('Houthi missiles target Red Sea shipping lanes, oil tanker struck', 'Yemen-based Houthi forces launched a coordinated missile and drone attack targeting commercial shipping in the Red Sea. An oil tanker was struck, causing a fuel spill.', 'military', ARRAY['YEM', 'SAU', 'UAE'], -15.0, true, true, NOW() - INTERVAL '8 hours'),
  ('Israel conducts airstrikes on Hezbollah weapons depot in Lebanon', 'The Israeli Air Force carried out precision strikes on what officials describe as a Hezbollah weapons storage facility in the Bekaa Valley, Lebanon.', 'military', ARRAY['ISR', 'LBN', 'IRN'], -10.0, false, true, NOW() - INTERVAL '12 hours'),
  ('Qatar mediates Gaza ceasefire talks, parties reach partial agreement', 'Qatari mediators announced a partial humanitarian ceasefire agreement in Gaza, with a commitment to resume broader negotiations within two weeks.', 'diplomacy', ARRAY['QTR', 'ISR', 'USA'], 20.0, true, true, NOW() - INTERVAL '16 hours'),
  ('OPEC+ announces surprise oil production cut, Gulf states rally', 'OPEC+ members led by Saudi Arabia agreed to an emergency production cut of 1.5 million barrels per day, sending oil prices surging and boosting Gulf state coin values.', 'energy', ARRAY['SAU', 'UAE', 'IRQ', 'QTR'], 18.0, false, true, NOW() - INTERVAL '20 hours'),
  ('Iraq parliament votes to expel US military forces from bases', 'The Iraqi parliament passed a non-binding resolution calling for the withdrawal of US-led coalition forces from Iraqi soil, escalating tensions with Washington.', 'political', ARRAY['IRQ', 'USA', 'IRN'], -12.0, false, true, NOW() - INTERVAL '1 day'),
  ('Syria ceasefire holds as reconstruction talks begin in Geneva', 'Representatives from twelve nations convened in Geneva to discuss Syria reconstruction funding, with a fragile ceasefire entering its 30th day.', 'diplomacy', ARRAY['SYR', 'USA', 'SAU'], 15.0, false, true, NOW() - INTERVAL '1 day 4 hours'),
  ('Lebanon government formation talks collapse amid Hezbollah deadlock', 'Efforts to form a new Lebanese government collapsed for the third time as Hezbollah-backed factions rejected Western-backed candidate nominations.', 'political', ARRAY['LBN', 'USA', 'ISR'], -8.0, false, true, NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- ============================================================
-- INITIAL WEEKLY TOURNAMENT
-- ============================================================
INSERT INTO tournaments (name, start_date, end_date, starting_balance, status)
VALUES (
  'Beta Week Championship',
  DATE_TRUNC('week', NOW()),
  DATE_TRUNC('week', NOW()) + INTERVAL '7 days',
  10000.00,
  'active'
)
ON CONFLICT DO NOTHING;
