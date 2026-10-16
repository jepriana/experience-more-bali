'use client';

import { useCallback, useMemo } from 'react';
import { useSessionState } from '@/context/SessionStateContext';
import { parsePartialJson, lastPathOf } from '@/lib/partialJson';
import type { StreamEvent, StreamResultMeta } from '@/lib/streamProtocol';

/** Every field optional, recursively — what a half-written answer looks like. */
export type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export type StreamPhase = 'idle' | 'thinking' | 'writing' | 'error';

export interface AiStreamState {
  phase: StreamPhase;
  /** reasoning summary streamed before the answer (traveler only) */
  thoughts: string;
  /** the JSON answer text received so far */
  raw: string;
  error?: string;
}

const IDLE: AiStreamState = { phase: 'idle', thoughts: '', raw: '' };

export interface AiStreamFinal<T> extends StreamResultMeta {
  data: T;
  /** the full reasoning summary, kept so the UI can offer "How the AI reasoned" afterwards */
  thoughts: string;
}

/**
 * Runs a streaming AI request and exposes the half-written answer as a live object.
 *
 * State lives in the session store (not persisted), so switching tabs mid-generation
 * keeps the stream running and visible when you come back.
 */
export function useAiStream<T>(key: string) {
  const [state, setState] = useSessionState<AiStreamState>(`${key}.stream`, IDLE, { persist: false });

  const partial = useMemo(
    () => (state.raw ? (parsePartialJson(state.raw) as DeepPartial<T> | undefined) : undefined),
    [state.raw]
  );

  /** dot-path of the field being written right now, e.g. "days.2.familyMission" */
  const activePath = useMemo(
    () => (state.phase === 'writing' && partial ? lastPathOf(partial).join('.') : null),
    [state.phase, partial]
  );

  const isStreaming = state.phase === 'thinking' || state.phase === 'writing';

  const start = useCallback(
    async (url: string, body: unknown, onFinal: (final: AiStreamFinal<T>) => void) => {
      setState({ phase: 'thinking', thoughts: '', raw: '' });
      let thoughts = '';
      let finished = false;

      const fail = (message: string) => {
        finished = true;
        setState((s) => ({ ...s, phase: 'error', error: message }));
      };

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (!res.ok || !res.body) {
          const payload = await res.json().catch(() => null);
          return fail(payload?.error ?? `Request failed (${res.status}).`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const handle = (line: string) => {
          if (!line.trim()) return;
          let event: StreamEvent<T>;
          try {
            event = JSON.parse(line);
          } catch {
            return; // ignore a malformed line rather than killing the whole answer
          }
          switch (event.type) {
            case 'thought':
              thoughts += event.text;
              setState((s) => ({ ...s, thoughts: s.thoughts + event.text }));
              break;
            case 'delta':
              setState((s) => ({ ...s, phase: 'writing', raw: s.raw + event.text }));
              break;
            case 'final': {
              finished = true;
              const { data, isAiGenerated, model, fallbackReason } = event;
              onFinal({ data, isAiGenerated, model, fallbackReason, thoughts });
              setState(IDLE);
              break;
            }
            case 'error':
              fail(event.error);
              break;
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          lines.forEach(handle);
        }
        handle(buffer + decoder.decode());

        if (!finished) fail('The connection closed before the answer finished. Please try again.');
      } catch (err) {
        console.error('AI stream failed:', err);
        if (!finished) fail('Could not reach the AI service. Check your connection and try again.');
      }
    },
    [setState]
  );

  const dismissError = useCallback(() => setState(IDLE), [setState]);

  return { state, partial, activePath, isStreaming, start, dismissError };
}
