require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000',

  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'scouttree',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    poolMax: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    prices: {
      proMonthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
      proYearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY,
      team: process.env.STRIPE_PRICE_ID_TEAM,
    },
  },

  platforms: {
    lichess: {
      apiUrl: process.env.LICHESS_API_URL || 'https://lichess.org',
      clientId: process.env.LICHESS_CLIENT_ID,
    },
    chesscom: {
      apiUrl: process.env.CHESSCOM_API_URL || 'https://api.chess.com/pub',
    },
  },

  rateLimits: {
    free: parseInt(process.env.RATE_LIMIT_FREE_REQUESTS_PER_MONTH, 10) || 3,
    pro: parseInt(process.env.RATE_LIMIT_PRO_REQUESTS_PER_MONTH, 10) || 100,
    team: parseInt(process.env.RATE_LIMIT_TEAM_REQUESTS_PER_MONTH, 10) || 500,
  },

  analysis: {
    stockfish: {
      depthBlitz: parseInt(process.env.STOCKFISH_DEPTH_BLITZ, 10) || 20,
      depthRapid: parseInt(process.env.STOCKFISH_DEPTH_RAPID, 10) || 25,
      depthClassical: parseInt(process.env.STOCKFISH_DEPTH_CLASSICAL, 10) || 30,
    },
    maxGamesFetch: parseInt(process.env.MAX_GAMES_FETCH, 10) || 500,
    cacheTtlGames: parseInt(process.env.CACHE_TTL_GAMES, 10) || 604800, // 7 days
    cacheTtlReports: parseInt(process.env.CACHE_TTL_REPORTS, 10) || 86400, // 24 hours
  },

  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3BucketName: process.env.S3_BUCKET_NAME,
  },

  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    prometheusPort: parseInt(process.env.PROMETHEUS_PORT, 10) || 9090,
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
};
