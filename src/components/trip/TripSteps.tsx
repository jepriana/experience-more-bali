'use client';

import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Bike,
  Check,
  MapPin,
  Mountain,
  Plus,
  ShoppingBasket,
  UtensilsCrossed
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { BALI_REGIONS, getBaliRegion } from '@/data/regions';
import type { CuratedPartner, TravelCategory } from '@/data/curatedPartners';
import { nearbyAcrossBorder, partnerRegionId, partnerTravelCategories } from '@/lib/tripPlanning';
import { BaliMap } from '@/components/trip/BaliMap';
import type { TripState } from '@/components/trip/useTrip';

// ───────── Stepper ─────────

export function Stepper({ trip }: { trip: TripState }) {
  const { t } = useLanguage();
  const labels = [t.trip.stepRegions, t.trip.stepCategories, t.trip.stepBasket, t.trip.stepPlan, t.merch.stepGear];
  // A step is reachable once everything before it has been chosen
  const reachable = [
    true,
    trip.regions.length > 0,
    trip.categories.length > 0 && trip.regions.length > 0,
    trip.basket.length > 0,
    trip.step >= 3 || Object.keys(trip.assignment).length > 0
  ];
  const go = (i: number) => {
    if (i === 2) trip.goToBasket();
    else if (i === 3) trip.goToPlan();
    else trip.setStep(i);
  };

  return (
    <ol className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar" aria-label="Trip steps">
      {labels.map((label, i) => {
        const done = i < trip.step;
        const current = i === trip.step;
        const canGo = reachable.slice(0, i + 1).every(Boolean);
        return (
          <li key={label} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => canGo && go(i)}
              disabled={!canGo}
              aria-current={current ? 'step' : undefined}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                current
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : done
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/70 cursor-pointer'
                    : canGo
                      ? 'bg-stone-900 text-stone-300 border border-stone-700 hover:border-stone-500 cursor-pointer'
                      : 'bg-stone-900/60 text-stone-600 border border-stone-800 cursor-not-allowed'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  current ? 'bg-white text-emerald-700' : done ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400'
                }`}
              >
                {done ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              {label}
            </button>
            {i < labels.length - 1 && <span className="w-3 sm:w-6 h-px bg-stone-700" />}
          </li>
        );
      })}
    </ol>
  );
}

// ───────── Bottom navigation ─────────

export function StepNav({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  hint,
  sticky = true,
  children
}: {
  /** stick to the bottom of the screen while scrolling (off when there is no Next) */
  sticky?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  hint?: string;
  children?: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div
      className={`${sticky ? 'sticky bottom-3 z-30 shadow-2xl' : ''} bg-stone-900/95 backdrop-blur border border-stone-700 rounded-2xl p-3 flex items-center gap-3`}
    >
      {onBack ? (
        <button
          onClick={onBack}
          className="px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-300 hover:text-white hover:bg-stone-800 flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t.trip.back}</span>
        </button>
      ) : (
        <span />
      )}
      <div className="flex-1 min-w-0 text-xs text-stone-400 truncate">{children ?? (nextDisabled ? hint : null)}</div>
      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {nextLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ───────── Step 1: regions ─────────

export function StepRegions({ trip }: { trip: TripState }) {
  const { t } = useLanguage();
  const countIn = (id: string) => trip.partners.filter((p) => partnerRegionId(p) === id).length;

  return (
    <div className="space-y-5 stream-in">
      <StepHeader title={t.trip.regionsTitle} desc={t.trip.regionsDesc} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-3 sm:p-4 shadow-xl">
          <BaliMap selectedRegions={trip.regions} onToggleRegion={trip.toggleRegion} regionLabel={t.trip.regionWord} />
          <p className="text-[11px] text-stone-500 px-1 pt-1">{t.trip.regionsHint}</p>
        </div>
        <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2" role="group" aria-label={t.trip.regionsTitle}>
          {BALI_REGIONS.map((r) => {
            const selected = trip.regions.includes(r.id);
            const n = countIn(r.id);
            return (
              <button
                key={r.id}
                onClick={() => trip.toggleRegion(r.id)}
                aria-pressed={selected}
                className={`text-left rounded-xl border px-3 py-2.5 transition-all cursor-pointer ${
                  selected
                    ? 'bg-emerald-950/70 border-emerald-500 ring-1 ring-emerald-500/60'
                    : 'bg-stone-900 border-stone-700 hover:border-stone-500'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                  {r.name}
                  {selected ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
                  ) : (
                    <span className="ml-auto text-[10px] font-semibold text-stone-500">{n}</span>
                  )}
                </span>
                <span className="block text-[10px] text-stone-400 truncate mt-0.5">{r.areas.slice(0, 3).join(' · ')}</span>
              </button>
            );
          })}
        </div>
      </div>
      <StepNav
        onNext={() => trip.setStep(1)}
        nextLabel={t.trip.next}
        nextDisabled={trip.regions.length === 0}
        hint={t.trip.chooseOne}
      >
        {trip.regions.length > 0 && (
          <span className="text-emerald-300 font-semibold">
            {t.trip.selectedCount.replace('{n}', String(trip.regions.length))} ·{' '}
            {trip.regions.map((id) => getBaliRegion(id)?.name).join(', ')}
          </span>
        )}
      </StepNav>
    </div>
  );
}

