import { NextResponse } from 'next/server';
import { DEFAULT_GEMINI_MODEL, isGeminiConfigured } from '@/lib/gemini';

export async function GET() {
  const configured = isGeminiConfigured();
  return NextResponse.json({
    configured,
    model: DEFAULT_GEMINI_MODEL,
    sdk: '@google/genai',
    datasetCount: 9,
    timestamp: new Date().toISOString()
  });
}
