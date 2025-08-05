-- Supabase Schema for WOM Backend
-- Optimized for free tier (500MB database)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE launchpad_type AS ENUM ('UNKNOWN', 'PINK_SALE', 'DEX_TOOLS', 'DEX_SCREENER');

-- Tokens table (optimized for free tier)
CREATE TABLE tokens (
    token_symbol VARCHAR(50) PRIMARY KEY,
    token_name VARCHAR(255),
    image_url TEXT,
    address VARCHAR(255),
    age VARCHAR(50),
    volume_usd DECIMAL(20, 2),
    liquidity_usd DECIMAL(20, 2),
    market_cap_usd DECIMAL(20, 2),
    dex_url TEXT,
    pricechange1h DECIMAL(10, 4),
    wom_score DECIMAL(5, 2) DEFAULT 0,
    tweet_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    launchpad launchpad_type DEFAULT 'UNKNOWN',
    avg_followers_count INTEGER DEFAULT 0,
    first_spotted_by VARCHAR(255)
);

-- Tweets table (optimized for free tier)
CREATE TABLE tweets (
    tweet_id VARCHAR(255) PRIMARY KEY,
    token_symbol VARCHAR(50) REFERENCES tokens(token_symbol) ON DELETE CASCADE,
    text TEXT,
    followers_count INTEGER DEFAULT 0,
    user_name VARCHAR(255),
    profile_pic TEXT,
    created_at TIMESTAMPTZ,
    wom_score DECIMAL(5, 2) DEFAULT 0,
    tweet_url TEXT
);

-- Indexes for performance (essential for free tier)
CREATE INDEX idx_tokens_active ON tokens(is_active);
CREATE INDEX idx_tokens_wom_score ON tokens(wom_score DESC);
CREATE INDEX idx_tokens_created_at ON tokens(created_at);
CREATE INDEX idx_tweets_token_symbol ON tweets(token_symbol);
CREATE INDEX idx_tweets_created_at ON tweets(created_at);
CREATE INDEX idx_tweets_wom_score ON tweets(wom_score DESC);

-- Row Level Security (RLS) policies
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for API)
CREATE POLICY "Allow public read access to tokens" ON tokens
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to tweets" ON tweets
    FOR SELECT USING (true);

-- Allow authenticated users to insert/update (for your app)
CREATE POLICY "Allow authenticated insert to tokens" ON tokens
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update to tokens" ON tokens
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert to tweets" ON tweets
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_token_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update token stats when tweets are added/removed
    UPDATE tokens 
    SET 
        tweet_count = (
            SELECT COUNT(*) 
            FROM tweets 
            WHERE token_symbol = NEW.token_symbol
        ),
        last_seen_at = NOW()
    WHERE token_symbol = NEW.token_symbol;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update token stats
CREATE TRIGGER update_token_stats_trigger
    AFTER INSERT OR DELETE ON tweets
    FOR EACH ROW
    EXECUTE FUNCTION update_token_stats();

-- Function to clean old tweets (for maintenance)
CREATE OR REPLACE FUNCTION clean_old_tweets()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM tweets 
    WHERE created_at < NOW() - INTERVAL '48 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to deactivate low activity tokens
CREATE OR REPLACE FUNCTION deactivate_low_activity_tokens()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE tokens 
    SET is_active = FALSE 
    WHERE 
        (created_at < NOW() - INTERVAL '3 hours' AND tweet_count < 20)
        OR (created_at < NOW() - INTERVAL '24 hours' AND tweet_count < 10);
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql; 