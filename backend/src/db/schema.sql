-- ScoutTree Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT FALSE,
  google_id VARCHAR(255) UNIQUE,

  -- Subscription information
  subscription_tier VARCHAR(50) DEFAULT 'free', -- free, pro, team
  subscription_status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255),
  subscription_ends_at TIMESTAMP WITH TIME ZONE,

  -- Usage tracking
  reports_used_this_month INTEGER DEFAULT 0,
  reports_limit INTEGER DEFAULT 3,
  last_report_at TIMESTAMP WITH TIME ZONE,

  -- API access
  api_key VARCHAR(255) UNIQUE,
  api_key_created_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_api_key ON users(api_key);

-- Teams table (for team subscriptions)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Subscription
  subscription_tier VARCHAR(50) DEFAULT 'team',
  stripe_subscription_id VARCHAR(255),
  reports_limit INTEGER DEFAULT 500,
  reports_used_this_month INTEGER DEFAULT 0,

  -- Settings
  max_members INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE
);

-- Team members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- Scout reports table
CREATE TABLE scout_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Target player information
  target_username VARCHAR(255) NOT NULL,
  target_platform VARCHAR(50) NOT NULL, -- lichess, chess.com, multiple
  target_color VARCHAR(10) NOT NULL, -- white, black, both
  target_time_control VARCHAR(50),

  -- Report data (JSONB for flexibility)
  report_data JSONB NOT NULL,

  -- Processing metadata
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  job_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  processing_time_ms INTEGER,

  -- Request parameters
  max_games_requested INTEGER DEFAULT 500,
  include_engine_analysis BOOLEAN DEFAULT TRUE,

  -- Cache and optimization
  cache_hit BOOLEAN DEFAULT FALSE,
  games_analyzed INTEGER DEFAULT 0,
  engine_nodes_analyzed INTEGER DEFAULT 0,

  -- Error tracking
  error_message TEXT,
  error_stack TEXT,

  -- Access control
  is_public BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(255) UNIQUE,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_reports_user ON scout_reports(user_id);
CREATE INDEX idx_reports_team ON scout_reports(team_id);
CREATE INDEX idx_reports_job ON scout_reports(job_id);
CREATE INDEX idx_reports_status ON scout_reports(status);
CREATE INDEX idx_reports_target ON scout_reports(target_username, target_platform);
CREATE INDEX idx_reports_created ON scout_reports(created_at DESC);
CREATE INDEX idx_reports_share_token ON scout_reports(share_token) WHERE share_token IS NOT NULL;

-- GIN index for JSONB search
CREATE INDEX idx_reports_data ON scout_reports USING GIN(report_data);

-- Games cache table (to avoid re-fetching from platforms)
CREATE TABLE games_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(50) NOT NULL,
  username VARCHAR(255) NOT NULL,

  -- Game identification
  game_id VARCHAR(255) NOT NULL,
  game_url VARCHAR(500),

  -- Game data
  pgn TEXT NOT NULL,
  time_control VARCHAR(50),
  player_color VARCHAR(10), -- white or black
  result VARCHAR(10), -- 1-0, 0-1, 1/2-1/2
  date_played DATE,

  -- Metadata
  white_player VARCHAR(255),
  black_player VARCHAR(255),
  white_rating INTEGER,
  black_rating INTEGER,
  opening_eco VARCHAR(10),
  opening_name VARCHAR(255),

  -- Timestamps
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Unique constraint
  UNIQUE(platform, game_id)
);

CREATE INDEX idx_games_cache_platform_user ON games_cache(platform, username);
CREATE INDEX idx_games_cache_expires ON games_cache(expires_at);
CREATE INDEX idx_games_cache_game_id ON games_cache(platform, game_id);

-- Engine analysis cache (FEN-based caching)
CREATE TABLE engine_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fen VARCHAR(255) NOT NULL UNIQUE,

  -- Analysis results
  depth INTEGER NOT NULL,
  score_cp INTEGER, -- centipawn score
  score_mate INTEGER, -- mate in X moves
  best_move VARCHAR(10),
  pv TEXT, -- principal variation

  -- Metadata
  engine_version VARCHAR(50),
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_engine_cache_fen ON engine_cache(fen);
CREATE INDEX idx_engine_cache_expires ON engine_cache(expires_at);

