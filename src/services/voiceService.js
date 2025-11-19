// src/services/voiceService.js
import axios from 'axios';
import config from '~/config/config';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import cloudinary from '~/config/cloudinary';

/**
 * Convert audio to text with full debug logging
 */
export const speechToText = async (audioBuffer, debugId = 'voice') => {
  const step = (msg) => console.log(`[ASR][${debugId}] ${msg}`);
  step('Starting speech-to-text...');

  let tempPath, convertedPath;
  try {
    // Save original audio
    tempPath = `./tmp/${debugId}-original.mp3`;
    fs.writeFileSync(tempPath, audioBuffer);
    step(`Saved original audio: ${tempPath}`);

    // Convert to 16kHz mono
    convertedPath = `./tmp/${debugId}-converted.mp3`;
    await new Promise((resolve, reject) => {
      ffmpeg(tempPath)
        .audioChannels(1)
        .audioFrequency(16000)
        .format('mp3')
        .on('end', () => {
          step('Audio conversion completed');
          resolve();
        })
        .on('error', (err) => {
          step(`FFmpeg error: ${err.message}`);
          reject(new Error(`Audio conversion failed: ${err.message}`));
        })
        .save(convertedPath);
    });

    // Call Whisper
    const formData = new FormData();
    formData.append('file', fs.createReadStream(convertedPath));
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');

    step('Sending to Whisper API...');
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          Authorization: `Bearer ${config.OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000, // 10s timeout
      }
    );

    const text = response.data.text.trim();
    step(`ASR Success → "${text}"`);
    return text;
  } catch (err) {
    const errMsg = `ASR Failed: ${err.response?.data?.error?.message || err.message}`;
    step(errMsg);
    throw new Error(errMsg);
  } finally {
    // Cleanup
    [tempPath, convertedPath].forEach(path => {
      if (path && fs.existsSync(path)) {
        fs.unlinkSync(path);
        console.log(`[ASR][${debugId}] Deleted ${path}`);
      }
    });
  }
};

/**
 * Convert text to speech with debugging
 */
export const textToSpeech = async (text, bot = 'calia', debugId = 'voice') => {
  const step = (msg) => console.log(`[TTS][${debugId}] ${msg}`);
  step(`Generating speech for: "${text.substring(0, 50)}..."`);

  try {
    const voiceMap = {
      calia: 'Rachel',
      noura: 'Domi',
      aeron: 'Antoni',
    };
    const voice = voiceMap[bot] || 'Rachel';

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      },
      {
        headers: {
          'xi-api-key': config.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
        timeout: 8000,
      }
    );

    // Upload to Cloudinary
    step('Uploading audio to Cloudinary...');
    const audioBuffer = Buffer.from(response.data);
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'video', folder: 'zenova/voice' },
        (error, res) => {
          if (error) reject(error);
          else resolve(res);
        }
      ).end(audioBuffer);
    });

    step(`TTS Success → ${result.secure_url}`);
    return result.secure_url;
  } catch (err) {
    const errMsg = `TTS Failed: ${err.response?.data?.detail || err.message}`;
    step(errMsg);
    throw new Error(errMsg);
  }
};