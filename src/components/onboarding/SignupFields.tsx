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
  // Tie the error to its field so screen readers announce it with the field
  const errorId = htmlFor && error ? `${htmlFor}-error` : undefined;
  const field =
    errorId && React.isValidElement<React.HTMLAttributes<HTMLElement>>(children)
      ? React.cloneElement(children, { 'aria-invalid': true, 'aria-describedby': errorId } as React.HTMLAttributes<HTMLElement>)
      : children;

  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-stone-200 block">
        {label}
      </label>
      {field}
      {error && (
        <p id={errorId} className="text-sm text-red-400 font-semibold stream-in" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  'w-full border rounded-lg px-3.5 py-3 text-base';

/** Accepts an email address or a phone number with at least 8 digits. */
export function isValidContact(value: string): boolean {
  const v = value.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return true;
  return v.replace(/\D/g, '').length >= 8 && /^[+\d\s()-]+$/.test(v);
}
