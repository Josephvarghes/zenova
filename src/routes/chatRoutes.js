// src/routes/chatRoutes.js
import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import chatValidation from '~/validations/chatValidation';
import chatController from '~/controllers/chatController';
import chatLimiter from '~/middlewares/rateLimit';
import multer from 'multer';
import fs from 'fs';

const router = Router(); 


// Multer setup (reuse from upload module)
// const TMP_DIR = './tmp';
// if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

// const audioStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, TMP_DIR),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname) || '.mp3';
//     cb(null, `voice-${Date.now()}${ext}`);
//   }
// });

// const audioUpload = multer({
//   storage: audioStorage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('audio/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only audio files allowed'), false);
//     }
//   }
// });



router.post('/send', authenticate(), chatLimiter, validate(chatValidation.sendMessage), catchAsync(chatController.sendMessage));
router.get('/history', authenticate(), validate(chatValidation.getChatHistory), catchAsync(chatController.getChatHistory));
router.delete('/clear', authenticate(), validate(chatValidation.clearChatHistory), catchAsync(chatController.clearChatHistory));
 
// router.post('/voice', authenticate(), chatLimiter, audioUpload.single('audio'), catchAsync(chatController.sendVoiceMessage));

export default router;