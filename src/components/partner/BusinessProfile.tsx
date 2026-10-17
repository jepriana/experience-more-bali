'use client';

import React, { useState } from 'react';
import {
  BedDouble,
  Bike,
  Car,
  Check,
  CheckCircle2,
  MapPin,
  Plus,
  ShoppingBag,
  UtensilsCrossed,
  X,
  type LucideIcon
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAccounts } from '@/lib/accounts';
import { fill } from '@/i18n/stage3';
import {
  AI_SUPPORT_OPTIONS,
  BUSINESS_SUBTYPES,
  DIGITAL_CHANNELS,
  DIGITAL_STATUSES,
  DISCOUNT_OPTIONS,
  EMPTY_PROFILE,
  FACILITIES,
  PRODUCT_SUGGESTIONS,
  profileCompleteness,
  type BusinessType,
  type DigitalStatus,
  type PartnerBusinessProfile
} from '@/data/partnerProfile';
import { SupportPlanPanel } from '@/components/partner/SupportPlanPanel';

const TYPE_ICONS: Record<BusinessType, LucideIcon> = {
  Destination: MapPin,
  Accommodation: BedDouble,
  Culinary: UtensilsCrossed,
  Activity: Bike,
  LocalProducts: ShoppingBag,
  Transport: Car
};

const STATUS_STYLE: Record<DigitalStatus, string> = {
  managed: 'bg-emerald-600 border-emerald-500 text-white',
  onoff: 'bg-amber-600 border-amber-500 text-white',
  help: 'bg-rose-600 border-rose-500 text-white'
};

/**
 * Partner menus A–E from the team lead's design: everything is a tap, saved instantly to the
 * partner account — no "submit" button, so it never feels like filling in a form.
 */
