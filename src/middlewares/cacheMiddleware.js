import redisClient from '../config/redis.js';

const CACHE_DURATION_SECONDS = 3600; 

export const cacheAllChapters = async (req, res, next) => {
  if (!redisClient) { 
    return next();
  }

  

  let cacheKey = 'chapters_all'; 

  
  const { class: className, unit, status, weakChapters, subject, page, limit } = req.query;
  const queryParams = [];
  if (className) queryParams.push(`class=${className}`);
  if (unit) queryParams.push(`unit=${unit}`);
  if (status) queryParams.push(`status=${status}`);
  if (weakChapters) queryParams.push(`weakChapters=${weakChapters}`);
  if (subject) queryParams.push(`subject=${subject}`);
  if (page) queryParams.push(`page=${page}`);
  if (limit) queryParams.push(`limit=${limit}`);

  if (queryParams.length > 0) {
    cacheKey = `chapters_filtered::${queryParams.sort().join('&')}`;
  }


  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedData));
    } else {
      console.log(`Cache miss for key: ${cacheKey}`);
      
      const originalSend = res.send.bind(res);
      const originalJson = res.json.bind(res); 
      res.json = async (body) => {
        if (res.statusCode === 200) { 
          try {
            await redisClient.setex(cacheKey, CACHE_DURATION_SECONDS, JSON.stringify(body));
            console.log(`Data cached for key: ${cacheKey}, duration: ${CACHE_DURATION_SECONDS}s`);
          } catch (cacheSetError) {
            console.error(`Error setting cache for key ${cacheKey}:`, cacheSetError);
          }
        }
        return originalJson(body); 
      };
      
      res.send = async (body) => {
         if (res.statusCode === 200) {
            try {
                
                let dataToCache = body;
                if (typeof body === 'string') {
                    try {
                        JSON.parse(body); 
                    } catch (e) {
                        
                        console.log('Response body is not JSON, not caching via res.send');
                        return originalSend(body);
                    }
                }
                await redisClient.setex(cacheKey, CACHE_DURATION_SECONDS, JSON.stringify(dataToCache));
                console.log(`Data cached via res.send for key: ${cacheKey}`);
            } catch (cacheSetError) {
                console.error(`Error setting cache via res.send for key ${cacheKey}:`, cacheSetError);
            }
        }
        return originalSend(body);
      };

      next(); 
    }
  } catch (error) {
    console.error('Redis error in cache middleware:', error);
    next(); 
  }
};