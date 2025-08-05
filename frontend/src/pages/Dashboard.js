import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Coins, 
  MessageSquare, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

const Dashboard = () => {
  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await axios.get('/api/search/analytics');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch trending tokens
  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const response = await axios.get('/api/search/trending?limit=5');
      return response.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const getWOMScoreColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWOMScoreBadge = (score) => {
    if (score >= 70) return 'badge-success';
    if (score >= 40) return 'badge-warning';
    return 'badge-danger';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };

  if (analyticsLoading || trendingLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Real-time crypto sentiment intelligence
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tokens</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.summary?.total_tokens || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Coins className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tweets</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.summary?.total_tweets || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tokens</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.summary?.active_tokens || 0}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg WOM Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.summary?.average_wom_score || 0}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity (24h)
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">New Tweets</span>
              <span className="font-semibold">
                {analytics?.recent_activity?.tweets_last_24h || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">New Tokens</span>
              <span className="font-semibold">
                {analytics?.recent_activity?.new_tokens_last_24h || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Updated</span>
              <span className="text-sm text-gray-500">
                {analytics?.timestamp 
                  ? formatDistanceToNow(new Date(analytics.timestamp), { addSuffix: true })
                  : 'Unknown'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status</span>
              <span className="badge badge-success">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Tokens */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Trending Tokens
          </h3>
          <Link 
            to="/tokens" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {trendingLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {trending?.trending?.map((token) => (
              <Link
                key={token.token_symbol}
                to={`/tokens/${token.token_symbol}`}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {token.token_symbol?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {token.token_symbol}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {token.token_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">WOM Score</p>
                    <p className={`font-semibold ${getWOMScoreColor(token.wom_score)}`}>
                      {token.wom_score?.toFixed(1) || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tweets</p>
                    <p className="font-semibold text-gray-900">
                      {formatNumber(token.tweet_count || 0)}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 