export function BusinessProfile() {
  const { t } = useLanguage();
  const p = t.profile;
  const { partner, savePartner } = useAccounts();
  const [custom, setCustom] = useState('');
  if (!partner) return null;

  const profile: PartnerBusinessProfile = { ...EMPTY_PROFILE, ...partner.profile };
  const update = (patch: Partial<PartnerBusinessProfile>) =>
    savePartner({ ...partner, profile: { ...profile, ...patch } });
  const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const done = profileCompleteness(profile);
  const productChoices = [
    ...(profile.type ? PRODUCT_SUGGESTIONS[profile.type] : []),
    ...profile.products.filter((x) => !profile.type || !PRODUCT_SUGGESTIONS[profile.type].includes(x))
  ];

  const addCustom = () => {
    const v = custom.trim().slice(0, 60);
    if (v && !profile.products.includes(v)) update({ products: [...profile.products, v] });
    setCustom('');
  };

  return (
    <div className="space-y-5">
      {/* Header + progress */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{p.title}</h2>
          <p className="text-sm text-stone-400 mt-1">{p.subtitle}</p>
        </div>
        <div className="shrink-0 min-w-44">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-stone-300 font-semibold">{fill(p.progress, done)}</span>
            {done > 0 && (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {p.savedAuto}
              </span>
            )}
          </div>
          <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${(done / 5) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* A. Business type */}
      <Section letter="A" title={p.secA} desc={p.secADesc} done={!!profile.type}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {(Object.keys(TYPE_ICONS) as BusinessType[]).map((type) => {
            const Icon = TYPE_ICONS[type];
            const on = profile.type === type;
            return (
              <button
                key={type}
                onClick={() => update({ type, subtypes: on ? profile.subtypes : [] })}
                aria-pressed={on}
                className={`p-3 rounded-xl border text-sm font-semibold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  on
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950/40'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                {p.types[type]}
              </button>
            );
          })}
        </div>
        {profile.type && (
          <Chips
            items={BUSINESS_SUBTYPES[profile.type]}
            selected={profile.subtypes}
            onToggle={(x) => update({ subtypes: toggle(profile.subtypes, x) })}
          />
        )}
        <div className="pt-1">
          <div className="text-[11px] uppercase tracking-wider text-stone-500 font-bold mb-2">{p.secAFacilities}</div>
          <Chips items={FACILITIES} selected={profile.facilities} onToggle={(x) => update({ facilities: toggle(profile.facilities, x) })} />
        </div>
      </Section>

      {/* B. Products & services */}
      <Section letter="B" title={p.secB} desc={p.secBDesc} done={profile.products.length > 0}>
        {productChoices.length > 0 && (
          <Chips items={productChoices} selected={profile.products} onToggle={(x) => update({ products: toggle(profile.products, x) })} />
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addCustom();
          }}
          className="flex gap-2"
        >
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            maxLength={60}
            placeholder={p.addProductPlaceholder}
            className="flex-1 min-w-0 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!custom.trim()}
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {p.add}
          </button>
        </form>
      </Section>

      {/* C. Discount */}
      <Section letter="C" title={p.secC} desc={p.secCDesc} done={profile.discount !== undefined}>
        <div className="flex flex-wrap gap-2">
          {DISCOUNT_OPTIONS.map((d) => {
            const on = profile.discount === d;
            return (
              <button
                key={d}
                onClick={() => update({ discount: on ? undefined : d })}
                aria-pressed={on}
                className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                  on ? 'bg-amber-500 border-amber-400 text-stone-950' : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-600'
                }`}
              >
                {d === 0 ? p.noDiscount : `${d}%`}
              </button>
            );
          })}
        </div>
      </Section>

      {/* D. AI support */}
      <Section letter="D" title={p.secD} desc={p.secDDesc} done={profile.aiSupport.length > 0}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {AI_SUPPORT_OPTIONS.map((id) => {
            const on = profile.aiSupport.includes(id);
            return (
              <button
                key={id}
                onClick={() => update({ aiSupport: on ? profile.aiSupport.filter((x) => x !== id) : [...profile.aiSupport, id] })}
                aria-pressed={on}
                className={`px-3 py-2.5 rounded-xl border text-sm text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  on ? 'bg-emerald-950/70 border-emerald-500 text-emerald-100' : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-600'
                }`}
              >
                <span
                  className={`w-5 h-5 shrink-0 rounded-md border flex items-center justify-center ${on ? 'bg-emerald-500 border-emerald-400' : 'border-stone-600'}`}
                >
                  {on && <Check className="w-3.5 h-3.5 text-white" />}
                </span>
                {p.aiSupport[id]}
              </button>
            );
          })}
        </div>
      </Section>

      {/* E. Digital status grid (Partners Assessment sheet) */}
      <Section letter="E" title={p.secE} desc={p.secEDesc} done={Object.keys(profile.digital).length > 0}>
        <div className="hidden sm:grid grid-cols-[1fr_repeat(3,8.5rem)] gap-2 text-[11px] uppercase tracking-wider text-stone-500 font-bold px-1">
          <span />
          <span className="text-center">{p.colManaged}</span>
          <span className="text-center">{p.colOnOff}</span>
          <span className="text-center">{p.colHelp}</span>
        </div>
        <div className="space-y-2">
          {DIGITAL_CHANNELS.map(({ id, letter }) => {
            const status = profile.digital[id];
            const set = (s: DigitalStatus) => {
              const digital = { ...profile.digital };
              if (digital[id] === s) delete digital[id];
              else digital[id] = s;
              update({ digital });
            };
            return (
              <div
                key={id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_repeat(3,8.5rem)] gap-2 items-center bg-stone-950 border border-stone-800 rounded-xl p-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 shrink-0 rounded-md bg-stone-800 text-stone-300 text-xs font-bold flex items-center justify-center">
                    {letter}
                  </span>
                  <span className="text-sm text-stone-200 font-medium">{p.channels[id]}</span>
                  {id === 'other' && status && (
                    <input
                      value={profile.otherPlatform ?? ''}
                      onChange={(e) => update({ otherPlatform: e.target.value.slice(0, 60) })}
                      placeholder={p.otherPlaceholder}
                      className="flex-1 min-w-0 bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-emerald-500"
                    />
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 sm:contents">
                  {DIGITAL_STATUSES.map((s) => {
                    const on = status === s;
                    const label = s === 'managed' ? p.colManaged : s === 'onoff' ? p.colOnOff : p.colHelp;
                    const shortLabel = s === 'managed' ? p.colManagedShort : s === 'onoff' ? p.colOnOffShort : p.colHelpShort;
                    return (
                      <button
                        key={s}
                        onClick={() => set(s)}
                        aria-pressed={on}
                        aria-label={`${p.channels[id]}: ${label}`}
                        className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          on ? STATUS_STYLE[s] : 'bg-stone-900 border-stone-800 text-stone-500 hover:border-stone-600 hover:text-stone-300'
                        }`}
                      >
                        {on ? <Check className="w-3.5 h-3.5" /> : <span className="w-3 h-3 rounded-full border border-current opacity-60" />}
                        <span className="sm:hidden">{shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <SupportPlanPanel profile={profile} />
    </div>
  );
}

function Section({
  letter,
  title,
  desc,
  done,
  children
}: {
  letter: string;
  title: string;
  desc: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <span
          className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm font-extrabold transition-colors ${
            done ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400'
          }`}
        >
          {done ? <Check className="w-4 h-4" /> : letter}
        </span>
        <div>
          <h3 className="font-bold text-white">{title}</h3>
          <p className="text-xs text-stone-400 mt-0.5">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Chips({ items, selected, onToggle }: { items: string[]; selected: string[]; onToggle: (item: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const on = selected.includes(item);
        return (
          <button
            key={item}
            onClick={() => onToggle(item)}
            aria-pressed={on}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              on ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-stone-500'
            }`}
          >
            {on ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {item}
          </button>
        );
      })}
    </div>
  );
}
