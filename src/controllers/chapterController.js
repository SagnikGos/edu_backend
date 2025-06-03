import Chapter from '../models/ChapterModel.js';
import redisClient from '../config/redis.js'; 

export const uploadChapters = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No JSON file uploaded.' });
  }

  let chaptersData;
  try {
    
    chaptersData = JSON.parse(req.file.buffer.toString('utf8'));
    if (!Array.isArray(chaptersData)) {
      return res.status(400).json({ message: 'JSON file must contain an array of chapter objects.' });
    }
  } catch (error) {
    return res.status(400).json({ message: 'Invalid JSON file format.', error: error.message });
  }

  const uploadedChapters = [];
  const failedChapters = [];

  for (const chapterData of chaptersData) {
    try {
      
      const newChapter = new Chapter(chapterData);
      
      await newChapter.validate();
      
      await newChapter.save();
      uploadedChapters.push(newChapter);
    } catch (error) {
      
      failedChapters.push({
        data: chapterData,
        error: error.message,
      });
    }
  }

  
  if (redisClient && uploadedChapters.length > 0) {
    try {
      
      await redisClient.del('chapters_all');
      console.log("Invalidated 'chapters_all' cache key.");

      
      const stream = redisClient.scanStream({
        match: 'chapters_filtered::*', 
        count: 100 
      });

      const keysToDelete = [];
      stream.on('data', (resultKeys) => {
        if (resultKeys.length > 0) {
          keysToDelete.push(...resultKeys);
        }
      });

      stream.on('end', async () => {
        if (keysToDelete.length > 0) {
          await redisClient.del(...keysToDelete); 
          console.log(`Invalidated ${keysToDelete.length} filtered chapter caches.`);
        } else {
            console.log('No filtered chapter caches found to invalidate.');
        }
      });

      stream.on('error', (err) => {
        console.error('Error during Redis SCAN stream for cache invalidation:', err);
      });

    } catch (cacheError) {
      console.error('Error invalidating Redis cache:', cacheError);
      
    }
  }
  

  const statusCode = failedChapters.length > 0 ? 207 : 201; 
  res.status(statusCode).json({
    message: 'Chapter upload process completed.',
    totalProcessed: chaptersData.length,
    uploadedCount: uploadedChapters.length,
    failedCount: failedChapters.length,
    uploadedChapters: uploadedChapters.map(chap => ({ id: chap._id, chapter: chap.chapter })), 
    failedChapters: failedChapters,
  });
};


export const getAllChapters = async (req, res) => {
  try {
    const {
      subject,
      class: className, 
      unit,
      status,
      weakChapters,
      page = 1,
      limit = 10,
    } = req.query;

    const queryOptions = {};

    if (subject) queryOptions.subject = subject;
    if (className) queryOptions.class = className; 
    if (unit) queryOptions.unit = unit;
    if (status) queryOptions.status = status;
    if (subject) queryOptions.subject = subject;

    
    if (weakChapters !== undefined) {
      queryOptions.isWeakChapter = weakChapters === 'true';
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
        return res.status(400).json({ message: "Invalid page number. Must be 1 or greater." });
    }
    if (isNaN(limitNumber) || limitNumber < 1) {
        return res.status(400).json({ message: "Invalid limit number. Must be 1 or greater." });
    }

    const skip = (pageNumber - 1) * limitNumber;

    
    const totalChapters = await Chapter.countDocuments(queryOptions);

    const chapters = await Chapter.find(queryOptions)
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      message: 'Chapters retrieved successfully',
      totalChapters,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalChapters / limitNumber),
      chapters,
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ message: 'Server error while fetching chapters', error: error.message });
  }
};
