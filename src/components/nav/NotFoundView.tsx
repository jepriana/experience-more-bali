'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { NextSteps } from '@/components/nav/NextSteps';

/** 404 with ways forward instead of a dead end. */
export function NotFoundView() {
  const { t } = useLanguage();
  const n = t.eco.next;
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-emerald-400">404</p>
        <h1 className="text-3xl font-extrabold text-stone-50">{n.notFoundTitle}</h1>
        <p className="text-stone-400">
          {n.notFoundDesc}{' '}
          <Link href="/" className="text-emerald-400 underline underline-offset-4">
            KOSSI Adventure
          </Link>
        </p>
      </div>
      <NextSteps items={['plan', 'memories', 'connect', 'partner']} title={n.title} />
    </div>
  );
}
