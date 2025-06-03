import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import chapterRoutes from './src/routes/chapterRoutes.js';
import apiRateLimiter from './src/middlewares/rateLimitMiddleware.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5001; 

app.set('trust proxy', 1); 

app.use(express.json());

// rate limiting middleware
app.use('/api', apiRateLimiter);

// Test Route
app.get('/', (req, res) => {
  res.send('Chapter Performance Dashboard API is running!');
});
// Chapter Routes
app.use('/api/v1', chapterRoutes);

// Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app; 