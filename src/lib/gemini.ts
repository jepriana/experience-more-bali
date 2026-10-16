import { GoogleGenAI, ThinkingLevel, type GenerateContentConfig } from '@google/genai';

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
export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';
export const GEMINI_38_FLASH = 'gemini-3.8-flash';
/** Different model used when the primary call fails, so the retry actually changes something. */
export const FALLBACK_GEMINI_MODEL = 'gemini-3.1-flash-lite';

/**
 * Shared speed settings for every structured-output call.
 * - thinkingLevel MINIMAL: Gemini 3.x thinks by default, which was most of the ~48s wait.
 *   If a model rejects MINIMAL, the error is logged — switch to ThinkingLevel.LOW.
 * - maxOutputTokens: hard cap so a rambling answer can't run long (still room for Bahasa output).
 * - httpOptions.timeout: give up after 25s so the fallback kicks in instead of hanging.
 */
export const FAST_GENERATION_CONFIG: GenerateContentConfig = {
  temperature: 0.2,
  maxOutputTokens: 4096,
  thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
  httpOptions: { timeout: 25_000 }
};

/**
 * Streaming variant: the user sees text arriving, so a longer overall budget is fine.
 * (httpOptions.timeout covers the whole streamed response, so it must outlast the full answer.)
 */
export const STREAMING_GENERATION_CONFIG: GenerateContentConfig = {
  ...FAST_GENERATION_CONFIG,
  httpOptions: { timeout: 60_000 }
};

/**
 * Streaming + visible reasoning (traveler itinerary): the model streams short summaries of
 * its thinking before the answer, shown live in the "AI is thinking" box.
 * LOW (not MINIMAL) so there is actual reasoning to show; extra token room for the thoughts.
 * If a model rejects this, the error is logged and the route falls back.
 */
export const REASONING_STREAM_CONFIG: GenerateContentConfig = {
  ...STREAMING_GENERATION_CONFIG,
  maxOutputTokens: 8192,
  thinkingConfig: { thinkingLevel: ThinkingLevel.LOW, includeThoughts: true }
};

/** Logs where the time/tokens went: thinking vs answer vs prompt. */
export function logGeminiUsage(label: string, model: string, startedAt: number, usage: unknown) {
  console.log(`[gemini] ${label} model=${model} took=${Date.now() - startedAt}ms`, usage);
}
