// src/services/aiService.js
import axios from 'axios';
import APIError from '~/utils/apiError';
import httpStatus from 'http-status';

const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://api.openrouter.ai/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3-8b-instruct'; // make configurable

if (!OPENROUTER_API_KEY) {
  // don't throw on import to avoid breaking tests — throw when actually used
  // but you may optionally log a warning here
}

/**
 * Calls OpenRouter to generate a meal plan based on profile and target calories.
 * Returns the parsed JSON from the model (shape depends on your prompt).
 */
export async function generateMealPlan({ userProfile, targetCalories }) {
  if (!OPENROUTER_API_KEY) {
    throw new APIError('OpenRouter API key not configured', httpStatus.INTERNAL_SERVER_ERROR);
  }

  // Craft a prompt that returns a JSON structure — very important for reliable parsing.
  const systemPrompt = `You are a nutrition assistant. Respond ONLY in JSON. Provide "meals" array, each item { "name": "Breakfast", "items": "Oats + Banana", "calories": 320, "protein": 6, "carbs": 48, "fats": 5 }. Be concise.`;
  const userPrompt = `User profile: ${JSON.stringify(userProfile)}. Target calories: ${targetCalories}. Generate 4 meals (breakfast, lunch, dinner, snack) with approximate calories and macros. Output valid JSON only.`;

  const body = {
    model: OPENROUTER_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 500,
    temperature: 0.2,
  };

  try {
    const resp = await axios.post(OPENROUTER_API_URL, body, {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 15_000,
    });

    // Example: resp.data.choices[0].message.content -> JSON string
    const content = resp?.data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenRouter');

    // Try parse content (since system prompt asks for JSON)
    let parsed;
    try {
      parsed = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (e) {
      // If parsing fails, try to extract JSON substring
      const jsonMatch = content.match(/(\{[\s\S]*\})/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[1]) : null;
    }

    return parsed;
  } catch (err) {
    // wrap axios errors
    throw new APIError('Failed to call OpenRouter: ' + (err.message || ''), httpStatus.BAD_GATEWAY);
  }
}

export default { generateMealPlan };
