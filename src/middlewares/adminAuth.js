import dotenv from 'dotenv';

dotenv.config();

//so for now we will use a simple API key for admin authentication, but a robust authentication system is required here, this admin api key is just for this assignment purpose as this is not the main focus of this assignment <3

const adminAuth = (req, res, next) => {
  const apiKey = req.headers['x-admin-api-key']; 

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next(); 
};

export default adminAuth;