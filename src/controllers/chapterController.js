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

  
  try {
    await redisClient.del('chapters'); 
    console.log('Redis cache for /api/v1/chapters invalidated.');
  } catch (cacheError) {
    console.error('Error invalidating Redis cache:', cacheError);
    
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