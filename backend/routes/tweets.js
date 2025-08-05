const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const tweetService = require('../services/tweetService');

// GET /api/tweets/:symbol - Get tweets for a specific token
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const result = await tweetService.getTweetsForToken(supabase, symbol.toUpperCase(), {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json(result);
  } catch (error) {
    console.error('Error in GET /tweets/:symbol:', error);
    res.status(500).json({ error: 'Failed to fetch tweets' });
  }
});

// GET /api/tweets/:symbol/stored - Get stored tweets for a token
router.get('/:symbol/stored', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const tweets = await tweetService.getStoredTweets(supabase, symbol.toUpperCase());
    
    res.json({ tweets });
  } catch (error) {
    console.error('Error in GET /tweets/:symbol/stored:', error);
    res.status(500).json({ error: 'Failed to fetch stored tweets' });
  }
});

// POST /api/tweets - Create a new tweet
router.post('/', async (req, res) => {
  try {
    const tweetData = req.body;
    
    // Validate required fields
    if (!tweetData.tweet_id || !tweetData.token_symbol || !tweetData.text) {
      return res.status(400).json({ 
        error: 'Tweet ID, token symbol, and text are required' 
      });
    }

    const { data, error } = await supabase
      .from('tweets')
      .insert([tweetData])
      .select()
      .single();

    if (error) {
      console.error('Error creating tweet:', error);
      return res.status(400).json({ error: 'Failed to create tweet' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in POST /tweets:', error);
    res.status(500).json({ error: 'Failed to create tweet' });
  }
});

// PUT /api/tweets/:id - Update a tweet
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const { data, error } = await supabase
      .from('tweets')
      .update(updateData)
      .eq('tweet_id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tweet:', error);
      return res.status(400).json({ error: 'Failed to update tweet' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in PUT /tweets/:id:', error);
    res.status(500).json({ error: 'Failed to update tweet' });
  }
});

// DELETE /api/tweets/:id - Delete a tweet
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('tweets')
      .delete()
      .eq('tweet_id', id);

    if (error) {
      console.error('Error deleting tweet:', error);
      return res.status(400).json({ error: 'Failed to delete tweet' });
    }

    res.json({ message: 'Tweet deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /tweets/:id:', error);
    res.status(500).json({ error: 'Failed to delete tweet' });
  }
});

// GET /api/tweets/:symbol/sentiment - Get sentiment analysis for a token
router.get('/:symbol/sentiment', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Get recent tweets for sentiment analysis
    const { data: tweets } = await supabase
      .from('tweets')
      .select('wom_score, created_at')
      .eq('token_symbol', symbol.toUpperCase())
      .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (!tweets || tweets.length === 0) {
      return res.json({
        token_symbol: symbol.toUpperCase(),
        average_sentiment: 0,
        tweet_count: 0,
        sentiment_distribution: {
          positive: 0,
          neutral: 0,
          negative: 0
        }
      });
    }

    // Calculate sentiment statistics
    const totalScore = tweets.reduce((sum, tweet) => sum + tweet.wom_score, 0);
    const averageSentiment = totalScore / tweets.length;

    const sentimentDistribution = tweets.reduce((acc, tweet) => {
      if (tweet.wom_score >= 70) acc.positive++;
      else if (tweet.wom_score <= 30) acc.negative++;
      else acc.neutral++;
      return acc;
    }, { positive: 0, neutral: 0, negative: 0 });

    res.json({
      token_symbol: symbol.toUpperCase(),
      average_sentiment: Math.round(averageSentiment * 100) / 100,
      tweet_count: tweets.length,
      sentiment_distribution: sentimentDistribution,
      recent_tweets: tweets.slice(0, 5) // Last 5 tweets
    });
  } catch (error) {
    console.error('Error in GET /tweets/:symbol/sentiment:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

module.exports = router; 