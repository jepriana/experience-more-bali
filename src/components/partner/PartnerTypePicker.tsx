'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PARTNER_GROUPS, typesInGroup, type PartnerTypeId } from '@/data/partnerGroups';

/**
 * Pick one partner type, shown in the KOSSI network's groups:
 * A core · B local economy · C movement & strategic · territorial · ecosystem enablers.
 */
export function PartnerTypePicker({
  value,
  onChange,
  labelledBy
}: {
  value: PartnerTypeId | undefined;
  onChange: (type: PartnerTypeId) => void;
  labelledBy?: string;
}) {
  const { language } = useLanguage();
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="space-y-3">
      {PARTNER_GROUPS.map((g) => (
        <div key={g.id}>
          <div className="text-xs font-semibold text-stone-400 mb-1.5">
            {g.id === 'T' || g.id === 'E' ? '' : `${g.id} · `}
            {g.name[language]} <span className="text-stone-500 font-normal">— {g.tagline[language]}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {typesInGroup(g.id).map((t) => {
              const on = value === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onChange(t.id)}
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    on
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-stone-500'
                  }`}
                >
                  {on ? (
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : t.no ? (
                    <span className="text-xs text-stone-500 font-bold" aria-hidden="true">
                      {t.no}
                    </span>
                  ) : null}
                  {t.name[language]}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
