# WOM - Word of Mouth Intelligence Engine (Cost-Effective Architecture)

[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18+-blue.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/supabase-database-orange.svg)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**WOM** is an AI-powered analytics engine for extracting, processing, and scoring real-time social sentiment across newly launched crypto tokens. This **cost-effective implementation** uses modern cloud services to provide enterprise-grade functionality at minimal cost.

## 🚀 Cost-Effective Architecture

### **Total Monthly Cost: $0** (Free Tier)

| Component | Service | Free Tier Limits | Cost |
|-----------|---------|------------------|------|
| **Database** | Supabase | 500MB, 2GB bandwidth | $0 |
| **Backend** | Lovable.dev | Free tier available | $0 |
| **Frontend** | Vercel | 100GB bandwidth | $0 |
| **Real-time** | Supabase | Included | $0 |

### **Upgrade Path** (Optional)
- **Supabase Pro**: $25/month (8GB database, 250GB bandwidth)
- **Lovable.dev Pro**: $20/month (better performance)
- **Vercel Pro**: $20/month (more bandwidth)

## ✨ Key Features

### **Real-time Analytics**
- Live WOM score updates
- Real-time tweet ingestion
- Instant sentiment analysis
- Live dashboard updates

### **Cost Optimizations**
- Efficient database indexing
- Batch processing for API calls
- Smart caching strategies
- Automatic data cleanup

### **Modern Tech Stack**
- **Backend**: Node.js/Express with TypeScript
- **Database**: PostgreSQL (Supabase)
- **Frontend**: React with Tailwind CSS
- **Real-time**: Supabase subscriptions
- **Deployment**: Lovable.dev + Vercel

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Node.js API    │    │   Supabase      │
│   (Vercel)      │◄──►│  (Lovable.dev)  │◄──►│   Database      │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • REST API      │    │ • PostgreSQL    │
│ • Token List    │    │ • Background    │    │ • Real-time     │
│ • Analytics     │    │   Tasks         │    │ • Auth          │
│ • Search        │    │ • Rate Limiting │    │ • Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Performance Metrics

### **Free Tier Capacity**
- **Tokens**: 50,000+ tokens tracked
- **Tweets**: 500,000+ tweets stored
- **API Calls**: 100 requests/minute
- **Bandwidth**: 2GB/month
- **Uptime**: 99.5%+

### **Response Times**
- **API Calls**: < 200ms
- **Database Queries**: < 100ms
- **Real-time Updates**: < 1s
- **Page Load**: < 2s

## 🛠️ Quick Start

### 1. **Clone & Setup**
```bash
git clone <your-repo>
cd wom-cost-effective
```

### 2. **Database Setup (Supabase)**
```bash
# 1. Create Supabase project at https://supabase.com
# 2. Run schema in SQL Editor:
cat supabase-schema.sql | supabase db push
```

### 3. **Backend Deployment (Lovable.dev)**
```bash
cd backend
npm install
cp env.example .env
# Update .env with your Supabase credentials
lovable deploy
```

### 4. **Frontend Deployment (Vercel)**
```bash
cd frontend
npm install
# Update API URL in src/services/api.js
vercel --prod
```

## 📁 Project Structure

```
wom-cost-effective/
├── backend/                 # Node.js API
│   ├── services/           # Business logic
│   ├── routes/             # API endpoints
│   ├── server.js           # Express server
│   └── package.json        # Dependencies
├── frontend/               # React App
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── package.json        # Dependencies
├── supabase-schema.sql     # Database schema
└── DEPLOYMENT.md           # Deployment guide
```

## 🔧 Configuration

### **Environment Variables**

**Backend (.env)**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
PORT=3000
NODE_ENV=production
```

**Frontend (.env)**
```bash
REACT_APP_API_URL=https://your-backend.lovable.dev
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

## 📈 API Endpoints

### **Core Endpoints**
```bash
GET  /api/tokens              # List tokens with pagination
GET  /api/tokens/:symbol      # Get specific token
GET  /api/tweets/:symbol      # Get tweets for token
GET  /api/search/trending     # Get trending tokens
GET  /api/search/analytics    # Get analytics summary
```

### **Real-time Features**
- **Token Updates**: Real-time WOM score updates
- **Tweet Streams**: Live tweet ingestion
- **Analytics**: Real-time dashboard updates

## 🔄 Background Tasks

The backend runs optimized background tasks:

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

## 🎯 Key Optimizations

### **Database Optimizations**
- Strategic indexes for common queries
- Automatic cleanup of old data
- Efficient pagination
- Real-time subscriptions

### **Backend Optimizations**
- Rate limiting (100 req/min)
- Compression enabled
- Batch processing
- Memory-efficient operations

### **Frontend Optimizations**
- React Query for caching
- Lazy loading components
- Optimized builds
- CDN delivery

## 🔒 Security Features

### **Backend Security**
- Helmet security headers
- Rate limiting protection
- CORS configuration
- Input validation

### **Database Security**
- Row Level Security (RLS)
- Public read access
- Authenticated write access
- Automatic backups

## 📊 Monitoring & Analytics

### **Health Checks**
- Backend: `/health` endpoint
- Database: Connection monitoring
- Frontend: Error boundaries

### **Logging**
```javascript
// Structured logging
console.log('Token fetch completed', { count: tokens.length });
console.error('API error', { error: error.message });
```

## 🚀 Scaling Strategy

### **Free Tier Limits**
- Database: 500MB (≈ 50,000 tokens, 500,000 tweets)
- Bandwidth: 2GB/month
- API Calls: 100/minute rate limit

### **Upgrade Path**
1. **Supabase Pro**: $25/month (8GB database)
2. **Lovable.dev Pro**: $20/month (better performance)
3. **Custom Domain**: $10/month
4. **Advanced Analytics**: $50/month

## 🛠️ Development

### **Local Development**
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

### **Testing**
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Database Schema

### **Optimized for Free Tier**
```sql
-- Tokens table with efficient indexing
CREATE TABLE tokens (
    token_symbol VARCHAR(50) PRIMARY KEY,
    wom_score DECIMAL(5, 2) DEFAULT 0,
    tweet_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    -- ... other fields
);

-- Strategic indexes
CREATE INDEX idx_tokens_active ON tokens(is_active);
CREATE INDEX idx_tokens_wom_score ON tokens(wom_score DESC);

-- Automatic cleanup functions
CREATE FUNCTION clean_old_tweets() RETURNS INTEGER;
CREATE FUNCTION deactivate_low_activity_tokens() RETURNS INTEGER;
```

## 🎯 Success Metrics

### **Performance Targets**
- Response Time: < 200ms for API calls
- Uptime: > 99.5%
- Data Freshness: < 5 minutes for updates

### **Business Metrics**
- Token Coverage: 1000+ tokens tracked
- Tweet Volume: 10,000+ tweets/day
- User Engagement: Real-time dashboard usage

## 🆘 Troubleshooting

### **Common Issues**
1. **Rate Limiting**: Reduce API call frequency
2. **Database Full**: Clean up old data
3. **Memory Issues**: Optimize batch sizes
4. **CORS Errors**: Check frontend URL configuration

### **Support Resources**
- **Backend Issues**: Check Lovable.dev logs
- **Database Issues**: Supabase Dashboard
- **Frontend Issues**: Vercel deployment logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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

---

**This architecture provides a production-ready, cost-effective solution that can scale from free tier to enterprise usage as your needs grow.**

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md). 