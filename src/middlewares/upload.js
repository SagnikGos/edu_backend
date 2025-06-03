import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();


const storage = multer.memoryStorage();


const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only JSON is allowed!'), false);
    }
  },
  limits: {
    
    fileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 5 * 1024 * 1024, 
  }
});

export default upload;