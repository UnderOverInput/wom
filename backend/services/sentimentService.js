class SentimentService {
  constructor() {
    // Simple keyword-based sentiment analysis for free tier
    // In production, you'd use a proper NLP service
    this.positiveKeywords = [
      'moon', 'mooning', 'pump', 'bullish', 'buy', 'buying', 'hodl', 'diamond', 'gem',
      'rocket', '🚀', '💎', '🔥', '💪', 'strong', 'amazing', 'incredible', 'awesome',
      'profit', 'gains', 'winning', 'success', 'breakout', 'rally', 'surge', 'jump'
    ];

    this.negativeKeywords = [
      'dump', 'dumping', 'bearish', 'sell', 'selling', 'scam', 'rug', 'pull',
      'crash', 'fall', 'drop', 'decline', 'loss', 'losing', 'weak', 'bad',
      '💩', '😡', '😭', 'sad', 'terrible', 'awful', 'horrible', 'disaster'
    ];

    this.neutralKeywords = [
      'token', 'coin', 'crypto', 'blockchain', 'defi', 'trading', 'market',
      'price', 'volume', 'liquidity', 'chart', 'analysis', 'technical'
    ];
  }

  async analyzeSentiments(supabase) {
    try {
      // Get tweets that need sentiment analysis
      const { data: tweets } = await supabase
        .from('tweets')
        .select('tweet_id, text, token_symbol')
        .is('wom_score', null)
        .limit(50); // Process in batches

      for (const tweet of tweets || []) {
        const sentimentScore = this.analyzeTextSentiment(tweet.text);
        await this.updateTweetSentiment(supabase, tweet.tweet_id, sentimentScore);
      }

      console.log(`Analyzed sentiment for ${tweets?.length || 0} tweets`);
    } catch (error) {
      console.error('Error analyzing sentiments:', error);
    }
  }

  analyzeTextSentiment(text) {
    if (!text) return 50; // Neutral if no text

    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    // Count keyword matches
    for (const keyword of this.positiveKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        positiveScore += 1;
      }
    }

    for (const keyword of this.negativeKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        negativeScore += 1;
      }
    }

    for (const keyword of this.neutralKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        neutralScore += 1;
      }
    }

    // Calculate sentiment score (0-100)
    const totalKeywords = positiveScore + negativeScore + neutralScore;
    if (totalKeywords === 0) {
      return 50; // Neutral if no keywords found
    }

    // Weighted calculation
    const positiveWeight = positiveScore * 0.6;
    const negativeWeight = negativeScore * 0.3;
    const neutralWeight = neutralScore * 0.1;

    const sentimentScore = Math.min(100, Math.max(0, 
      (positiveWeight / totalKeywords) * 100 - (negativeWeight / totalKeywords) * 100 + 50
    ));

    return Math.round(sentimentScore);
  }

  async updateTweetSentiment(supabase, tweetId, sentimentScore) {
    try {
      const { error } = await supabase
        .from('tweets')
        .update({ wom_score: sentimentScore })
        .eq('tweet_id', tweetId);

      if (error) {
        console.error('Error updating tweet sentiment:', error);
      }
    } catch (error) {
      console.error('Error in updateTweetSentiment:', error);
    }
  }

  async recalculateTokenWOMScore(supabase, tokenSymbol) {
    try {
      // Get all tweets for the token
      const { data: tweets } = await supabase
        .from('tweets')
        .select('wom_score, created_at')
        .eq('token_symbol', tokenSymbol)
        .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()); // Last 48 hours

      if (!tweets || tweets.length === 0) {
        return 0;
      }

      // Calculate weighted average
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
        console.error('Error updating token WOM score:', error);
      }

      return averageWOMScore;
    } catch (error) {
      console.error('Error recalculating token WOM score:', error);
      return 0;
    }
  }

  // Advanced sentiment analysis (for future use with paid services)
  async analyzeWithExternalAPI(text) {
    // This would integrate with services like:
    // - Google Cloud Natural Language API
    // - AWS Comprehend
    // - Azure Text Analytics
    // - Hugging Face Inference API
    
    // For now, return the simple analysis
    return this.analyzeTextSentiment(text);
  }
}

module.exports = new SentimentService(); 