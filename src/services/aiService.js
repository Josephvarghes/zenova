// src/services/aiService.js
import axios from 'axios';
import config from '~/config/config';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'; 




// export const getAIRecommendation = async (agent, context) => {
//   try {
//     let systemPrompt = '';
//     if (agent === 'nutrition') {
//       systemPrompt = 'You are a certified nutritionist. Give one short, actionable tip based on the user data.';
//     } else if (agent === 'movement') {
//       systemPrompt = 'You are a fitness coach. Suggest one simple movement activity based on user data.';
//     } else {
//       systemPrompt = 'You are a wellness advisor. Share one practical lifestyle tip based on user data.';
//     }

//     const response = await axios.post(
//       OPENROUTER_API_URL,
//       {
//         model: 'mistralai/mistral-7b-instruct', // ✅ Free model
//         messages: [
//           { role: 'system', content: systemPrompt },
//           { role: 'user', content: context },
//         ],
//         temperature: 0.7,
//         max_tokens: 100,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${config.OPENROUTER_API_KEY}`, // ✅ Must be valid
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     return response.data.choices[0].message.content.trim();
//   } catch (err) {
//     console.error(`AI ${agent} error:`, err.response?.data || err.message);
//     return getFallbackSuggestion(agent);
//   }
// }; 

export const getAIRecommendation = async (agent, context) => {
  try {
    let systemPrompt = '';
    let userPrompt = `User data: ${context}\n\nRespond with exactly one short, actionable tip in 8 words or fewer. No explanations. No greetings. Just the tip.`;

    if (agent === 'nutrition') {
      systemPrompt = 'You are a strict nutritionist. Give one ultra-short diet tip.';
    } else if (agent === 'movement') {
      systemPrompt = 'You are a fitness coach. Give one ultra-short movement tip.';
    } else {
      systemPrompt = 'You are a wellness advisor. Give one ultra-short lifestyle tip.';
    }

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        // model: 'mistralai/mistral-7b-instruct',
        model: 'meta-llama/llama-3-8b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // ↓ lower = more focused
        max_tokens: 20,   // ↓ limit length
      },
      {
        headers: {
          Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

  let tip = response.data.choices[0].message.content.trim();

  
  tip = tip
    .replace(/<s>/g, '')           // Remove <s>
    .replace(/\[OUT\]/g, '')       // Remove [OUT]
    .replace(/\[\/OUT\]/g, '')     // Remove [/OUT]
    .replace(/<\/?s>/g, '')        // Remove </s> or <s>
    .replace(/^["'\s]+|["'\s]+$/g, '') // Trim quotes and spaces
    .replace(/\*+/g, '')           // Remove **bold** markers
    .split('\n')[0]                // Take only first line
    .trim();

  // Remove common prefixes
  if (tip.toLowerCase().startsWith('tip:')) {
    tip = tip.substring(4).trim();
  }
  if (tip.toLowerCase().startsWith('action:')) {
    tip = tip.substring(8).trim();
  }

  // If empty or too long, use fallback
  if (!tip || tip.length === 0 || tip.length > 100) {
    return getFallbackSuggestion(agent);
  }

  return tip;
  } catch (err) {
    console.error(`AI ${agent} error:`, err.response?.data || err.message);
    return getFallbackSuggestion(agent);
  }
};

// Fallback if AI fails
const getFallbackSuggestion = (agent, context) => {
  if (agent === 'nutrition') return 'Drink more water and add protein to your meals.';
  if (agent === 'movement') return 'Take a 10-minute walk after meals.';
  return 'Set a bedtime reminder to improve sleep consistency.';
}; 

export default {
  getAIRecommendation
};