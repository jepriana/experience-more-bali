'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, BrainCircuit, ChevronDown, CloudOff, RotateCcw, Sparkles, X } from 'lucide-react';
import type { StreamResultMeta } from '@/lib/streamProtocol';

/** Shared pieces for streaming AI output: typing cursor, skeletons, thinking panel, badges. */

/**
 * Smoothly brings the output panel into view when its top is hidden (under the sticky
 * header, or below the fold on small screens), so the user sees the answer start streaming.
 */
export function revealOutput(el: HTMLElement | null) {
  if (!el) return;
  const top = el.getBoundingClientRect().top;
  const headerOffset = 150; // sticky navbar height + breathing room
  if (top >= headerOffset && top <= window.innerHeight * 0.6) return;

  const from = window.scrollY;
  const to = Math.max(0, from + top - headerOffset);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, to);
    return;
  }
  // Animated by hand: the browser's native smooth scroll gets cancelled by the
  // re-renders that start the moment the stream begins.
  const duration = 450;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    window.scrollTo(0, from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Text that is still being written shows a blinking cursor at its end. */
export function StreamText({ text, active }: { text?: string | null; active?: boolean }) {
  return (
    <>
      {text}
      {active && <span className="stream-caret" aria-hidden="true" />}
    </>
  );
}

/** Shimmering placeholder line(s) for content the model hasn't written yet. */
export function Skeleton({ className = 'h-3 w-full', lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`shimmer rounded-md ${className}`}
          style={lines > 1 && i === lines - 1 ? { width: '60%' } : undefined}
        />
      ))}
    </div>
  );
}

/** "Live AI · model" or "Offline demo" — so viewers always know what they're looking at. */
export function AiSourceBadge({
  meta,
  liveLabel,
  offlineLabel
}: {
  meta: StreamResultMeta | null | undefined;
  liveLabel: string;
  offlineLabel: string;
}) {
  if (!meta) return null;
  if (meta.isAiGenerated) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 ">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {liveLabel}
        {meta.model && <span className="text-emerald-400 font-normal">· {meta.model}</span>}
      </span>
    );
  }
  return (
    <span
      title={meta.fallbackReason}
      className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700 cursor-help"
    >
      <CloudOff className="w-3 h-3" />
      {offlineLabel}
    </span>
  );
}

/** Renders Gemini's reasoning summary: "**Heading**" lines become small headings. */
function ThoughtText({ text }: { text: string }) {
  const blocks = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  return (
    <>
      {blocks.map((line, i) => {
        const heading = line.match(/^\*\*(.+?)\*\*$/);
        return heading ? (
          <p key={i} className="font-semibold text-emerald-300 pt-1 first:pt-0">
            {heading[1]}
          </p>
        ) : (
          <p key={i} className="text-stone-300">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      })}
    </>
  );
}

/**
 * Live "AI is thinking" panel. While streaming it shows the model's reasoning as it
 * arrives (or rotating status lines if the model sends no reasoning); afterwards it
 * collapses into an expandable "How the AI reasoned".
 */
export function ThinkingPanel({
  live,
  thoughts,
  status,
  idleStatuses,
  title,
  doneTitle
}: {
  live: boolean;
  thoughts: string;
  /** what the model is doing right now, e.g. "Planning day 2…" (null while still reasoning) */
  status: string | null;
  /** rotated while waiting for the first output, when no reasoning text is available */
  idleStatuses: string[];
  title: string;
  doneTitle: string;
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setTick((n) => n + 1), 2200);
    return () => clearInterval(id);
  }, [live]);

  if (!live) {
    if (!thoughts.trim()) return null;
    return (
      <details className="group bg-stone-900/70 border border-stone-800 rounded-2xl px-4 py-3 text-xs stream-in">
        <summary className="flex items-center gap-2 cursor-pointer list-none text-stone-300 hover:text-stone-50 select-none">
          <BrainCircuit className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">{doneTitle}</span>
          <ChevronDown className="w-4 h-4 ml-auto transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3 space-y-1.5 leading-relaxed max-h-64 overflow-y-auto pr-1">
          <ThoughtText text={thoughts} />
        </div>
      </details>
    );
  }

  const currentStatus = status ?? idleStatuses[tick % Math.max(idleStatuses.length, 1)];

  return (
    <div
      className="thinking-glow bg-stone-900 border rounded-2xl p-4 sm:p-5 space-y-3 stream-in"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2.5">
        <span className="relative flex w-2.5 h-2.5">
          <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
          <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </span>
        <span className="text-xs font-bold text-stone-50 flex items-center gap-1.5">
          <BrainCircuit className="w-4 h-4 text-emerald-400" />
          {title}
        </span>
        <span key={currentStatus} className="ml-auto text-xs text-emerald-300/90 stream-in truncate">
          {currentStatus}
        </span>
      </div>

      {thoughts.trim() ? (
        // flex-col-reverse keeps the newest reasoning pinned to the bottom as text arrives
        <div className="fade-top-mask max-h-32 overflow-hidden flex flex-col-reverse">
          <div className="text-xs leading-relaxed space-y-1">
            <ThoughtText text={thoughts} />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span key={tick} className="stream-in">
            {idleStatuses[tick % Math.max(idleStatuses.length, 1)]}
          </span>
        </div>
      )}
    </div>
  );
}

/** Inline error with retry — replaces browser alert() popups. */
export function StreamErrorBanner({
  title,
  message,
  retryLabel,
  dismissLabel,
  onRetry,
  onDismiss
}: {
  title: string;
  message: string;
  retryLabel?: string;
  dismissLabel: string;
  onRetry?: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="bg-red-950/40 border border-red-800/60 rounded-2xl p-4 flex items-start gap-3 text-xs stream-in" role="alert">
      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-0.5">
        <p className="font-bold text-red-200">{title}</p>
        <p className="text-red-200/80">{message}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {onRetry && retryLabel && (
          <button
            onClick={onRetry}
            className="px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800/70 text-red-100 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {retryLabel}
          </button>
        )}
        <button
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="p-1 rounded-lg text-red-300 hover:text-stone-50 hover:bg-red-900/60 cursor-pointer transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
