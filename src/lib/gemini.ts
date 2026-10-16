import { GoogleGenAI } from '@google/genai';

/**
 * Singleton instance of Google Gen AI SDK client.
 */
let geminiInstance: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    throw new Error(
      'GEMINI_API_KEY is missing or invalid. Please configure your key in .env.local'
    );
  }

  if (!geminiInstance) {
    geminiInstance = new GoogleGenAI({ apiKey });
  }

  return geminiInstance;
}

/**
 * Helper to check whether a valid Gemini API Key is configured in the environment.
 */
export function isGeminiConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here');
}

/**
 * Default recommended Gemini model for fast and grounded multimodal tasks.
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
export const GEMINI_38_FLASH = 'gemini-3.8-flash';
