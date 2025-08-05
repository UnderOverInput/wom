const axios = require('axios');

class TokenService {
  async fetchNewTokens(supabase) {
    try {
      // Fetch new tokens from DEX APIs (optimized for free tier)
      const tokens = await this.fetchFromDexScreener();
      
      for (const token of tokens) {
        await this.upsertToken(supabase, token);
      }
      
      console.log(`Processed ${tokens.length} new tokens`);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  }

  async fetchFromDexScreener() {
    try {
      // Fetch trending tokens from DEX Screener API
      const response = await axios.get('https://api.dexscreener.com/latest/dex/tokens/trending', {
        timeout: 10000
      });
      
      return response.data.pairs?.slice(0, 50).map(pair => ({
        token_symbol: pair.baseToken.symbol,
        token_name: pair.baseToken.name,
        address: pair.baseToken.address,
        volume_usd: parseFloat(pair.volume.h24 || 0),
        liquidity_usd: parseFloat(pair.liquidity.usd || 0),
        market_cap_usd: parseFloat(pair.marketCap || 0),
        dex_url: pair.url,
        pricechange1h: parseFloat(pair.priceChange.h1 || 0),
        launchpad: 'DEX_SCREENER',
        created_at: new Date().toISOString()
      })) || [];
    } catch (error) {
      console.error('Error fetching from DEX Screener:', error);
      return [];
    }
  }

  async upsertToken(supabase, tokenData) {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .upsert(tokenData, {
          onConflict: 'token_symbol',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error upserting token:', error);
      }
    } catch (error) {
      console.error('Error in upsertToken:', error);
    }
  }

  async getTokens(supabase, { page = 1, limit = 20, onlyActive = true } = {}) {
    try {
      let query = supabase
        .from('tokens')
        .select('*')
        .order('wom_score', { ascending: false });

      if (onlyActive) {
        query = query.eq('is_active', true);
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .select('*', { count: 'exact' });

      if (error) {
        throw error;
      }

      return {
        tokens: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw error;
    }
  }

  async searchToken(supabase, address) {
    try {
      // Search in our database first
      const { data: existingToken } = await supabase
        .from('tokens')
        .select('*')
        .eq('address', address)
        .single();

      if (existingToken) {
        return existingToken;
      }

      // If not found, fetch from external API
      const tokenData = await this.fetchTokenFromExternalAPI(address);
      if (tokenData) {
        await this.upsertToken(supabase, tokenData);
        return tokenData;
      }

      return null;
    } catch (error) {
      console.error('Error searching token:', error);
      throw error;
    }
  }

  async fetchTokenFromExternalAPI(address) {
    try {
      const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
        timeout: 10000
      });

      const pair = response.data.pairs?.[0];
      if (!pair) return null;

      return {
        token_symbol: pair.baseToken.symbol,
        token_name: pair.baseToken.name,
        address: pair.baseToken.address,
        volume_usd: parseFloat(pair.volume.h24 || 0),
        liquidity_usd: parseFloat(pair.liquidity.usd || 0),
        market_cap_usd: parseFloat(pair.marketCap || 0),
        dex_url: pair.url,
        pricechange1h: parseFloat(pair.priceChange.h1 || 0),
        launchpad: 'DEX_SCREENER',
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching token from external API:', error);
      return null;
    }
  }

  async cleanupOldTokens(supabase) {
    try {
      // Deactivate tokens older than 24 hours with low activity
      const { error } = await supabase.rpc('deactivate_low_activity_tokens');
      
      if (error) {
        console.error('Error cleaning up old tokens:', error);
      } else {
        console.log('Token cleanup completed');
      }
    } catch (error) {
      console.error('Error in cleanupOldTokens:', error);
    }
  }

  async updateTokenStats(supabase, tokenSymbol) {
    try {
      // Get tweet count for token
      const { count } = await supabase
        .from('tweets')
        .select('*', { count: 'exact', head: true })
        .eq('token_symbol', tokenSymbol);

      // Update token stats
      const { error } = await supabase
        .from('tokens')
        .update({
          tweet_count: count || 0,
          last_seen_at: new Date().toISOString()
        })
        .eq('token_symbol', tokenSymbol);

      if (error) {
        console.error('Error updating token stats:', error);
      }
    } catch (error) {
      console.error('Error in updateTokenStats:', error);
    }
  }
}

module.exports = new TokenService(); 