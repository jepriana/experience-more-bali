'use client';

import React, { Fragment, useEffect, useMemo, useRef } from 'react';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import { AlertTriangle, Car, Lightbulb, MapPinned, Sailboat, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { BALI_REGIONS, getBaliRegion } from '@/data/regions';
import { useAccounts, travelerRegionLabel } from '@/lib/accounts';
import { useAiStream } from '@/lib/useAiStream';
import {
  formatDuration,
  inferTravelerType,
  summarizeDay,
  travelMinutes,
  type ArrangedTrip,
  type DayWarning
} from '@/lib/tripPlanning';
import { AiSourceBadge, StreamErrorBanner, StreamText, ThinkingPanel } from '@/components/ai/StreamingUi';
import { BaliMap } from '@/components/trip/BaliMap';
import { StepHeader, StepNav } from '@/components/trip/TripSteps';
import { DAY_COLORS, MAX_DAYS, type TripState } from '@/components/trip/useTrip';

/** Step 4: the day grid (lead's sketch), AI "Arrange my days", per-day travel times and the map. */
export function DayPlanner({ trip }: { trip: TripState }) {
  const { t, language } = useLanguage();
  const { traveler, saveTraveler } = useAccounts();
  const stream = useAiStream<ArrangedTrip>('trip');
  const arranging = stream.isStreaming;

  const stopIds = useMemo(() => new Set(trip.stops.map((s) => s.id)), [trip.stops]);

  // While the AI is writing, show its arrangement as it arrives (circles fill in live)
  const liveAssignment = useMemo(() => {
    if (!arranging) return trip.assignment;
    const a: Record<string, number> = {};
    stream.partial?.days?.forEach((d, i) =>
      d?.stopIds?.forEach((id) => {
        if (id && stopIds.has(id) && a[id] === undefined) a[id] = i;
      })
    );
    return a;
  }, [arranging, trip.assignment, stream.partial, stopIds]);

  const summaries = useMemo(
    () => Array.from({ length: trip.days }, (_, d) => summarizeDay(trip.stops.filter((s) => liveAssignment[s.id] === d))),
    [trip.days, trip.stops, liveAssignment]
  );

  const dayText = (d: number) => (arranging ? stream.partial?.days?.[d] : trip.plan?.days[d]);

  const arrange = () => {
    if (arranging || trip.stops.length === 0) return;
    void stream.start(
      '/api/trip-plan',
      {
        days: trip.days,
        stops: trip.stops,
        travelerName: traveler?.name,
        homeRegion: traveler ? travelerRegionLabel(traveler) : undefined,
        categories: trip.categories,
        language
      },
      (final) => {
        const assignment: Record<string, number> = {};
        final.data.days.forEach((d, i) => d.stopIds.forEach((id) => (assignment[id] = i)));
        trip.setAssignment(assignment);
        trip.setPlan({
          isAiGenerated: final.isAiGenerated,
          model: final.model,
          fallbackReason: final.fallbackReason,
          tripTitle: final.data.tripTitle,
          days: final.data.days.map(({ title, why }) => ({ title, why })),
          tips: final.data.tips,
          thoughts: final.thoughts
        });
        // "Backyard" insight: what kind of traveler this is — inferred, never asked
        if (traveler) {
          saveTraveler({
            ...traveler,
            insights: {
              travelerType: final.data.travelerType || inferTravelerType(trip.categories, trip.stops),
              regions: trip.regions,
              categories: trip.categories,
              updatedAt: new Date().toISOString()
            }
          });
        }
      }
    );
  };

  // Least thinking: the first time a plan is needed, let the AI arrange it automatically
  const autoStarted = useRef(false);
  useEffect(() => {
    if (!autoStarted.current && !trip.plan && trip.stops.length > 0 && stream.state.phase === 'idle') {
      autoStarted.current = true;
      arrange();
    }
    // arrange() reads the latest state; we only want this once per visit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liveStatus = (() => {
    const path = stream.activePath;
    if (!path) return null;
    const [section, index] = path.split('.');
    return section === 'days' ? t.trip.statusDay.replace('{n}', String(Number(index ?? 0) + 1)) : null;
  })();

  const stopRegions = BALI_REGIONS.filter((r) => trip.stops.some((s) => s.regionId === r.id));
  const unplanned = trip.stops.filter((s) => liveAssignment[s.id] === undefined || liveAssignment[s.id] >= trip.days);

  const warningText = (w: DayWarning, regionsCount: number) =>
    w === 'long' ? t.trip.warnLong : w === 'regions' ? t.trip.warnRegions.replace('{n}', String(regionsCount)) : t.trip.warnBoat;

  return (
    <div className="space-y-5 stream-in">
      <StepHeader title={t.trip.planTitle} desc={t.trip.planDesc} />

      {/* Controls: days + AI */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-stone-300 mr-1">{t.trip.howManyDays}</span>
          {Array.from({ length: MAX_DAYS }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => trip.setDays(n)}
              disabled={arranging}
              aria-pressed={trip.days === n}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:cursor-wait ${
                trip.days === n ? 'bg-emerald-600 text-white shadow-md' : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <button
          onClick={arrange}
          disabled={arranging}
          className="md:ml-auto px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-(--action-hover) text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-wait"
        >
          {arranging ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {arranging ? t.trip.arranging : trip.plan ? t.trip.arrangeAgain : t.trip.arrangeAi}
        </button>
      </div>

      {stream.state.phase === 'error' && stream.state.error && (
        <StreamErrorBanner
          title={t.stream.errorTitle}
          message={stream.state.error}
          retryLabel={t.stream.retry}
          dismissLabel={t.stream.dismiss}
          onRetry={arrange}
          onDismiss={stream.dismissError}
        />
      )}

      <ThinkingPanel
        live={arranging}
        thoughts={arranging ? stream.state.thoughts : trip.plan?.thoughts ?? ''}
        status={liveStatus}
        idleStatuses={[t.trip.statusGrouping, t.trip.statusDriving, t.trip.statusBalancing]}
        title={t.stream.thinkingTitle}
        doneTitle={t.stream.reasoningTitle}
      />

      {/* Trip title */}
      {(trip.plan || stream.partial?.tripTitle) && (
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl sm:text-2xl font-extrabold text-stone-50">
            <StreamText
              text={arranging ? stream.partial?.tripTitle : trip.plan?.tripTitle}
              active={stream.activePath === 'tripTitle'}
            />
          </h3>
          {!arranging && <AiSourceBadge meta={trip.plan} liveLabel={t.stream.liveAi} offlineLabel={t.stream.offlineDemo} />}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* The day grid */}
        <div className="xl:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-stone-900 text-left px-4 py-3 text-xs font-bold text-stone-400 border-b border-stone-800 min-w-[200px]">
                    {t.trip.gridActivity}
                  </th>
                  {Array.from({ length: trip.days }, (_, d) => (
                    <th key={d} className="px-2 py-3 border-b border-stone-800 text-center min-w-[58px]">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-50 whitespace-nowrap">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: DAY_COLORS[d % DAY_COLORS.length] }} />
                        {t.trip.dayN.replace('{n}', String(d + 1))}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stopRegions.map((region) => (
                  <Fragment key={region.id}>
                    <tr>
                      <td colSpan={trip.days + 1} className="sticky left-0 px-4 pt-3 pb-1 bg-stone-900">
                        <span className="flex items-center gap-2 text-xs font-bold text-stone-300">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: region.color }} aria-hidden="true" />
                          {region.name}
                        </span>
                      </td>
                    </tr>
                    {trip.stops
                      .filter((s) => s.regionId === region.id)
                      .map((s) => (
                        <tr key={s.id} className="hover:bg-stone-800/40 transition-colors">
                          <td className="sticky left-0 z-10 bg-stone-900 px-4 py-2 border-b border-stone-800/60">
                            <div className="text-[13px] font-semibold text-stone-100 leading-tight flex items-center gap-1">
                              {s.name}
                              <VerificationBadge partnerId={s.id} compact />
                            </div>
                            <div className="text-xs text-stone-500 flex items-center gap-1">
                              {s.area}
                              {s.requiresBoat && <Sailboat className="w-3 h-3 text-sky-400" />}
                            </div>
                          </td>
                          {Array.from({ length: trip.days }, (_, d) => {
                            const on = liveAssignment[s.id] === d;
                            const color = DAY_COLORS[d % DAY_COLORS.length];
                            return (
                              <td key={d} className="text-center border-b border-stone-800/60 px-1">
                                <button
                                  onClick={() => trip.setStopDay(s.id, d)}
                                  disabled={arranging}
                                  aria-pressed={on}
                                  aria-label={`${s.name} — ${t.trip.dayN.replace('{n}', String(d + 1))}`}
                                  className="w-7 h-7 rounded-full border-2 transition-all cursor-pointer disabled:cursor-wait"
                                  style={{
                                    borderColor: on ? color : '#78716c',
                                    background: on ? color : 'transparent',
                                    boxShadow: on ? `0 0 12px ${color}88` : 'none'
                                  }}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {unplanned.length > 0 && !arranging && (
            <p className="px-4 py-2.5 text-xs text-amber-300 bg-amber-950/30 border-t border-amber-900/50">
              {t.trip.unplanned}: {unplanned.map((s) => s.name).join(', ')}
            </p>
          )}
        </div>

        {/* Map */}
        <div className="xl:col-span-5 xl:sticky xl:top-40 bg-stone-900 border border-stone-800 rounded-2xl p-3 shadow-xl space-y-2">
          <div className="flex items-center gap-2 px-1 text-sm font-bold text-stone-50">
            <MapPinned className="w-4 h-4 text-emerald-400" />
            {t.trip.mapTitle}
          </div>
          <BaliMap
            selectedRegions={[...new Set([...trip.regions, ...trip.stops.map((s) => s.regionId)])]}
            stops={trip.stops}
            assignment={liveAssignment}
            days={trip.days}
          />
          <div className="flex flex-wrap gap-1.5 px-1">
            {Array.from({ length: trip.days }, (_, d) => (
              <span key={d} className="inline-flex items-center gap-1 text-xs text-stone-300 bg-stone-800 rounded-full px-2 py-0.5">
                <span className="w-2 h-2 rounded-full" style={{ background: DAY_COLORS[d % DAY_COLORS.length] }} />
                {t.trip.dayN.replace('{n}', String(d + 1))}
              </span>
            ))}
          </div>
          <p className="text-xs text-stone-500 px-1">{t.trip.mapAttribution}</p>
        </div>
      </div>

      {/* Day cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summaries.map((sum, d) => {
          const color = DAY_COLORS[d % DAY_COLORS.length];
          const text = dayText(d);
          return (
            <div
              key={d}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3 shadow-lg stream-in"
              style={{ borderTopColor: color, borderTopWidth: 3 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} aria-hidden="true" />
                    {t.trip.dayN.replace('{n}', String(d + 1))}
                  </div>
                  <div className="text-base font-bold text-stone-50">
                    {text?.title ? (
                      <StreamText text={text.title} active={stream.activePath === `days.${d}.title`} />
                    ) : sum.route.length ? (
                      sum.regions.map((r) => getBaliRegion(r)?.name).join(' & ')
                    ) : (
                      t.trip.freeDay
                    )}
                  </div>
                </div>
                {sum.route.length > 0 && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-stone-300 bg-stone-800 border border-stone-700 rounded-full px-2.5 py-1">
                    <Car className="w-3.5 h-3.5" />
                    {sum.travelMinutes > 0 ? t.trip.onTheRoad.replace('{time}', formatDuration(sum.travelMinutes)) : t.trip.oneArea}
                  </span>
                )}
              </div>

              {/* Route in visiting order with travel time between stops */}
              {sum.route.length > 0 && (
                <ol className="space-y-1">
                  {sum.route.map((s, i) => (
                    <li key={s.id} className="stream-in">
                      {i > 0 && (
                        <div className="pl-3 py-0.5 text-xs text-stone-500 flex items-center gap-1">
                          <span className="w-px h-3 bg-stone-700 mr-1.5" />
                          {formatDuration(travelMinutes(sum.route[i - 1], s))}
                          {sum.route[i - 1].requiresBoat !== s.requiresBoat && <Sailboat className="w-3 h-3 text-sky-400" />}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[13px] text-stone-200">
                        <span
                          className="w-5 h-5 rounded-full text-xs font-bold text-stone-50 flex items-center justify-center shrink-0"
                          style={{ background: color }}
                        >
                          {i + 1}
                        </span>
                        <span className="truncate">{s.name}</span>
                        <span className="text-xs text-stone-500 shrink-0">{s.area}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              {sum.warnings.length > 0 && (
                <ul className="space-y-1">
                  {sum.warnings.map((w) => (
                    <li key={w} className="flex items-start gap-1.5 text-xs text-amber-200 bg-amber-950/40 border border-amber-900/50 rounded-lg px-2.5 py-1.5">
                      {w === 'boat' ? <Sailboat className="w-3.5 h-3.5 shrink-0 mt-px" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />}
                      {warningText(w, sum.regions.length)}
                    </li>
                  ))}
                </ul>
              )}

              {text?.why && (
                <p className="text-xs text-stone-400 leading-relaxed">
                  <StreamText text={text.why} active={stream.activePath === `days.${d}.why`} />
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips */}
      {!arranging && trip.plan?.tips && trip.plan.tips.length > 0 && (
        <div className="bg-emerald-950/30 border border-emerald-900/60 rounded-2xl p-4 space-y-2 stream-in">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
            <Lightbulb className="w-4 h-4" />
            {t.trip.tipsTitle}
          </div>
          <ul className="list-disc pl-5 space-y-1 text-xs text-stone-300">
            {trip.plan.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      <StepNav onBack={() => trip.setStep(2)} onNext={() => trip.setStep(4)} nextLabel={t.merch.stepGear} sticky={false} />
    </div>
  );
}
