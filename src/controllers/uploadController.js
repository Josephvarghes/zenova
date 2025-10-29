// src/controllers/uploadController.js
import catchAsync from '~/utils/catchAsync';
import fs from 'fs';
import cloudinaryService from '~/services/cloudinaryService';

export const uploadExerciseVideo = catchAsync(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
         data:{},
        message: 'No video file uploaded',
      });
    }

    const videoFile = req.file;

    if (!videoFile.mimetype.startsWith('video/')) {
      return res.status(400).json({
        success: false,
         data:{},
        message: 'Only video files are allowed',
      });
    }

    // ✅ READ FILE FROM DISK (since using diskStorage)
    const fileBuffer = fs.readFileSync(videoFile.path);

    // ✅ Now upload buffer to Cloudinary
    const videoUrl = await cloudinaryService.uploadVideo(fileBuffer);

    // ✅ Clean up temp file
    fs.unlinkSync(videoFile.path);

    return res.json({
      success: true,
       data:{ videoUrl },
      message: 'Video uploaded successfully',
    });
  } catch (err) {
    // ✅ Clean up temp file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({
      success: false,
       data:{},
      message: err.message || 'Failed to upload video',
    });
  }
});

export const uploadMeditationAudio = catchAsync(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false,  data:{}, message: 'No audio file uploaded' });
    }

    const audioFile = req.file;

    if (!audioFile.mimetype.startsWith('audio/')) {
      return res.status(400).json({ success: false,  data:{}, message: 'Only audio files are allowed' });
    }

    // ✅ READ FILE FROM DISK (since using diskStorage)
    const fileBuffer = fs.readFileSync(audioFile.path);

    const audioUrl = await cloudinaryService.uploadAudio(fileBuffer);

    fs.unlinkSync(audioFile.path); // Clean up

    return res.json({ success: true,  data:{ audioUrl }, message: 'Audio uploaded successfully' });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ success: false,  data:{}, message: err.message || 'Failed to upload audio' });
  }
});


export default {
 uploadExerciseVideo,
 uploadMeditationAudio
};