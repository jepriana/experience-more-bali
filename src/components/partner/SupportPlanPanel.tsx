'use client';

import React, { useRef } from 'react';
import { CalendarCheck, Handshake, RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAccounts } from '@/lib/accounts';
import { useSessionState } from '@/context/SessionStateContext';
import { useAiStream } from '@/lib/useAiStream';
import type { SupportPlan } from '@/lib/schemas';
import type { StreamResultMeta } from '@/lib/streamProtocol';
import type { PartnerBusinessProfile } from '@/data/partnerProfile';
import { AiSourceBadge, Skeleton, StreamErrorBanner, StreamText, ThinkingPanel, revealOutput } from '@/components/ai/StreamingUi';

type SavedPlan = StreamResultMeta & { data: SupportPlan; thoughts?: string };

const EFFORT_STYLE = {
  quick: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  medium: 'bg-amber-950 text-amber-300 border-amber-800',
  project: 'bg-sky-950 text-sky-300 border-sky-800'
} as const;

/** "Build my support plan" — streams the plan from the partner's tapped answers. */
export function SupportPlanPanel({ profile }: { profile: PartnerBusinessProfile }) {
  const { t, language } = useLanguage();
  const p = t.profile;
  const { partner } = useAccounts();
  const stream = useAiStream<SupportPlan>('partner.support');
  const [saved, setSaved] = useSessionState<SavedPlan | null>('partner.supportPlan', null);
  const outputRef = useRef<HTMLDivElement>(null);

  if (!partner) return null;
  const hasInput = Object.values(profile.digital).includes('help') || profile.aiSupport.length > 0;
  const streaming = stream.isStreaming;
  const plan = streaming ? stream.partial : saved?.data;

  const build = () => {
    requestAnimationFrame(() => revealOutput(outputRef.current));
    void stream.start(
      '/api/partner-support',
      { businessName: partner.businessName, regionId: partner.regionId, area: partner.area, profile, language },
      (final) => setSaved({ data: final.data, isAiGenerated: final.isAiGenerated, model: final.model, fallbackReason: final.fallbackReason, thoughts: final.thoughts })
    );
  };

  const active = stream.activePath ?? '';
  const status = streaming && stream.partial ? (stream.partial.actions?.length ? p.statusSteps : p.statusPrioritising) : null;

  return (
    <section className=" bg-stone-900 border border-emerald-900/60 rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="w-8 h-8 shrink-0 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-white" />
          </span>
          <div>
            <h3 className="font-bold text-stone-50 flex items-center gap-2 flex-wrap">
              {p.planTitle}
              {!streaming && <AiSourceBadge meta={saved} liveLabel={t.stream.liveAi} offlineLabel={t.stream.offlineDemo} />}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">{hasInput ? p.planDesc : p.planEmpty}</p>
          </div>
        </div>
        <button
          onClick={build}
          disabled={streaming}
          className="shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-(--action-hover) text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait"
        >
          {saved && !streaming ? <RotateCcw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {streaming ? p.planWriting : saved ? p.btnPlanAgain : p.btnPlan}
        </button>
      </div>

      {stream.state.phase === 'error' && stream.state.error && (
        <StreamErrorBanner
          title={t.stream.errorTitle}
          message={stream.state.error}
          retryLabel={t.stream.retry}
          dismissLabel={t.stream.dismiss}
          onRetry={build}
          onDismiss={stream.dismissError}
        />
      )}

      {streaming && (
        <ThinkingPanel
          live
          thoughts={stream.state.thoughts}
          status={status}
          idleStatuses={[p.statusReading, p.statusPrioritising, p.statusSteps]}
          title={t.stream.thinkingTitle}
          doneTitle={t.stream.reasoningTitle}
        />
      )}

      <div ref={outputRef} className="space-y-4">
        {plan?.headline && (
          <p className="text-base sm:text-lg font-semibold text-emerald-100 stream-in">
            <StreamText text={plan.headline} active={active === 'headline'} />
          </p>
        )}

        {streaming && !plan?.actions?.length && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton lines={3} />
              </div>
            ))}
          </div>
        )}

        {!!plan?.actions?.length && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plan.actions.map((a, i) => {
              if (!a) return null;
              const at = (field: string) => active.startsWith(`actions.${i}.${field}`);
              const channelLabel = a.channel === 'ai' ? p.aiChannel : a.channel ? p.channels[a.channel] : '';
              return (
                <article key={i} className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 space-y-3 stream-in">
                  <div className="flex flex-wrap items-center gap-2">
                    {channelLabel && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700 font-semibold">
                        {channelLabel}
                      </span>
                    )}
                    {a.effort && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${EFFORT_STYLE[a.effort]}`}>
                        {p.effort[a.effort]}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-stone-50">
                    <StreamText text={a.title} active={at('title')} />
                  </h4>
                  {a.why && (
                    <p className="text-xs text-stone-400">
                      <StreamText text={a.why} active={at('why')} />
                    </p>
                  )}
                  {!!a.steps?.length && (
                    <ol className="space-y-1.5">
                      {a.steps.map((step, j) => (
                        <li key={j} className="flex gap-2 text-sm text-stone-200">
                          <span className="w-5 h-5 shrink-0 rounded-full bg-emerald-900 text-emerald-300 text-xs font-bold flex items-center justify-center">
                            {j + 1}
                          </span>
                          <span>
                            <StreamText text={step} active={active === `actions.${i}.steps.${j}`} />
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {a.kossiHelp && (
                    <p className="text-xs text-teal-200/90 bg-teal-950/40 border border-teal-900/60 rounded-lg px-3 py-2 flex gap-2">
                      <Handshake className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        <span className="font-semibold">{p.kossiHelp}: </span>
                        <StreamText text={a.kossiHelp} active={at('kossiHelp')} />
                      </span>
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {!!plan?.firstWeek?.length && (
          <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 stream-in">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-2 mb-2">
              <CalendarCheck className="w-4 h-4" />
              {p.firstWeek}
            </div>
            <ul className="space-y-1">
              {plan.firstWeek.map((task, i) => (
                <li key={i} className="text-sm text-amber-50 flex gap-2">
                  <span className="text-amber-400">□</span>
                  <StreamText text={task} active={active === `firstWeek.${i}`} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {!streaming && saved?.fallbackReason && <p className="text-xs text-stone-500">{saved.fallbackReason}</p>}
      </div>
    </section>
  );
}
