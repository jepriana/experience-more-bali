'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Images, Map as MapIcon, Store, Users, type LucideIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export type NextStepId = 'memories' | 'connect' | 'plan' | 'partner';

const ROUTES: Record<NextStepId, { href: string; icon: LucideIcon }> = {
  memories: { href: '/memory', icon: Images },
  connect: { href: '/connect', icon: Users },
  plan: { href: '/traveler', icon: MapIcon },
  partner: { href: '/partner', icon: Store }
};

/** "What's next" links at the end of a page, so no page is a dead end. */
export function NextSteps({ items, title }: { items: NextStepId[]; title?: string }) {
  const { t } = useLanguage();
  const n = t.eco.next;
  const heading = title ?? n.title;
  return (
    <nav aria-label={heading} className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">{heading}</h2>
      <ul className={`grid grid-cols-1 gap-3 ${items.length > 1 ? 'sm:grid-cols-2' : ''} ${items.length > 2 ? 'lg:grid-cols-3' : ''}`}>
        {items.map((id) => {
          const { href, icon: Icon } = ROUTES[id];
          return (
            <li key={id}>
              <Link
                href={href}
                className="group h-full flex items-start gap-3 rounded-2xl border border-stone-800 bg-stone-900 p-4 hover:border-emerald-700 transition-colors"
              >
                <Icon className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" aria-hidden="true" />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5 font-bold text-stone-50">
                    {n[id].title}
                    <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-emerald-400 transition-colors" aria-hidden="true" />
                  </span>
                  <span className="block text-sm text-stone-400 mt-0.5">{n[id].desc}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
