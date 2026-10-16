import type { GenerateContentConfig, GoogleGenAI } from '@google/genai';
import { NDJSON_CONTENT_TYPE, type StreamEvent } from '@/lib/streamProtocol';

/** Server-side helpers for the streaming API routes. */

export type SendEvent<T> = (event: StreamEvent<T>) => void;

/**
 * Builds a streaming NDJSON Response. `run` pushes events with `send`; the stream
 * closes when `run` finishes. An unexpected throw becomes an `error` event.
 */
export function ndjsonResponse<T>(run: (send: SendEvent<T>) => Promise<void>): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send: SendEvent<T> = (event) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
        } catch {
          closed = true; // client went away
        }
      };

      try {
        await run(send);
      } catch (err) {
        console.error('[stream] route failed:', err);
        send({ type: 'error', error: 'Something went wrong while generating. Please try again.' });
      } finally {
        closed = true;
        try {
          controller.close();
        } catch {}
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': NDJSON_CONTENT_TYPE,
      // stop proxies / dev servers from buffering the stream into one chunk
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no'
    }
  });
}

export interface StreamedGeneration {
  /** the full JSON text of the answer (thought parts excluded) */
  text: string;
  /** whether any answer text was sent to the client yet */
  sentAnyText: boolean;
  usage: unknown;
}

/**
 * Calls Gemini in streaming mode and forwards pieces to the client as they arrive:
 * reasoning-summary parts as `thought` events, answer parts as `delta` events.
 */
export async function streamGeminiToClient<T>(
  ai: GoogleGenAI,
  params: { model: string; contents: string; config: GenerateContentConfig },
  send: SendEvent<T>
): Promise<StreamedGeneration> {
  const result: StreamedGeneration = { text: '', sentAnyText: false, usage: undefined };

  const stream = await ai.models.generateContentStream(params);
  for await (const chunk of stream) {
    const parts = chunk.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (!part.text) continue;
      if (part.thought) {
        send({ type: 'thought', text: part.text });
      } else {
        result.text += part.text;
        result.sentAnyText = true;
        send({ type: 'delta', text: part.text });
      }
    }
    if (chunk.usageMetadata) result.usage = chunk.usageMetadata;
  }

  return result;
}
