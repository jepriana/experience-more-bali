/**
 * Wire format shared by the streaming API routes and the browser.
 *
 * The server sends newline-delimited JSON (NDJSON): one event per line.
 *   thought -> a piece of the model's reasoning summary (traveler only)
 *   delta   -> the next piece of the JSON answer as it is being written
 *   final   -> the validated answer (or an honest fallback) — always the last event on success
 *   error   -> something went wrong; no final will follow
 */

export interface StreamResultMeta {
  /** true only when the answer came from Gemini AND passed schema validation */
  isAiGenerated: boolean;
  /** the model that actually answered (absent for the offline fallback) */
  model?: string;
  /** why the offline fallback was used, when it was */
  fallbackReason?: string;
}

export type StreamEvent<T> =
  | { type: 'thought'; text: string }
  | { type: 'delta'; text: string }
  | ({ type: 'final'; data: T } & StreamResultMeta)
  | { type: 'error'; error: string };

export const NDJSON_CONTENT_TYPE = 'application/x-ndjson; charset=utf-8';
