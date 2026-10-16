'use client';

import React, { createContext, useCallback, useContext, useRef, useState, useSyncExternalStore } from 'react';

/**
 * Session-wide UI state that must survive tab switches (and page refreshes).
 *
 * Why: page.tsx unmounts a tab when you switch away, so any plain useState inside
 * TravelerPlatform / PartnerPlatform / QrMemoryPlatform was lost. State that belongs
 * to the user's session (itinerary, forms, generated results, passport) lives here
 * instead, above the tabs.
 *
 * - useSessionState(key, initial)                     -> survives tab switches AND refresh (sessionStorage)
 * - useSessionState(key, initial, { persist: false }) -> survives tab switches only (e.g. isLoading)
 *
 * sessionStorage is per browser tab and is cleared when the tab is closed.
 */

const STORAGE_KEY = 'emb_session_state_v1';

type Store = Record<string, unknown>;
type SetStore = (action: React.SetStateAction<Store>) => void;

// ───────── Persisted store: a tiny external store backed by sessionStorage ─────────
// useSyncExternalStore renders the empty server snapshot during hydration, then the
// stored values — no hydration mismatch and no setState-in-effect.

const EMPTY: Store = {};
let cache: Store | null = null;
const listeners = new Set<() => void>();

function readPersisted(): Store {
  if (cache === null) {
    try {
      cache = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}') as Store;
    } catch {
      cache = {};
    }
  }
  return cache;
}

function writePersisted(next: Store) {
  cache = next;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('Could not save session state:', e);
  }
  listeners.forEach((listener) => listener());
}

const setPersisted: SetStore = (action) =>
  writePersisted(typeof action === 'function' ? action(readPersisted()) : action);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ───────── Context ─────────

interface SessionStateContextType {
  persisted: Store;
  ephemeral: Store;
  setPersisted: SetStore;
  setEphemeral: SetStore;
  clearSession: () => void;
}

const SessionStateContext = createContext<SessionStateContextType | null>(null);

export function SessionStateProvider({ children }: { children: React.ReactNode }) {
  const persisted = useSyncExternalStore(subscribe, readPersisted, () => EMPTY);
  const [ephemeral, setEphemeral] = useState<Store>({});

  const clearSession = useCallback(() => {
    writePersisted({});
    setEphemeral({});
  }, []);

  return (
    <SessionStateContext.Provider value={{ persisted, ephemeral, setPersisted, setEphemeral, clearSession }}>
      {children}
    </SessionStateContext.Provider>
  );
}

/** Drop-in replacement for useState whose value lives in the session store under `key`. */
export function useSessionState<T>(
  key: string,
  initial: T,
  options: { persist?: boolean } = {}
): [T, (next: React.SetStateAction<T>) => void] {
  const ctx = useContext(SessionStateContext);
  if (!ctx) throw new Error('useSessionState must be used inside <SessionStateProvider>');

  const persist = options.persist ?? true;
  const store = persist ? ctx.persisted : ctx.ephemeral;
  const setStore = persist ? ctx.setPersisted : ctx.setEphemeral;

  // Keep the first `initial` so callers can pass fresh literals each render.
  const initialRef = useRef(initial);

  const value = (key in store ? store[key] : initial) as T;

  const setValue = useCallback(
    (next: React.SetStateAction<T>) => {
      setStore((prev) => {
        const current = (key in prev ? prev[key] : initialRef.current) as T;
        const resolved =
          typeof next === 'function' ? (next as (previous: T) => T)(current) : next;
        return { ...prev, [key]: resolved };
      });
    },
    [key, setStore]
  );

  return [value, setValue];
}

/** Clears all session state (e.g. a future "Start over" button). */
export function useClearSession() {
  const ctx = useContext(SessionStateContext);
  if (!ctx) throw new Error('useClearSession must be used inside <SessionStateProvider>');
  return ctx.clearSession;
}
