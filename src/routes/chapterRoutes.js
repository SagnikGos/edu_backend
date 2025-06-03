import express from 'express';
import { uploadChapters, getAllChapters, getChapterById } from '../controllers/chapterController.js';
import adminAuth from '../middlewares/adminAuth.js';
import upload from '../middlewares/upload.js';
import { cacheAllChapters } from '../middlewares/cacheMiddleware.js';

const router = express.Router();

// POST /api/v1/chapters
router.post(
  '/chapters',
  adminAuth,
  upload.single('chaptersFile'),
  uploadChapters
);

// GET /api/v1/chapters
router.get(
  '/chapters',
  cacheAllChapters, 
  getAllChapters
);

// GET /api/v1/chapters/:id
router.get(
  '/chapters/:id',
  getChapterById 
);

export default router;