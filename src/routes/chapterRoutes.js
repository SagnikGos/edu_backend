import express from 'express';
import { uploadChapters } from '../controllers/chapterController.js';
import adminAuth from '../middlewares/adminAuth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();


router.post(
  '/chapters',
  adminAuth,
  upload.single('chaptersFile'),
  uploadChapters
);

export default router;