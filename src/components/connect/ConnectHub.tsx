'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Flag, MapPin, MessagesSquare, Send, Trash2, Users } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAccounts, useHydrated } from '@/lib/accounts';
import { apiFetch } from '@/lib/identity';
import { fmt } from '@/i18n/ecosystem';
import { getBaliRegion } from '@/data/regions';
import { INTEREST_GROUPS, REGION_GROUP_PREFIX } from '@/lib/connectGroups';
import type { ConnectPost, TripRecord } from '@/lib/ecosystemTypes';
import { PageLoading } from '@/components/pages/PageLoading';
import { AccountStrip } from '@/components/onboarding/AccountSticker';
import { inputClass } from '@/components/onboarding/SignupFields';
import { NextSteps } from '@/components/nav/NextSteps';
import { signupHref } from '@/lib/nextPath';
import { formatVerifiedDate } from '@/components/verification/VerificationBadge';
import { useSessionState } from '@/context/SessionStateContext';

interface GroupInfo {
  id: string;
  members: number;
  posts: number;
}

/** /connect — traveler layer 3: interest and Bali-area groups. Privacy-first, no direct messages. */
export function ConnectHub() {
  const { t } = useLanguage();
  const c = t.eco.connect;
  const hydrated = useHydrated();
  const { traveler } = useAccounts();
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [open, setOpen] = useSessionState<string | null>('connect.group', null);
  const [error, setError] = useState('');

  const signedIn = hydrated && !!traveler;
  const load = useCallback(async () => {
    const res = await apiFetch('traveler', '/api/connect');
    if (!res.ok) throw new Error();
    const d = await res.json();
    setGroups(d.groups);
    setJoined(d.joined);
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    let alive = true;
    apiFetch('traveler', '/api/connect')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!alive) return;
        setGroups(d.groups);
        setJoined(d.joined);
      })
      .catch(() => alive && setError(c.groupError));
    return () => {
      alive = false;
    };
  }, [signedIn, c.groupError]);

  const act = useCallback(
    async (body: Record<string, unknown>) => {
      setError('');
      const res = await apiFetch('traveler', '/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).catch(() => null);
      const data = await res?.json().catch(() => null);
      if (!res?.ok) {
        setError(data?.error === 'too-many' ? c.tooMany : c.groupError);
        return null;
      }
      await load().catch(() => undefined);
      return data;
    },
    [load, c.tooMany, c.groupError]
  );

  if (!hydrated) return <PageLoading />;
  if (!traveler) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-4">
        <h1 className="text-3xl font-extrabold text-stone-50">{c.title}</h1>
        <h2 className="text-lg font-bold text-stone-200">{c.signupTitle}</h2>
        <p className="text-stone-400">{c.signupDesc}</p>
        <Link href={signupHref('/traveler', '/connect')} className="inline-flex px-5 py-3 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-(--action-hover) text-white items-center gap-2">
          {t.eco.memories.signupCta}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const name = (id: string) =>
    id.startsWith(REGION_GROUP_PREFIX) ? getBaliRegion(id.slice(REGION_GROUP_PREFIX.length))?.name ?? id : c.groups[id as keyof typeof c.groups] ?? id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <AccountStrip kind="traveler" />
      {open ? (
        <GroupView
          groupId={open}
          title={name(open)}
          joined={joined.includes(open)}
          info={groups.find((g) => g.id === open)}
          act={act}
          error={error}
          onBack={() => setOpen(null)}
        />
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-extrabold text-stone-50 tracking-tight">{c.title}</h1>
            <p className="text-stone-400 mt-1">{c.subtitle}</p>
            <p className="text-sm text-stone-500 mt-2">{c.rules}</p>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-400 font-semibold">
              {error}
            </p>
          )}
          {(
            [
              ['interests', c.interests, groups.filter((g) => (INTEREST_GROUPS as readonly string[]).includes(g.id))],
              ['regions', c.regions, groups.filter((g) => g.id.startsWith(REGION_GROUP_PREFIX))]
            ] as const
          ).map(([key, heading, list]) => (
            <section key={key} aria-labelledby={`cg-${key}`} className="space-y-3">
              <h2 id={`cg-${key}`} className="text-xl font-bold text-stone-50 flex items-center gap-2">
                {key === 'interests' ? <Users className="w-5 h-5 text-emerald-400" aria-hidden="true" /> : <MapPin className="w-5 h-5 text-emerald-400" aria-hidden="true" />}
                {heading}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {list.map((g) => {
                  const isIn = joined.includes(g.id);
                  return (
                    <li key={g.id} className={`rounded-2xl border p-4 flex flex-col gap-3 ${isIn ? 'bg-emerald-950/30 border-emerald-800' : 'bg-stone-900 border-stone-800'}`}>
                      <div className="flex-1">
                        <h3 className="font-bold text-stone-50">{name(g.id)}</h3>
                        <p className="text-xs text-stone-400">
                          {fmt(c.members, { n: g.members })} · {fmt(c.posts, { n: g.posts })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setOpen(g.id)}
                          className="flex-1 px-3 py-2 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-(--action-hover) text-white cursor-pointer"
                        >
                          {c.open}
                          <span className="sr-only">: {name(g.id)}</span>
                        </button>
                        <button
                          type="button"
                          aria-pressed={isIn}
                          onClick={() => act({ action: isIn ? 'leave' : 'join', groupId: g.id })}
                          className={`px-3 py-2 rounded-lg text-sm font-bold border cursor-pointer ${
                            isIn ? 'border-emerald-600 text-emerald-300' : 'border-stone-600 text-stone-300 hover:border-stone-400'
                          }`}
                        >
                          {isIn ? c.joined : c.join}
                          <span className="sr-only">: {name(g.id)}</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          <NextSteps items={['memories', 'plan']} />
        </>
      )}
    </div>
  );
}

type Act = (body: Record<string, unknown>) => Promise<{ post?: ConnectPost } | null>;

function GroupView({
  groupId,
  title,
  joined,
  info,
  act,
  error,
  onBack
}: {
  groupId: string;
  title: string;
  joined: boolean;
  info?: GroupInfo;
  act: Act;
  error: string;
  onBack: () => void;
}) {
  const { t, language } = useLanguage();
  const c = t.eco.connect;
  const [posts, setPosts] = useState<ConnectPost[] | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [text, setText] = useState('');
  const [tripId, setTripId] = useState('');
  const [busy, setBusy] = useState(false);

  const loadPosts = useCallback(async () => {
    const res = await apiFetch('traveler', `/api/connect?group=${encodeURIComponent(groupId)}`);
    if (!res.ok) return;
    const d = await res.json();
    setPosts(d.posts ?? []);
    setMe(d.me?.id ?? null);
  }, [groupId]);

  useEffect(() => {
    let alive = true;
    apiFetch('traveler', `/api/connect?group=${encodeURIComponent(groupId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!alive) return;
        setPosts(d.posts ?? []);
        setMe(d.me?.id ?? null);
      })
      .catch(() => alive && setPosts([]));
    apiFetch('traveler', '/api/trips')
      .then((r) => (r.ok ? r.json() : { trips: [] }))
      .then((d) => alive && setTrips(d.trips ?? []))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [groupId]);

  const run = async (body: Record<string, unknown>) => {
    setBusy(true);
    const r = await act(body);
    await loadPosts();
    setBusy(false);
    return r;
  };

  return (
    <div className="space-y-5">
      <button type="button" onClick={onBack} className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 cursor-pointer underline underline-offset-4">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        {c.back}
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-50 flex items-center gap-2">
            <MessagesSquare className="w-7 h-7 text-emerald-400" aria-hidden="true" />
            {title}
          </h1>
          {info && (
            <p className="text-sm text-stone-400">
              {fmt(c.members, { n: info.members })} · {fmt(c.posts, { n: info.posts })}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-pressed={joined}
          disabled={busy}
          onClick={() => run({ action: joined ? 'leave' : 'join', groupId })}
          className={`px-4 py-2.5 rounded-lg text-sm font-bold cursor-pointer disabled:opacity-50 ${
            joined ? 'border border-emerald-600 text-emerald-300' : 'bg-emerald-600 hover:bg-(--action-hover) text-white'
          }`}
        >
          {joined ? c.joined : c.join}
        </button>
      </div>
      <p className="text-sm text-stone-500">{c.rules}</p>

      {joined ? (
        <form
          className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!text.trim()) return;
            const r = await run({ action: 'post', groupId, text: text.trim(), tripId: tripId || undefined });
            if (r) {
              setText('');
              setTripId('');
            }
          }}
        >
          <label htmlFor="cp-text" className="sr-only">
            {c.postPlaceholder}
          </label>
          <textarea id="cp-text" rows={3} maxLength={1000} required className={inputClass} placeholder={c.postPlaceholder} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {trips.length > 0 && (
              <>
                <label htmlFor="cp-trip" className="text-sm text-stone-300">
                  {c.attachTrip}
                </label>
                <select id="cp-trip" className={`${inputClass} sm:max-w-xs`} value={tripId} onChange={(e) => setTripId(e.target.value)}>
                  <option value="">{c.noTrip}</option>
                  {trips.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.title || tr.name}
                    </option>
                  ))}
                </select>
              </>
            )}
            <button type="submit" disabled={busy} className="sm:ml-auto px-5 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-(--action-hover) text-white disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
              <Send className="w-4 h-4" aria-hidden="true" />
              {c.post}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-stone-400 bg-stone-900 border border-stone-800 rounded-2xl p-4">{c.joinToPost}</p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-400 font-semibold">
          {error}
        </p>
      )}

      {posts === null ? (
        <p className="text-stone-500" aria-busy="true">
          {t.eco.memories.loading}
        </p>
      ) : posts.length === 0 ? (
        <p className="text-stone-400">{c.empty}</p>
      ) : (
        <ul className="space-y-3" aria-label={title}>
          {posts.map((p) => {
            const own = p.authorId === me;
            return (
              <li key={p.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-bold text-stone-50">{own ? `${p.authorName} (${c.you})` : p.authorName}</span>{' '}
                  <span className="text-stone-500">
                    · {p.homeRegion} · {formatVerifiedDate(p.at, language)}
                  </span>
                </p>
                <p className="text-stone-200 whitespace-pre-line break-words">{p.text}</p>
                <div className="flex flex-wrap items-center gap-3">
                  {p.tripId && (
                    <Link href={`/m/${p.tripId}`} className="text-sm font-semibold text-emerald-400 underline underline-offset-4">
                      {c.viewTrip}: {p.tripTitle}
                    </Link>
                  )}
                  <span className="ml-auto" />
                  {own ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run({ action: 'delete', postId: p.id })}
                      className="text-xs text-stone-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {c.deletePost}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy || p.reportedByMe}
                      onClick={() => run({ action: 'report', postId: p.id })}
                      className="text-xs text-stone-400 hover:text-amber-400 disabled:hover:text-stone-400 flex items-center gap-1 cursor-pointer disabled:cursor-default"
                    >
                      <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                      {p.reportedByMe ? c.reported : c.report}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
