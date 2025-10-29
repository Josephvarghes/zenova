import { Router } from 'express';
import multer from 'multer';
import authenticate from '~/middlewares/authenticate';
import uploadController from '~/controllers/uploadController'; 
import fs from 'fs'

const router = Router();

// Multer setup
const TMP_DIR = './tmp';
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TMP_DIR),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop() || 'mp4' || 'mp3';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 } // 1GB
});

// Routes
router.post('/exercise-video', authenticate(), upload.single('video'), uploadController.uploadExerciseVideo);
router.post('/meditation-audio', authenticate(), upload.single('audio'), uploadController.uploadMeditationAudio); 
export default router;