-- Usage tracking table (for analytics and rate limiting)
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Action tracking
  action VARCHAR(100) NOT NULL, -- scout_report_created, api_call, etc.
  resource_type VARCHAR(50),
  resource_id UUID,

  -- Request details
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_user ON usage_logs(user_id, created_at DESC);
CREATE INDEX idx_usage_logs_team ON usage_logs(team_id, created_at DESC);
CREATE INDEX idx_usage_logs_action ON usage_logs(action, created_at DESC);

-- Fuzzy username matches cache (for autocomplete and matching)
CREATE TABLE username_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(50) NOT NULL,
  search_query VARCHAR(255) NOT NULL,

  -- Match results (JSONB array of matches)
  matches JSONB NOT NULL,

  -- Cache management
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(platform, search_query)
);

CREATE INDEX idx_username_matches_platform_query ON username_matches(platform, search_query);
CREATE INDEX idx_username_matches_expires ON username_matches(expires_at);

-- Payment transactions table (for audit trail)
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Stripe information
  stripe_payment_intent_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),

  -- Transaction details
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  description TEXT,
  status VARCHAR(50) NOT NULL, -- succeeded, failed, pending, refunded

  -- Subscription context
  subscription_tier VARCHAR(50),
  billing_period_start TIMESTAMP WITH TIME ZONE,
  billing_period_end TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON payment_transactions(user_id);
CREATE INDEX idx_transactions_team ON payment_transactions(team_id);
CREATE INDEX idx_transactions_stripe_intent ON payment_transactions(stripe_payment_intent_id);

-- Refresh tokens for JWT
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP WITH TIME ZONE,

  -- Device tracking
  user_agent TEXT,
  ip_address INET
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Functions and triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Reset monthly usage counters (run via cron or scheduled job)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE users SET reports_used_this_month = 0;
  UPDATE teams SET reports_used_this_month = 0;
END;
$$ LANGUAGE plpgsql;

-- Clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM games_cache WHERE expires_at < NOW();
  DELETE FROM engine_cache WHERE expires_at < NOW();
  DELETE FROM username_matches WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Views for common queries

-- Active users with subscription details
CREATE VIEW active_users_view AS
SELECT
  u.id,
  u.email,
  u.full_name,
  u.subscription_tier,
  u.subscription_status,
  u.reports_used_this_month,
  u.reports_limit,
  u.created_at,
  u.last_login_at,
  CASE
    WHEN u.subscription_tier = 'free' THEN u.reports_limit - u.reports_used_this_month
    WHEN u.subscription_tier = 'pro' THEN u.reports_limit - u.reports_used_this_month
    ELSE 999999
  END as reports_remaining
FROM users u
WHERE u.is_active = TRUE AND u.deleted_at IS NULL;

-- Recent reports with user info
CREATE VIEW recent_reports_view AS
SELECT
  sr.id,
  sr.target_username,
  sr.target_platform,
  sr.status,
  sr.created_at,
  sr.completed_at,
  sr.processing_time_ms,
  sr.games_analyzed,
  u.email as user_email,
  u.subscription_tier,
  t.name as team_name
FROM scout_reports sr
LEFT JOIN users u ON sr.user_id = u.id
LEFT JOIN teams t ON sr.team_id = t.id
WHERE sr.deleted_at IS NULL
ORDER BY sr.created_at DESC;

-- Insert sample data for development
INSERT INTO users (email, password_hash, full_name, subscription_tier, reports_limit, is_admin)
VALUES
  ('admin@scouttree.com', '$2b$10$abcdefghijklmnopqrstuv', 'Admin User', 'pro', 1000, TRUE),
  ('demo@scouttree.com', '$2b$10$abcdefghijklmnopqrstuv', 'Demo User', 'free', 3, FALSE);

COMMENT ON TABLE users IS 'User accounts with authentication and subscription information';
COMMENT ON TABLE scout_reports IS 'Generated opponent scouting reports with JSONB data storage';
COMMENT ON TABLE games_cache IS 'Cached games from chess platforms to reduce API calls';
COMMENT ON TABLE engine_cache IS 'Stockfish analysis results cached by FEN position';
COMMENT ON TABLE usage_logs IS 'Activity tracking for analytics and rate limiting';
