const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');

// Set up Redis connection
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  enableOfflineQueue: false,
});

// Set up rate limiter (5 requests/sec)
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'vote_rate',
  points: 5, // 5 points
  duration: 10, // per 1 second
  blockDuration: 0, // don't block for future requests, just deny
});

function rateLimitPerUser(req, res, next) {
  const key = req.user?.sub || req.ip;

  rateLimiter.consume(key)
    .then(() => {
      next(); // Allowed
    })
    .catch(() => {
      res.status(429).json({ error: 'Too many requests. Please slow down.' });
    });
}

module.exports = rateLimitPerUser;
