'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, Plus, Users } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getBaliRegion } from '@/data/regions';
import { fmt } from '@/i18n/ecosystem';
import type { Cluster } from '@/lib/ecosystemTypes';
import type { TripState } from '@/components/trip/useTrip';

/**
 * Basket step: area clusters (partners in the same area who work together) in the chosen
 * regions. "Add whole cluster" puts every listed member into the basket in one tap.
 */
export function ClusterOffers({ trip }: { trip: TripState }) {
  const { t } = useLanguage();
  const b = t.eco.basketClusters;
  const [clusters, setClusters] = useState<Cluster[]>([]);

  useEffect(() => {
    let alive = true;
    fetch('/api/network', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { clusters: [] }))
      .then((d) => alive && setClusters(d.clusters ?? []))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const { partners, regions } = trip;
  const offers = useMemo(() => {
    const known = new Set(partners.map((p) => p.id));
    const chosen = new Set<string>(regions);
    return clusters
      .filter((c) => chosen.has(c.regionId))
      .map((c) => ({ cluster: c, ids: c.members.map((m) => m.listingId).filter((id): id is string => !!id && known.has(id)) }))
      .filter((o) => o.ids.length >= 2);
  }, [clusters, partners, regions]);

  if (offers.length === 0) return null;

  return (
    <section aria-labelledby="clusters-basket-title" className="space-y-2 pt-2">
      <h3 id="clusters-basket-title" className="flex items-center gap-2 text-sm font-bold text-stone-50">
        <Users className="w-4 h-4 text-emerald-400" aria-hidden="true" />
        {b.title}
        <span className="text-xs font-normal text-stone-500">{b.desc}</span>
      </h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {offers.map(({ cluster: c, ids }) => {
          const all = ids.every((id) => trip.basket.includes(id));
          const names = ids.map((id) => trip.partners.find((p) => p.id === id)?.name).filter(Boolean);
          return (
            <li key={c.id} className={`rounded-xl border p-3 space-y-2 ${all ? 'bg-stone-900 border-emerald-800/70' : 'bg-stone-900/50 border-stone-800'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-stone-50">{c.name}</p>
                  <p className="text-xs text-stone-500">
                    {[getBaliRegion(c.regionId)?.name, c.area].filter(Boolean).join(' · ')} · {fmt(b.members, { n: ids.length })}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={all}
                  onClick={() => trip.addToBasket(ids)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    all ? 'bg-emerald-950 text-emerald-300 cursor-default' : 'bg-emerald-600 hover:bg-(--action-hover) text-white'
                  }`}
                >
                  {all ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Plus className="w-3.5 h-3.5" aria-hidden="true" />}
                  {all ? b.added : b.add}
                  <span className="sr-only">: {c.name}</span>
                </button>
              </div>
              {c.package && (
                <p className="text-xs text-stone-300">
                  <span className="font-semibold text-amber-300">
                    {c.package.title} −{c.package.discount}%
                  </span>{' '}
                  · {c.package.details}
                </p>
              )}
              <p className="text-xs text-stone-500">{names.join(' · ')}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
