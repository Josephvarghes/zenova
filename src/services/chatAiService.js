// src/services/chatAiService.js
import axios from 'axios';
import config from '~/config/config';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Predefined prompts for each bot
const BOT_PROMPTS = {
  calia: {
    system: `You are {gender} Calia, an {tonality} AI Lifestyle Coach. 
      You help users with sleep, mood, screen time, and daily habits.
      Always respond in 1–2 short sentences. Be encouraging and kind.
      Never give medical advice — always say "consult a doctor".
      Add a friendly emoji at the end of every response. 🌿`,
  },
  noura: {
    system: `You are {gender} Noura, an {tonality} AI Nutritionist. 
      You help users with meals, calories, macros, and healthy eating.
      Always respond in 1–2 short sentences. Be practical and supportive.
      Never give medical advice — always say "consult a doctor".
      Add a food emoji at the end of every response. 🥗`,
  },
  aeron: {
    system: `You are {gender} Aeron, an {tonality} AI Personal Trainer. 
      You help users with workouts, steps, yoga, and movement.
      Always respond in 1–2 short sentences. Be motivating and direct.
      Never give medical advice — always say "consult a doctor".
      Add a fitness emoji at the end of every response. 💪`,
  },
};

// Fallback responses
const FALLBACKS = {
  unknown: "I'm not sure I understood that. Could you rephrase?",
  empty: "Please type your question so I can assist you.",
  outOfScope: "I'm focused on health guidance, not movie reviews 😄.",
  error: "I'm having trouble fetching details now. Please try again later.",
  lowConfidence: "I’m not fully sure about this. You should consult a doctor for confirmation.",
  pii: "Please avoid sharing full names, contact, or ID numbers.",
  emergency: "If you're in crisis, please call 988 (US) or your local helpline. You’re not alone. 💙",
};

// Emergency keywords
const EMERGENCY_KEYWORDS = [
  'harm myself', 'suicide', 'kill myself', 'end my life',
  'help me', 'crisis', 'emergency', 'call 911', 'need help'
];

// PII detection regex
const PII_REGEX = /\b(?:name|phone|email|address|ssn|id|social security|DOB|birth date|passport|driver license)\b/i;

/**
 * Generate AI response for chatbot
 * @param {string} bot - 'calia', 'noura', or 'aeron'
 * @param {string} message - User's message
 * @param {string} context - Summarized user data
 * @param {Array} history - Previous messages
 * @param {Object} preferences - User's gender & tonality for this bot
 * @returns {Promise<string>} - AI response
 */
export const generateChatResponse = async (bot, message, context, history = [], preferences = {}) => {
  try {
    // Safety: Check for emergency
    if (EMERGENCY_KEYWORDS.some(kw => message.toLowerCase().includes(kw))) {
      return FALLBACKS.emergency;
    }

    // Safety: Check for PII
    if (PII_REGEX.test(message)) {
      return FALLBACKS.pii;
    }

    // Safety: Empty message
    if (!message || message.trim().length === 0) {
      return FALLBACKS.empty;
    }

    // Build prompt
    let systemPrompt = BOT_PROMPTS[bot].system;
    systemPrompt = systemPrompt
      .replace('{gender}', preferences.gender || 'Female')
      .replace('{tonality}', preferences.tonality || 'Calm');

    const userPrompt = `User: ${message}
Context: ${context}
Previous messages: ${history.length > 0 ? history.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n') : 'None'}`;

    // Call OpenRouter
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'meta-llama/llama-3-8b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let aiResponse = response.data.choices[0].message.content.trim();

    // Clean output
    aiResponse = aiResponse.replace(/<s>/g, '').replace(/\[OUT\]/g, '').replace(/\[\/OUT\]/g, '');
    aiResponse = aiResponse.split('\n')[0].trim();
    aiResponse = aiResponse.replace(/^["']|["']$/g, '');

    // Safety: Low confidence / generic response
    if (
      aiResponse.includes('I am an AI') ||
      aiResponse.includes('I cannot provide') ||
      aiResponse.length < 10
    ) {
      return FALLBACKS.lowConfidence;
    }

    // Add disclaimer for healthcare
    aiResponse += ' (This isn’t medical advice — always consult a doctor.)';

    return aiResponse;
  } catch (err) {
    console.error(`ChatAI ${bot} error:`, err.response?.data || err.message);
    return FALLBACKS.error;
  }
}; 

export default {
  generateChatResponse
};