'use client';

import React from 'react';

/** Small shared building blocks for the sign-up forms. */

export function Field({
  label,
  error,
  htmlFor,
  children
}: {
  label: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-xs font-bold uppercase tracking-wider text-stone-300 block">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-300 stream-in" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  'w-full bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow';

/** Accepts an email address or a phone number with at least 8 digits. */
export function isValidContact(value: string): boolean {
  const v = value.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return true;
  return v.replace(/\D/g, '').length >= 8 && /^[+\d\s()-]+$/.test(v);
}
