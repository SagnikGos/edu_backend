import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient;

try {
  const redisOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    
    maxRetriesPerRequest: 3 
  };

  
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3
    });
  } else {
    redisClient = new Redis(redisOptions);
  }

  redisClient.on('connect', () => {
    console.log('Connected to Redis successfully!');
  });

  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
    //todo:- retry logic if redis connection fails
    
  });

} catch (error) {
  console.error('Failed to initialize Redis client:', error);
  
  redisClient = null; 
}


export default redisClient;