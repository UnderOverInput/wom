const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const tokenService = require('../services/tokenService');

// GET /api/tokens - Get all tokens with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, onlyActive = true } = req.query;
    
    const result = await tokenService.getTokens(supabase, {
      page: parseInt(page),
      limit: parseInt(limit),
      onlyActive: onlyActive === 'true'
    });

    res.json(result);
  } catch (error) {
    console.error('Error in GET /tokens:', error);
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
});

// GET /api/tokens/search/:address - Search for a token by address
router.get('/search/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const token = await tokenService.searchToken(supabase, address);
    
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    res.json(token);
  } catch (error) {
    console.error('Error in GET /tokens/search/:address:', error);
    res.status(500).json({ error: 'Failed to search token' });
  }
});

// GET /api/tokens/:symbol - Get specific token by symbol
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const { data: token, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('token_symbol', symbol.toUpperCase())
      .single();

    if (error || !token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    res.json(token);
  } catch (error) {
    console.error('Error in GET /tokens/:symbol:', error);
    res.status(500).json({ error: 'Failed to fetch token' });
  }
});

// POST /api/tokens - Create a new token (for authenticated users)
router.post('/', async (req, res) => {
  try {
    const tokenData = req.body;
    
    // Validate required fields
    if (!tokenData.token_symbol) {
      return res.status(400).json({ error: 'Token symbol is required' });
    }

    const { data, error } = await supabase
      .from('tokens')
      .insert([tokenData])
      .select()
      .single();

    if (error) {
      console.error('Error creating token:', error);
      return res.status(400).json({ error: 'Failed to create token' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in POST /tokens:', error);
    res.status(500).json({ error: 'Failed to create token' });
  }
});

// PUT /api/tokens/:symbol - Update a token
router.put('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const updateData = req.body;
    
    const { data, error } = await supabase
      .from('tokens')
      .update(updateData)
      .eq('token_symbol', symbol.toUpperCase())
      .select()
      .single();

    if (error) {
      console.error('Error updating token:', error);
      return res.status(400).json({ error: 'Failed to update token' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in PUT /tokens/:symbol:', error);
    res.status(500).json({ error: 'Failed to update token' });
  }
});

// DELETE /api/tokens/:symbol - Deactivate a token
router.delete('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const { error } = await supabase
      .from('tokens')
      .update({ is_active: false })
      .eq('token_symbol', symbol.toUpperCase());

    if (error) {
      console.error('Error deactivating token:', error);
      return res.status(400).json({ error: 'Failed to deactivate token' });
    }

    res.json({ message: 'Token deactivated successfully' });
  } catch (error) {
    console.error('Error in DELETE /tokens/:symbol:', error);
    res.status(500).json({ error: 'Failed to deactivate token' });
  }
});

module.exports = router; 