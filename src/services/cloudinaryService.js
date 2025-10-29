// src/services/cloudinaryService.js
import cloudinary from '~/config/cloudinary'; // ← Already configured!

export const uploadVideo = async (fileBuffer) => {
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'video', folder: 'zenova/exercises' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(fileBuffer);
  });
  return result.secure_url;
}; 

export const uploadAudio = async (fileBuffer) => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'zenova/meditation' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Audio Upload Error:', error); // 👈 LOG REAL ERROR
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(fileBuffer);
    });
    return result.secure_url;
  } catch (err) {
    console.error('Upload Audio Error:', err); // 👈 LOG FULL ERROR
    throw new Error('Failed to upload audio to Cloudinary');
  }
};

export default {
  uploadVideo,
  uploadAudio
};