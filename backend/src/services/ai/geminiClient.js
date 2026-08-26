import { GoogleGenAI } from '@google/genai';

let aiInstance = null;

const getGenAI = () => {
  if (aiInstance) return aiInstance;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. AI features will use static fallbacks.');
    return null;
  }
  
  aiInstance = new GoogleGenAI({ apiKey });
  return aiInstance;
};

/**
 * Calls Gemini API to generate structured JSON output.
 * Never throws. Returns null on timeout or any error.
 */
export const generateStructured = async ({ prompt, schema, timeoutMs = 8000 }) => {
  const ai = getGenAI();
  if (!ai) return null;

  try {
    const apiCall = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timed out')), timeoutMs)
    );

    const response = await Promise.race([apiCall, timeoutPromise]);
    
    // Attempt to parse the response as JSON
    const text = response.text();
    return JSON.parse(text);
  } catch (err) {
    console.warn('AI generation failed (using fallback):', err.message);
    return null;
  }
};
