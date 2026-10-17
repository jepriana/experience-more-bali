'use client';

import React, { createContext, useContext, useCallback, useSyncExternalStore, useEffect } from 'react';
import { Language, Translations, translations } from '@/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const STORAGE_KEY = 'emb_language_preference_v1';

const listeners = new Set<() => void>();
let cachedLang: Language | null = null;

function subscribe(callback: () => void) {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cachedLang = null;
      callback();
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
}

function getSnapshot(): Language {
  if (cachedLang !== null) return cachedLang;
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored === 'en' || stored === 'id') {
      cachedLang = stored;
      return cachedLang;
    }
    const navLang = typeof navigator !== 'undefined' ? navigator.language?.toLowerCase() || '' : '';
    if (navLang.startsWith('id')) {
      cachedLang = 'id';
      return cachedLang;
    }
  } catch {}
  cachedLang = 'en';
  return cachedLang;
}

function getServerSnapshot(): Language {
  return 'en';
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.en
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLanguage = useCallback((lang: Language) => {
    cachedLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
    listeners.forEach((l) => l());
  }, []);

  const toggleLanguage = useCallback(() => {
    const nextLang = (cachedLang ?? getSnapshot()) === 'en' ? 'id' : 'en';
    setLanguage(nextLang);
  }, [setLanguage]);

  // Screen readers pick their voice from <html lang>, so keep it in sync with the toggle
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t: translations[language]
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
