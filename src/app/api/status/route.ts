import { NextResponse } from 'next/server';
import { isGeminiConfigured } from '@/lib/gemini';

export async function GET() {
  const configured = isGeminiConfigured();
  return NextResponse.json({
    configured,
    model: 'gemini-2.5-flash',
    sdk: '@google/genai',
    datasetCount: 9,
    timestamp: new Date().toISOString()
  });
}
