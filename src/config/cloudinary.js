// src/config/cloudinaryConfig.js
import dotenv from 'dotenv';
dotenv.config(); // Ensure .env is loaded

import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary.v2; // Export the configured instance