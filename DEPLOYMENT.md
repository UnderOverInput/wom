# WOM Backend Deployment Guide

## Cost-Effective Architecture Overview

This solution provides a **cost-free or low-cost** implementation of the WOM (Word of Mouth Intelligence Engine) using:

- **Backend**: Node.js/Express deployed on lovable.dev (free tier)
- **Database**: Supabase (free tier: 500MB database, 2GB bandwidth)
- **Frontend**: React deployed on Vercel/Netlify (free hosting)
- **Real-time**: Supabase real-time subscriptions

## 🚀 Quick Start

### 1. Supabase Setup (Free Tier)

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com
   # Sign up and create a new project
   # Note your project URL and anon key
   ```

2. **Initialize Database**
   ```bash
   # Run the schema file in Supabase SQL Editor
   # Copy contents of supabase-schema.sql
   # Execute in Supabase Dashboard > SQL Editor
   ```

3. **Get Environment Variables**
   ```bash
   # From Supabase Dashboard > Settings > API
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### 2. Backend Deployment (Lovable.dev)

1. **Prepare Backend**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Copy env.example to .env
   cp env.example .env
   
   # Update with your Supabase credentials
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Deploy to Lovable.dev**
   ```bash
   # Install Lovable CLI
   npm install -g @lovable/cli
   
   # Login to Lovable
   lovable login
   
   # Deploy
   lovable deploy
   ```

### 3. Frontend Deployment (Vercel)

1. **Prepare Frontend**
   ```bash
   cd frontend
   npm install
   ```

2. **Update API URL**
   ```javascript
   // In src/services/api.js
   const API_BASE_URL = 'https://your-lovable-app.lovable.dev';
   ```

3. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

## 💰 Cost Breakdown

### Free Tier Limits
- **Supabase**: 500MB database, 2GB bandwidth/month
- **Lovable.dev**: Free tier available
- **Vercel**: 100GB bandwidth/month, unlimited deployments
- **Total Monthly Cost**: $0

### Paid Upgrades (Optional)
- **Supabase Pro**: $25/month (8GB database, 250GB bandwidth)
- **Lovable.dev Pro**: $20/month (better performance)
- **Vercel Pro**: $20/month (more bandwidth)

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (.env)**
```bash
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Optimization

The schema is optimized for free tier limits:

```sql
-- Efficient indexing for queries
CREATE INDEX idx_tokens_active ON tokens(is_active);
CREATE INDEX idx_tokens_wom_score ON tokens(wom_score DESC);

-- Automatic cleanup functions
CREATE FUNCTION clean_old_tweets() RETURNS INTEGER;
CREATE FUNCTION deactivate_low_activity_tokens() RETURNS INTEGER;
```

## 📊 Performance Optimizations

### Backend Optimizations
- **Rate Limiting**: 100 requests/minute per IP
- **Compression**: gzip compression enabled
- **Caching**: React Query for frontend caching
- **Batch Processing**: Process tokens in batches of 10

### Database Optimizations
- **Indexes**: Strategic indexes for common queries
- **Cleanup**: Automatic cleanup of old data
- **Pagination**: Efficient pagination for large datasets
- **Real-time**: Supabase real-time subscriptions

### Frontend Optimizations
- **Lazy Loading**: Components loaded on demand
- **Caching**: React Query for API response caching
- **Compression**: Build optimization with compression
- **CDN**: Vercel's global CDN

## 🔄 Background Tasks

The backend runs several background tasks optimized for free tier:

```javascript
// Token fetching every 30 minutes
cron.schedule('*/30 * * * *', fetchNewTokens);

// Tweet processing every 2 minutes
cron.schedule('*/2 * * * *', processTweets);

// Sentiment analysis every 5 minutes
cron.schedule('*/5 * * * *', analyzeSentiments);

// Maintenance every hour
cron.schedule('0 * * * *', maintenanceTasks);
```

## 🚨 Monitoring & Alerts

### Health Checks
- **Backend**: `/health` endpoint
- **Database**: Connection monitoring
- **Frontend**: Error boundary implementation

### Logging
```javascript
// Structured logging for debugging
console.log('Token fetch completed', { count: tokens.length });
console.error('API error', { error: error.message });
```

## 🔒 Security

### Backend Security
- **Helmet**: Security headers
- **Rate Limiting**: Prevent abuse
- **CORS**: Configured for frontend domain
- **Input Validation**: Request validation

### Database Security
- **RLS**: Row Level Security enabled
- **Public Read**: Allow public read access
- **Authenticated Write**: Require auth for writes

## 📈 Scaling Strategy

### Free Tier Limits
- **Database**: 500MB (≈ 50,000 tokens, 500,000 tweets)
- **Bandwidth**: 2GB/month
- **API Calls**: 100/minute rate limit

### Upgrade Path
1. **Supabase Pro**: $25/month (8GB database)
2. **Lovable.dev Pro**: $20/month (better performance)
3. **Custom Domain**: $10/month
4. **Advanced Analytics**: $50/month

## 🛠️ Development

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 API Documentation

### Core Endpoints
- `GET /api/tokens` - List tokens with pagination
- `GET /api/tokens/:symbol` - Get specific token
- `GET /api/tweets/:symbol` - Get tweets for token
- `GET /api/search/trending` - Get trending tokens
- `GET /api/search/analytics` - Get analytics summary

### Real-time Features
- **Token Updates**: Real-time WOM score updates
- **Tweet Streams**: Live tweet ingestion
- **Analytics**: Real-time dashboard updates

## 🎯 Success Metrics

### Performance Targets
- **Response Time**: < 200ms for API calls
- **Uptime**: > 99.5%
- **Data Freshness**: < 5 minutes for updates

### Business Metrics
- **Token Coverage**: 1000+ tokens tracked
- **Tweet Volume**: 10,000+ tweets/day
- **User Engagement**: Real-time dashboard usage

## 🆘 Troubleshooting

### Common Issues
1. **Rate Limiting**: Reduce API call frequency
2. **Database Full**: Clean up old data
3. **Memory Issues**: Optimize batch sizes
4. **CORS Errors**: Check frontend URL configuration

### Support
- **Backend Issues**: Check Lovable.dev logs
- **Database Issues**: Supabase Dashboard
- **Frontend Issues**: Vercel deployment logs

## 🚀 Production Checklist

- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] Backend deployed to Lovable.dev
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Domain configured (optional)
- [ ] Monitoring set up
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Backup strategy implemented

This architecture provides a **production-ready, cost-effective** solution that can scale from free tier to enterprise usage as your needs grow. 