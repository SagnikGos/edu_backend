import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis.js'; 


let store;
if (redisClient) {
  store = new RedisStore({
    
    sendCommand: (...args) => redisClient.call(...args),
    
  });
} else {

  console.warn('Redis client not available for rate limiting. Falling back to MemoryStore. Rate limiting will not be shared across instances.');
  store = new rateLimit.MemoryStore();
}


const apiRateLimiter = rateLimit({
  store: store, 
  windowMs: 60 * 1000, 
  max: 30, 
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after a minute.',
  },
  standardHeaders: true, 
  legacyHeaders: false, 
  keyGenerator: (req) => {

    return req.ip;
  },
  handler: (req, res, next, options) => {
 
    if (redisClient) { 
        const logKey = `rate_limit_exceeded:${req.ip}:${Date.now()}`;
        redisClient.set(logKey, `Path: ${req.path}`, 'EX', 60 * 5) 
            .catch(err => console.error("Failed to log rate limit event to Redis:", err));
    }
    console.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(options.statusCode).json(options.message);
  }
});

export default apiRateLimiter;