// ───────── Step 2: experience categories ─────────

const CATEGORY_ICONS: Record<TravelCategory, React.ReactNode> = {
  nature: <Mountain className="w-7 h-7" />,
  activities: <Bike className="w-7 h-7" />,
  accommodation: <BedDouble className="w-7 h-7" />,
  culinary: <UtensilsCrossed className="w-7 h-7" />
};

export function StepCategories({ trip }: { trip: TripState }) {
  const { t } = useLanguage();
  const labels: Record<TravelCategory, [string, string]> = {
    nature: [t.trip.catNature, t.trip.catNatureDesc],
    activities: [t.trip.catActivities, t.trip.catActivitiesDesc],
    accommodation: [t.trip.catAccommodation, t.trip.catAccommodationDesc],
    culinary: [t.trip.catCulinary, t.trip.catCulinaryDesc]
  };
  // how many partners in the chosen regions offer each experience
  const inRegions = trip.partners.filter((p) => {
    const r = partnerRegionId(p);
    return !!r && trip.regions.includes(r);
  });
  const countFor = (c: TravelCategory) => inRegions.filter((p) => partnerTravelCategories(p).includes(c)).length;

  return (
    <div className="space-y-5 stream-in">
      <StepHeader title={t.trip.categoriesTitle} desc={t.trip.categoriesDesc} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(Object.keys(labels) as TravelCategory[]).map((c) => {
          const selected = trip.categories.includes(c);
          const n = countFor(c);
          return (
            <button
              key={c}
              onClick={() => trip.toggleCategory(c)}
              aria-pressed={selected}
              className={`group text-left rounded-2xl border p-5 flex items-start gap-4 transition-all cursor-pointer ${
                selected
                  ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500/60 shadow-lg shadow-emerald-950/40'
                  : 'bg-stone-900 border-stone-700 hover:border-stone-500'
              }`}
            >
              <span
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                  selected ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-emerald-400 group-hover:bg-stone-700'
                }`}
              >
                {CATEGORY_ICONS[c]}
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2 text-base font-bold text-white">
                  {labels[c][0]}
                  {selected && <Check className="w-4 h-4 text-emerald-400" />}
                </span>
                <span className="block text-xs text-stone-400 mt-1">{labels[c][1]}</span>
                <span className={`inline-block mt-2 text-[11px] font-semibold ${n ? 'text-emerald-400' : 'text-stone-600'}`}>
                  {n} ✓
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <StepNav
        onBack={() => trip.setStep(0)}
        onNext={trip.goToBasket}
        nextLabel={t.trip.next}
        nextDisabled={trip.categories.length === 0}
        hint={t.trip.chooseOne}
      />
    </div>
  );
}

// ───────── Step 3: basket ─────────

export function StepBasket({ trip }: { trip: TripState }) {
  const { t } = useLanguage();
  const byRegion = BALI_REGIONS.map((r) => ({
    region: r,
    items: trip.matches.filter((p) => partnerRegionId(p) === r.id)
  })).filter((g) => g.items.length > 0);

  const nearby = nearbyAcrossBorder(trip.partners, trip.regions, trip.categories);
  // anything the traveler added that is neither a match nor nearby (e.g. added earlier)
  const extras = trip.basketPartners.filter((p) => !trip.matches.includes(p) && !nearby.some((n) => n.partner.id === p.id));

  return (
    <div className="space-y-5 stream-in">
      <StepHeader title={t.trip.basketTitle} desc={t.trip.basketDesc} />

      {byRegion.length === 0 && (
        <div className="bg-stone-900 border border-dashed border-stone-700 rounded-2xl p-8 text-center text-sm text-stone-400">
          {t.trip.emptyBasket}
        </div>
      )}

      {byRegion.map(({ region, items }) => (
        <section key={region.id} className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <span className="w-3 h-3 rounded-full" style={{ background: region.color }} />
            {region.name}
            <span className="text-[11px] font-normal text-stone-500">{region.areas.slice(0, 3).join(' · ')}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {items.map((p) => (
              <BasketRow key={p.id} partner={p} inBasket={trip.basket.includes(p.id)} onToggle={() => trip.toggleBasket(p.id)} />
            ))}
          </div>
        </section>
      ))}

      {(nearby.length > 0 || extras.length > 0) && (
        <section className="space-y-2 pt-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-amber-300">
            <MapPin className="w-4 h-4" />
            {t.trip.nearbyTitle}
            <span className="text-[11px] font-normal text-stone-500">{t.trip.nearbyDesc}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {nearby.map(({ partner, km }) => (
              <BasketRow
                key={partner.id}
                partner={partner}
                inBasket={trip.basket.includes(partner.id)}
                onToggle={() => trip.toggleBasket(partner.id)}
                note={t.trip.kmAway.replace('{km}', km.toFixed(0))}
              />
            ))}
            {extras.map((p) => (
              <BasketRow key={p.id} partner={p} inBasket onToggle={() => trip.toggleBasket(p.id)} />
            ))}
          </div>
        </section>
      )}

      <StepNav
        onBack={() => trip.setStep(1)}
        onNext={trip.goToPlan}
        nextLabel={t.trip.toPlan}
        nextDisabled={trip.basket.length === 0}
        hint={t.trip.chooseOne}
      >
        <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
          <ShoppingBasket className="w-4 h-4" />
          {t.trip.basketCount.replace('{n}', String(trip.basket.length))}
        </span>
      </StepNav>
    </div>
  );
}

function BasketRow({
  partner,
  inBasket,
  onToggle,
  note
}: {
  partner: CuratedPartner;
  inBasket: boolean;
  onToggle: () => void;
  note?: string;
}) {
  const { t } = useLanguage();
  const region = getBaliRegion(partnerRegionId(partner));
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-2.5 pr-3 transition-all ${
        inBasket ? 'bg-stone-900 border-emerald-800/70' : 'bg-stone-900/50 border-stone-800 opacity-80'
      }`}
    >
      <div
        className="w-14 h-14 rounded-lg shrink-0 bg-stone-800 bg-cover bg-center"
        style={{ backgroundImage: `url(${partner.heroImage})` }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-white truncate">{partner.name}</div>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px]">
          <span className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">{partner.category}</span>
          <span className="text-stone-400 truncate">
            {partner.area ? `${partner.area} · ` : ''}
            {region?.name}
          </span>
          {note && <span className="text-amber-300 font-semibold">{note}</span>}
          {partner.isSample && (
            <span className="px-1.5 py-0.5 rounded bg-stone-800/80 text-stone-400 border border-dashed border-stone-600">
              {t.trip.sampleListing}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onToggle}
        aria-pressed={inBasket}
        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
          inBasket
            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
            : 'bg-stone-800 text-emerald-300 border border-emerald-800 hover:bg-emerald-950'
        }`}
        title={inBasket ? t.trip.added : t.trip.add}
      >
        {inBasket ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        <span>{inBasket ? t.trip.added : t.trip.add}</span>
      </button>
    </div>
  );
}

export function StepHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{title}</h2>
      <p className="text-sm text-stone-400 mt-1">{desc}</p>
    </div>
  );
}
