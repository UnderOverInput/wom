const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/search/tokens - Search tokens by symbol or name
router.get('/tokens', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    let query = supabase
      .from('tokens')
      .select('*')
      .or(`token_symbol.ilike.%${q}%,token_name.ilike.%${q}%`)
      .eq('is_active', true)
      .order('wom_score', { ascending: false });

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { data, error, count } = await query
      .range(offset, offset + parseInt(limit) - 1)
      .select('*', { count: 'exact' });

    if (error) {
      throw error;
    }

    res.json({
      tokens: data || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
      query: q
    });
  } catch (error) {
    console.error('Error in GET /search/tokens:', error);
    res.status(500).json({ error: 'Failed to search tokens' });
  }
});

// GET /api/search/tweets - Search tweets by text content
router.get('/tweets', async (req, res) => {
  try {
    const { q, token_symbol, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    let query = supabase
      .from('tweets')
      .select('*')
      .ilike('text', `%${q}%`)
      .order('created_at', { ascending: false });

    if (token_symbol) {
      query = query.eq('token_symbol', token_symbol.toUpperCase());
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { data, error, count } = await query
      .range(offset, offset + parseInt(limit) - 1)
      .select('*', { count: 'exact' });

    if (error) {
      throw error;
    }

    res.json({
      tweets: data || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
      query: q,
      token_symbol
    });
  } catch (error) {
    console.error('Error in GET /search/tweets:', error);
    res.status(500).json({ error: 'Failed to search tweets' });
  }
});

// GET /api/search/trending - Get trending tokens based on WOM score
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10, timeframe = '24h' } = req.query;
    
    let timeFilter;
    switch (timeframe) {
      case '1h':
        timeFilter = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        break;
      case '6h':
        timeFilter = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
        break;
      case '24h':
      default:
        timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        break;
    }

    // Get trending tokens based on WOM score and recent activity
    const { data: tokens, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('is_active', true)
      .gte('last_seen_at', timeFilter)
      .order('wom_score', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    res.json({
      trending: tokens || [],
      timeframe,
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error in GET /search/trending:', error);
    res.status(500).json({ error: 'Failed to get trending tokens' });
  }
});

// GET /api/search/analytics - Get analytics summary
router.get('/analytics', async (req, res) => {
  try {
    // Get total counts
    const { count: totalTokens } = await supabase
      .from('tokens')
      .select('*', { count: 'exact', head: true });

    const { count: totalTweets } = await supabase
      .from('tweets')
      .select('*', { count: 'exact', head: true });

    const { count: activeTokens } = await supabase
      .from('tokens')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get average WOM score
    const { data: avgWOM } = await supabase
      .from('tokens')
      .select('wom_score')
      .eq('is_active', true)
      .not('wom_score', 'is', null);

    const averageWOMScore = avgWOM && avgWOM.length > 0 
      ? avgWOM.reduce((sum, token) => sum + token.wom_score, 0) / avgWOM.length 
      : 0;

    // Get recent activity (last 24 hours)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { count: recentTweets } = await supabase
      .from('tweets')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last24h);

    const { count: newTokens } = await supabase
      .from('tokens')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last24h);

    res.json({
      summary: {
        total_tokens: totalTokens || 0,
        total_tweets: totalTweets || 0,
        active_tokens: activeTokens || 0,
        average_wom_score: Math.round(averageWOMScore * 100) / 100
      },
      recent_activity: {
        tweets_last_24h: recentTweets || 0,
        new_tokens_last_24h: newTokens || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET /search/analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

module.exports = router; 