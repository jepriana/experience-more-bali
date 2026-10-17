'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY } from '@/lib/themeScript';

/**
 * Dark / light mode. The choice is saved on this device; dark (the original look) is the
 * default. The <html data-theme> attribute is set by a tiny script in the layout before the
 * page paints, so there is no flash of the wrong colours on load.
 */

export type Theme = 'dark' | 'light';
const listeners = new Set<() => void>();

function read(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) {
      document.documentElement.dataset.theme = e.newValue === 'light' ? 'light' : 'dark';
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => 'dark' as Theme);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
    listeners.forEach((l) => l());
  }, []);

  const toggleTheme = useCallback(() => setTheme(read() === 'dark' ? 'light' : 'dark'), [setTheme]);

  return { theme, setTheme, toggleTheme };
}
