-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  balance DECIMAL(20,2) DEFAULT 10000.00 NOT NULL,
  referral_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(4), 'hex'),
  referred_by UUID REFERENCES profiles(id),
  login_streak INTEGER DEFAULT 0,
  last_login_date DATE,
  total_trades INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COINS
-- ============================================================
CREATE TABLE IF NOT EXISTS coins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  flag_emoji TEXT NOT NULL,
  color TEXT DEFAULT '#ffffff',
  current_price DECIMAL(20,6) DEFAULT 1.000000 NOT NULL,
  open_price DECIMAL(20,6) DEFAULT 1.000000 NOT NULL,
  price_24h_ago DECIMAL(20,6) DEFAULT 1.000000 NOT NULL,
  high_24h DECIMAL(20,6) DEFAULT 1.000000 NOT NULL,
  low_24h DECIMAL(20,6) DEFAULT 1.000000 NOT NULL,
  volume_24h DECIMAL(20,2) DEFAULT 0 NOT NULL,
  buy_volume_1h DECIMAL(20,2) DEFAULT 0 NOT NULL,
  sell_volume_1h DECIMAL(20,2) DEFAULT 0 NOT NULL,
  total_holders INTEGER DEFAULT 0 NOT NULL,
  sentiment DECIMAL(5,2) DEFAULT 50.00 NOT NULL CHECK (sentiment >= 0 AND sentiment <= 100),
  description TEXT,
  market_cap DECIMAL(20,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRICE HISTORY (OHLCV candles)
-- ============================================================
CREATE TABLE IF NOT EXISTS price_history (
  id BIGSERIAL PRIMARY KEY,
  coin_id TEXT REFERENCES coins(id) ON DELETE CASCADE,
  open DECIMAL(20,6) NOT NULL,
  high DECIMAL(20,6) NOT NULL,
  low DECIMAL(20,6) NOT NULL,
  close DECIMAL(20,6) NOT NULL,
  volume DECIMAL(20,2) DEFAULT 0,
  interval TEXT DEFAULT '5m',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_coin_time ON price_history(coin_id, timestamp DESC);

-- ============================================================
-- HOLDINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  coin_id TEXT REFERENCES coins(id),
  quantity DECIMAL(20,8) DEFAULT 0 NOT NULL,
  avg_buy_price DECIMAL(20,6) DEFAULT 0 NOT NULL,
  total_invested DECIMAL(20,2) DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, coin_id)
);

-- ============================================================
-- TRADES
-- ============================================================
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  coin_id TEXT REFERENCES coins(id),
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  quantity DECIMAL(20,8) NOT NULL,
  price DECIMAL(20,6) NOT NULL,
  total_value DECIMAL(20,2) NOT NULL,
  fee DECIMAL(20,4) DEFAULT 0,
  pnl DECIMAL(20,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trades_user ON trades(user_id, created_at DESC);
CREATE INDEX idx_trades_coin ON trades(coin_id, created_at DESC);

-- ============================================================
-- WATCHLISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS watchlists (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  coin_id TEXT REFERENCES coins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, coin_id)
);

-- ============================================================
-- REFERRALS
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bonus_amount DECIMAL(20,2) DEFAULT 500.00,
  bonus_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_id)
);

-- ============================================================
-- ACHIEVEMENT DEFINITIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points INTEGER DEFAULT 10,
  requirement_type TEXT,
  requirement_value DECIMAL(20,2)
);

-- ============================================================
-- USER ACHIEVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievement_definitions(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- ============================================================
-- NEWS EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS news_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  source TEXT DEFAULT 'Terra Intelligence',
  url TEXT,
  category TEXT DEFAULT 'geopolitical',
  affected_coins TEXT[] DEFAULT '{}',
  sentiment_impact DECIMAL(5,2) DEFAULT 0 CHECK (sentiment_impact >= -100 AND sentiment_impact <= 100),
  is_breaking BOOLEAN DEFAULT FALSE,
  is_simulated BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_published ON news_events(published_at DESC);

-- ============================================================
-- TOURNAMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  starting_balance DECIMAL(20,2) DEFAULT 10000.00,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_participants (
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(20,2) DEFAULT 10000.00,
  portfolio_value DECIMAL(20,2) DEFAULT 10000.00,
  rank INTEGER,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tournament_id, user_id)
);

-- ============================================================
-- WAITLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  referral_code TEXT,
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRICE ENGINE STATE
-- ============================================================
CREATE TABLE IF NOT EXISTS price_engine_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_run TIMESTAMPTZ DEFAULT NOW(),
  next_event_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 minutes',
  market_regime TEXT DEFAULT 'normal' CHECK (market_regime IN ('normal', 'volatile', 'trending', 'crash'))
);

INSERT INTO price_engine_state (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner write
CREATE POLICY "Profiles public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles owner update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Holdings: owner only
CREATE POLICY "Holdings owner read" ON holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Holdings owner write" ON holdings FOR ALL USING (auth.uid() = user_id);

-- Trades: owner read, public aggregate
CREATE POLICY "Trades owner read" ON trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Trades owner insert" ON trades FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Watchlists: owner only
CREATE POLICY "Watchlists owner" ON watchlists FOR ALL USING (auth.uid() = user_id);

-- Referrals: participants
CREATE POLICY "Referrals read" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- User achievements: public read
CREATE POLICY "Achievements public read" ON user_achievements FOR SELECT USING (true);
CREATE POLICY "Achievements owner write" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER holdings_updated_at BEFORE UPDATE ON holdings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  base_username := LOWER(SPLIT_PART(NEW.email, '@', 1));
  base_username := REGEXP_REPLACE(base_username, '[^a-z0-9]', '', 'g');
  IF LENGTH(base_username) < 3 THEN
    base_username := 'trader' || base_username;
  END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  INSERT INTO profiles (id, username, display_name)
  VALUES (NEW.id, final_username, COALESCE(NEW.raw_user_meta_data->>'full_name', final_username));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
