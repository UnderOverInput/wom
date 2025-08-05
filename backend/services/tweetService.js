const axios = require('axios');

class TweetService {
  async processTweets(supabase) {
    try {
      // Get active tokens that need tweet processing
      const { data: activeTokens } = await supabase
        .from('tokens')
        .select('token_symbol')
        .eq('is_active', true)
        .limit(10); // Process in batches to stay within free tier limits

      for (const token of activeTokens || []) {
        await this.fetchTweetsForToken(supabase, token.token_symbol);
      }
    } catch (error) {
      console.error('Error processing tweets:', error);
    }
  }

  async fetchTweetsForToken(supabase, tokenSymbol) {
    try {
      // Use a lightweight approach for free tier
      // In production, you'd use Twitter API v2
      const tweets = await this.fetchTweetsFromMockAPI(tokenSymbol);
      
      for (const tweet of tweets) {
        await this.upsertTweet(supabase, tweet);
      }
    } catch (error) {
      console.error(`Error fetching tweets for ${tokenSymbol}:`, error);
    }
  }

  async fetchTweetsFromMockAPI(tokenSymbol) {
    // Mock implementation for free tier
    // In production, replace with actual Twitter API integration
    const mockTweets = [
      {
        tweet_id: `tweet_${tokenSymbol}_${Date.now()}_1`,
        token_symbol: tokenSymbol,
        text: `Just discovered $${tokenSymbol}! Looks promising 🚀`,
        followers_count: Math.floor(Math.random() * 10000) + 100,
        user_name: `crypto_trader_${Math.floor(Math.random() * 1000)}`,
        profile_pic: `https://picsum.photos/50/50?random=${Math.floor(Math.random() * 1000)}`,
        created_at: new Date().toISOString(),
        wom_score: (Math.random() * 100).toFixed(2),
        tweet_url: `https://twitter.com/user/status/${Date.now()}`
      },
      {
        tweet_id: `tweet_${tokenSymbol}_${Date.now()}_2`,
        token_symbol: tokenSymbol,
        text: `$${tokenSymbol} is mooning! Don't miss out 💎`,
        followers_count: Math.floor(Math.random() * 50000) + 1000,
        user_name: `whale_${Math.floor(Math.random() * 1000)}`,
        profile_pic: `https://picsum.photos/50/50?random=${Math.floor(Math.random() * 1000)}`,
        created_at: new Date().toISOString(),
        wom_score: (Math.random() * 100).toFixed(2),
        tweet_url: `https://twitter.com/user/status/${Date.now() + 1}`
      }
    ];

    return mockTweets;
  }

  async upsertTweet(supabase, tweetData) {
    try {
      const { error } = await supabase
        .from('tweets')
        .upsert(tweetData, {
          onConflict: 'tweet_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error upserting tweet:', error);
      }
    } catch (error) {
      console.error('Error in upsertTweet:', error);
    }
  }

  async getTweetsForToken(supabase, tokenSymbol, { page = 1, limit = 20 } = {}) {
    try {
      const offset = (page - 1) * limit;
      const { data, error, count } = await supabase
        .from('tweets')
        .select('*')
        .eq('token_symbol', tokenSymbol)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
        .select('*', { count: 'exact' });

      if (error) {
        throw error;
      }

      return {
        tweets: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error getting tweets:', error);
      throw error;
    }
  }

  async getStoredTweets(supabase, tokenSymbol) {
    try {
      const { data, error } = await supabase
        .from('tweets')
        .select('*')
        .eq('token_symbol', tokenSymbol)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting stored tweets:', error);
      throw error;
    }
  }

  async cleanupOldTweets(supabase) {
    try {
      // Use the database function to clean old tweets
      const { error } = await supabase.rpc('clean_old_tweets');
      
      if (error) {
        console.error('Error cleaning up old tweets:', error);
      } else {
        console.log('Tweet cleanup completed');
      }
    } catch (error) {
      console.error('Error in cleanupOldTweets:', error);
    }
  }

  async calculateWOMScore(supabase, tokenSymbol) {
    try {
      // Get recent tweets for the token
      const { data: tweets } = await supabase
        .from('tweets')
        .select('wom_score, created_at')
        .eq('token_symbol', tokenSymbol)
        .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()); // Last 48 hours

      if (!tweets || tweets.length === 0) {
        return 0;
      }

      // Calculate weighted average WOM score
      const now = new Date();
      let totalWeightedScore = 0;
      let totalWeight = 0;

      for (const tweet of tweets) {
        const tweetAge = (now - new Date(tweet.created_at)) / (1000 * 60 * 60); // Hours
        const weight = Math.exp(-tweetAge / 24); // Exponential decay over 24 hours
        totalWeightedScore += tweet.wom_score * weight;
        totalWeight += weight;
      }

      const averageWOMScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

      // Update token's WOM score
      const { error } = await supabase
        .from('tokens')
        .update({ wom_score: averageWOMScore })
        .eq('token_symbol', tokenSymbol);

      if (error) {
        console.error('Error updating WOM score:', error);
      }

      return averageWOMScore;
    } catch (error) {
      console.error('Error calculating WOM score:', error);
      return 0;
    }
  }
}

module.exports = new TweetService(); 