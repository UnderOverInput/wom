const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const cron = require('node-cron');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const tokenService = require('./services/tokenService');
const tweetService = require('./services/tweetService');
const sentimentService = require('./services/sentimentService');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many requests' });
  }
});

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      supabase: 'connected',
      uptime: process.uptime()
    }
  });
});

// API Routes
app.use('/api/tokens', require('./routes/tokens'));
app.use('/api/tweets', require('./routes/tweets'));
app.use('/api/search', require('./routes/search'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Background tasks (optimized for free tier)
const startBackgroundTasks = () => {
  // Token fetching every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      console.log('Running token fetch task...');
      await tokenService.fetchNewTokens(supabase);
    } catch (error) {
      console.error('Token fetch task failed:', error);
    }
  });

  // Tweet processing every 2 minutes
  cron.schedule('*/2 * * * *', async () => {
    try {
      console.log('Running tweet processing task...');
      await tweetService.processTweets(supabase);
    } catch (error) {
      console.error('Tweet processing task failed:', error);
    }
  });

  // Sentiment analysis every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('Running sentiment analysis task...');
      await sentimentService.analyzeSentiments(supabase);
    } catch (error) {
      console.error('Sentiment analysis task failed:', error);
    }
  });

  // Maintenance tasks every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running maintenance tasks...');
      await tokenService.cleanupOldTokens(supabase);
      await tweetService.cleanupOldTweets(supabase);
    } catch (error) {
      console.error('Maintenance tasks failed:', error);
    }
  });
};

// Start server
app.listen(PORT, () => {
  console.log(`WOM Backend running on port ${PORT}`);
  startBackgroundTasks();
});

module.exports = app; 