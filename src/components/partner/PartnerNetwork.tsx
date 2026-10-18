'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Crown, Handshake, Loader2, Mail, MessageCircle, Plus, Search, Users } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { apiFetch } from '@/lib/identity';
import { fmt } from '@/i18n/ecosystem';
import { BALI_REGIONS, getBaliRegion } from '@/data/regions';
import { PARTNER_GROUPS, getPartnerType, partnerTypeLabel } from '@/data/partnerGroups';
import { REQUEST_TARGETS, type Cluster, type CollabRequest, type DirectoryEntry, type RequestKind } from '@/lib/ecosystemTypes';
import { Field, inputClass } from '@/components/onboarding/SignupFields';
import { formatVerifiedDate } from '@/components/verification/VerificationBadge';

type NetRequest = CollabRequest & { responseCount: number; respondedByMe: boolean; mine: boolean };
interface NetworkData {
  me: { id: string; partnerType?: string; regionId?: string; listingId?: string } | null;
  clusters: Cluster[];
  requests: NetRequest[];
  directory: DirectoryEntry[];
}

const KINDS: RequestKind[] = ['guide', 'creator', 'digital', 'transport', 'printing', 'bundle', 'other'];

/** WhatsApp for phone numbers (Indonesian 0… → 62…), mailto for emails. */
export function contactHref(contact: string) {
  const v = contact.trim();
  if (v.includes('@')) return { href: `mailto:${v}`, email: true };
  let digits = v.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '62' + digits.slice(1);
  return { href: `https://wa.me/${digits}`, email: false };
}

function ContactLink({ contact, label }: { contact: string; label: string }) {
  const { href, email } = contactHref(contact);
  const Icon = email ? Mail : MessageCircle;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-(--action-hover) text-white"
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {email ? contact : label}
    </a>
  );
}

function SampleTag() {
  const { t } = useLanguage();
  return <span className="text-[11px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">{t.eco.network.sample}</span>;
}

/** Partner tab "Network": area clusters, collaboration requests and the partner directory. */
export function PartnerNetwork() {
  const { t } = useLanguage();
  const n = t.eco.network;
  const [data, setData] = useState<NetworkData | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('partner', '/api/network');
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(n.errorGeneric);
    }
  }, [n.errorGeneric]);

  useEffect(() => {
    let alive = true;
    apiFetch('partner', '/api/network')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => alive && setData(d))
      .catch(() => alive && setError(n.errorGeneric));
    return () => {
      alive = false;
    };
  }, [n.errorGeneric]);

  /** POST an action; returns true on success and reloads the network. */
  const act = useCallback(
    async (body: Record<string, unknown>) => {
      setError('');
      try {
        const res = await apiFetch('partner', '/api/network', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error();
        await load();
        return true;
      } catch {
        setError(n.errorGeneric);
        return false;
      }
    },
    [load, n.errorGeneric]
  );

  if (!data) {
    return (
      <p className="text-stone-400 flex items-center gap-2" aria-busy="true">
        {error || (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            {t.eco.memories.loading}
          </>
        )}
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-extrabold text-stone-50">{n.title}</h2>
        <p className="text-stone-400 mt-1">{n.subtitle}</p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400 font-semibold">
          {error}
        </p>
      )}
      <ClusterSection data={data} act={act} />
      <RequestsSection data={data} act={act} />
      <DirectorySection data={data} />
    </div>
  );
}

type Act = (body: Record<string, unknown>) => Promise<boolean>;

// ───────── clusters ─────────

function ClusterSection({ data, act }: { data: NetworkData; act: Act }) {
  const { t, language } = useLanguage();
  const n = t.eco.network;
  const me = data.me;
  const regionId = me?.regionId;
  const regionName = getBaliRegion(regionId)?.name ?? 'Bali';
  const isMine = (c: Cluster) => !!me && c.members.some((m) => m.memberId === me.id || (!!me.listingId && m.listingId === me.listingId));
  const local = data.clusters.filter((c) => c.regionId === regionId || isMine(c));
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <section aria-labelledby="cluster-title" className="space-y-4">
      <div>
        <h3 id="cluster-title" className="text-xl font-bold text-stone-50 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          {n.clusterTitle}
        </h3>
        <p className="text-sm text-stone-400 mt-1">{n.clusterDesc}</p>
        {me && !me.listingId && <p className="text-sm text-amber-300 mt-2">{n.clusterNoListing}</p>}
      </div>

      {local.length === 0 && <p className="text-stone-400">{fmt(n.clusterNone, { region: regionName })}</p>}

      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {local.map((c) => (
          <ClusterCard key={c.id} cluster={c} mine={isMine(c)} coordinator={!!me && c.coordinatorId === me.id} act={act} lang={language} />
        ))}
      </ul>

      <form
        className="flex flex-col sm:flex-row gap-2 sm:items-end max-w-xl"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setBusy(true);
          if (await act({ action: 'createCluster', name: name.trim() })) setName('');
          setBusy(false);
        }}
      >
        <div className="flex-1">
          <Field label={n.clusterName} htmlFor="cluster-name">
            <input id="cluster-name" className={inputClass} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder={`${regionName} cluster`} />
          </Field>
        </div>
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="px-4 py-3 rounded-lg text-sm font-bold border border-emerald-600 text-emerald-300 hover:bg-emerald-950 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {n.clusterCreate}
        </button>
      </form>
    </section>
  );
}

function ClusterCard({ cluster: c, mine, coordinator, act, lang }: { cluster: Cluster; mine: boolean; coordinator: boolean; act: Act; lang: 'en' | 'id' }) {
  const { t } = useLanguage();
  const n = t.eco.network;
  const [title, setTitle] = useState(c.package?.title ?? '');
  const [details, setDetails] = useState(c.package?.details ?? '');
  const [discount, setDiscount] = useState(c.package?.discount ?? 10);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const run = async (body: Record<string, unknown>) => {
    setBusy(true);
    const ok = await act(body);
    setBusy(false);
    return ok;
  };

  return (
    <li className={`rounded-2xl border p-5 space-y-4 ${mine ? 'bg-emerald-950/30 border-emerald-800' : 'bg-stone-900 border-stone-800'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-bold text-stone-50 flex items-center gap-2 flex-wrap">
            {c.name} {c.sample && <SampleTag />}
          </h4>
          <p className="text-sm text-stone-400">
            {[getBaliRegion(c.regionId)?.name, c.area].filter(Boolean).join(' · ')} · {n.clusterCoordinator}: {c.coordinatorName}
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => run({ action: mine ? 'leaveCluster' : 'joinCluster', clusterId: c.id })}
          className={`shrink-0 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer disabled:opacity-50 ${
            mine ? 'border border-stone-600 text-stone-300 hover:border-stone-400' : 'bg-emerald-600 hover:bg-(--action-hover) text-white'
          }`}
        >
          {mine ? n.clusterLeave : n.clusterJoin}
          <span className="sr-only"> {c.name}</span>
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
          {n.clusterMembers} ({c.members.length})
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {c.members.map((m, i) => (
            <li key={m.memberId ?? m.listingId ?? i} className="text-xs px-2 py-1 rounded-md bg-stone-800 text-stone-200 flex items-center gap-1">
              {m.memberId && m.memberId === c.coordinatorId && <Crown className="w-3 h-3 text-amber-400" aria-label={n.clusterCoordinator} />}
              {m.name}
              {m.partnerType && <span className="text-stone-500">· {partnerTypeLabel(m.partnerType, lang)}</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-stone-800 pt-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{n.packageTitle}</p>
        {coordinator ? (
          <form
            className="space-y-2"
            onSubmit={async (e) => {
              e.preventDefault();
              setSaved(false);
              if (await run({ action: 'savePackage', clusterId: c.id, title: title.trim(), details: details.trim(), discount })) setSaved(true);
            }}
          >
            <Field label={n.packageName} htmlFor={`pk-title-${c.id}`}>
              <input id={`pk-title-${c.id}`} required maxLength={100} className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label={n.packageDetails} htmlFor={`pk-details-${c.id}`}>
              <textarea id={`pk-details-${c.id}`} required maxLength={500} rows={2} className={inputClass} value={details} onChange={(e) => setDetails(e.target.value)} />
            </Field>
            <Field label={`${n.packageDiscount}: ${discount}%`} htmlFor={`pk-disc-${c.id}`}>
              <input id={`pk-disc-${c.id}`} type="range" min={0} max={30} step={1} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full accent-emerald-500" />
            </Field>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-(--action-hover) text-white disabled:opacity-50 cursor-pointer">
                {n.packageSave}
              </button>
              {saved && (
                <span role="status" className="text-sm text-emerald-300 flex items-center gap-1">
                  <Check className="w-4 h-4" aria-hidden="true" />
                  {n.packageSaved}
                </span>
              )}
            </div>
          </form>
        ) : c.package ? (
          <div className="text-sm">
            <p className="font-bold text-stone-100">
              {c.package.title} <span className="text-amber-400">−{c.package.discount}%</span>
            </p>
            <p className="text-stone-400">{c.package.details}</p>
            {mine && <p className="text-xs text-stone-500 mt-1">{n.packageOnlyCoordinator}</p>}
          </div>
        ) : (
          <p className="text-sm text-stone-500">{n.packageOnlyCoordinator}</p>
        )}
      </div>
    </li>
  );
}

// ───────── requests ─────────

function RequestsSection({ data, act }: { data: NetworkData; act: Act }) {
  const { t, language } = useLanguage();
  const n = t.eco.network;
  const myType = data.me?.partnerType;
  const [filter, setFilter] = useState<'forMe' | 'all' | 'mine'>('all');
  const [showForm, setShowForm] = useState(false);

  const shown = data.requests.filter((r) => {
    if (filter === 'mine') return r.mine;
    if (r.status !== 'open') return false;
    if (filter === 'forMe') return !r.mine && !!myType && REQUEST_TARGETS[r.kind].includes(myType);
    return true;
  });

  return (
    <section aria-labelledby="req-title" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h3 id="req-title" className="text-xl font-bold text-stone-50 flex items-center gap-2">
            <Handshake className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            {n.requestsTitle}
          </h3>
          <p className="text-sm text-stone-400 mt-1">{n.requestsDesc}</p>
        </div>
        <button
          type="button"
          aria-expanded={showForm}
          aria-controls="req-form"
          onClick={() => setShowForm((s) => !s)}
          className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-(--action-hover) text-white flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {n.requestNew}
        </button>
      </div>

      {showForm && <RequestForm act={act} onDone={() => { setShowForm(false); setFilter('mine'); }} />}

      <div role="group" aria-label={n.requestsTitle} className="flex flex-wrap gap-2">
        {(
          [
            ['all', n.filterAll],
            ['forMe', n.filterForMe],
            ['mine', n.filterMine]
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border cursor-pointer ${
              filter === id ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-stone-900 border-stone-700 text-stone-300 hover:border-stone-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-stone-400">{n.requestsEmpty}</p>
      ) : (
        <ul className="space-y-3">
          {shown.map((r) => (
            <RequestCard key={r.id} request={r} act={act} lang={language} />
          ))}
        </ul>
      )}
    </section>
  );
}

function RequestForm({ act, onDone }: { act: Act; onDone: () => void }) {
  const { t } = useLanguage();
  const n = t.eco.network;
  const [kind, setKind] = useState<RequestKind>('guide');
  const [f, setF] = useState({ title: '', details: '', dates: '', language: '', groupSize: '' });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  return (
    <form
      id="req-form"
      className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const ok = await act({ action: 'createRequest', kind, ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim()])) });
        setBusy(false);
        if (ok) onDone();
      }}
    >
      <fieldset>
        <legend className="text-sm font-semibold text-stone-200 mb-1.5">{n.requestKind}</legend>
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <label key={k} className={`px-3 py-1.5 rounded-full text-sm border cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-(--focus) ${kind === k ? 'bg-emerald-600 border-emerald-500 text-white font-semibold' : 'bg-stone-950 border-stone-700 text-stone-300'}`}>
              <input type="radio" name="req-kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
              {n.kinds[k]}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label={n.requestTitle} htmlFor="req-title-in">
        <input id="req-title-in" required maxLength={100} className={inputClass} value={f.title} onChange={set('title')} />
      </Field>
      <Field label={n.requestDetails} htmlFor="req-details">
        <textarea id="req-details" required maxLength={1000} rows={3} className={inputClass} value={f.details} onChange={set('details')} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label={n.requestDates} htmlFor="req-dates">
          <input id="req-dates" maxLength={60} className={inputClass} value={f.dates} onChange={set('dates')} />
        </Field>
        <Field label={n.requestLanguage} htmlFor="req-lang">
          <input id="req-lang" maxLength={60} className={inputClass} value={f.language} onChange={set('language')} />
        </Field>
        <Field label={n.requestGroup} htmlFor="req-group">
          <input id="req-group" maxLength={20} className={inputClass} value={f.groupSize} onChange={set('groupSize')} />
        </Field>
      </div>
      <button type="submit" disabled={busy} className="px-5 py-2.5 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-(--action-hover) text-white disabled:opacity-50 cursor-pointer">
        {n.requestPost}
      </button>
    </form>
  );
}

function RequestCard({ request: r, act, lang }: { request: NetRequest; act: Act; lang: 'en' | 'id' }) {
  const { t } = useLanguage();
  const n = t.eco.network;
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const meta = [r.dates, r.language, r.groupSize && `👥 ${r.groupSize}`, getBaliRegion(r.regionId)?.name].filter(Boolean).join(' · ');

  return (
    <li className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-semibold">{n.kinds[r.kind]}</span>
        {r.sample && <SampleTag />}
        {r.status === 'closed' && <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-400 font-semibold">{n.closed}</span>}
        <span className="text-stone-500">{formatVerifiedDate(r.createdAt, lang)}</span>
      </div>
      <div>
        <h4 className="font-bold text-stone-50">{r.title}</h4>
        <p className="text-sm text-stone-400">
          {r.fromName}
          {r.fromType && ` · ${partnerTypeLabel(r.fromType, lang)}`}
        </p>
      </div>
      <p className="text-sm text-stone-300 whitespace-pre-line">{r.details}</p>
      {meta && <p className="text-xs text-stone-500">{meta}</p>}

      {r.mine ? (
        <div className="space-y-2 border-t border-stone-800 pt-3">
          <p className="text-sm font-semibold text-stone-200">{fmt(n.responses, { n: r.responseCount })}</p>
          <ul className="space-y-2">
            {r.responses.map((x) => (
              <li key={x.memberId} className="bg-stone-950 border border-stone-800 rounded-xl p-3 space-y-1.5">
                <p className="text-sm font-bold text-stone-100">
                  {x.name} {x.partnerType && <span className="font-normal text-stone-500">· {partnerTypeLabel(x.partnerType, lang)}</span>}
                </p>
                <p className="text-sm text-stone-300">{x.message}</p>
                {x.contact && <ContactLink contact={x.contact} label={n.contact} />}
              </li>
            ))}
          </ul>
          {r.status === 'open' && (
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await act({ action: 'closeRequest', requestId: r.id });
                setBusy(false);
              }}
              className="px-4 py-2 rounded-lg text-sm font-bold border border-stone-600 text-stone-300 hover:border-stone-400 cursor-pointer disabled:opacity-50"
            >
              {n.close}
            </button>
          )}
        </div>
      ) : r.respondedByMe ? (
        <p role="status" className="text-sm text-emerald-300 flex items-center gap-1.5">
          <Check className="w-4 h-4" aria-hidden="true" />
          {n.responded}
        </p>
      ) : open ? (
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!message.trim()) return;
            setBusy(true);
            await act({ action: 'respond', requestId: r.id, message: message.trim() });
            setBusy(false);
          }}
        >
          <label htmlFor={`resp-${r.id}`} className="sr-only">
            {n.respond}
          </label>
          <textarea
            id={`resp-${r.id}`}
            rows={2}
            maxLength={500}
            required
            className={inputClass}
            placeholder={n.respondPlaceholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-(--action-hover) text-white disabled:opacity-50 cursor-pointer">
            {n.respondSend}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-lg text-sm font-bold border border-emerald-600 text-emerald-300 hover:bg-emerald-950 cursor-pointer"
        >
          {n.respond}
          <span className="sr-only">: {r.title}</span>
        </button>
      )}
    </li>
  );
}

// ───────── directory ─────────

function DirectorySection({ data }: { data: NetworkData }) {
  const { t, language } = useLanguage();
  const n = t.eco.network;
  const [group, setGroup] = useState('');
  const [region, setRegion] = useState('');
  const [q, setQ] = useState('');

  const list = useMemo(
    () =>
      data.directory.filter((d) => {
        if (d.id === data.me?.id) return false;
        if (group && getPartnerType(d.partnerType)?.group !== group) return false;
        if (region && d.regionId !== region) return false;
        if (q && !d.name.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [data, group, region, q]
  );

  return (
    <section aria-labelledby="dir-title" className="space-y-4">
      <div>
        <h3 id="dir-title" className="text-xl font-bold text-stone-50 flex items-center gap-2">
          <Search className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          {n.directoryTitle}
        </h3>
        <p className="text-sm text-stone-400 mt-1">{n.directoryDesc}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label={n.dirGroup} htmlFor="dir-group">
          <select id="dir-group" className={inputClass} value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">{n.allGroups}</option>
            {PARTNER_GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name[language]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={n.dirRegion} htmlFor="dir-region">
          <select id="dir-region" className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">{n.allRegions}</option>
            {BALI_REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={n.dirSearch} htmlFor="dir-q">
          <input id="dir-q" type="search" className={inputClass} value={q} onChange={(e) => setQ(e.target.value)} />
        </Field>
      </div>
      {list.length === 0 ? (
        <p className="text-stone-400">{n.directoryEmpty}</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((d) => (
            <li key={d.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-1.5">
              <p className="font-bold text-stone-50 flex items-center gap-2 flex-wrap">
                {d.name} {d.sample && <SampleTag />}
              </p>
              <p className="text-sm text-stone-400">
                {partnerTypeLabel(d.partnerType, language)}
                {d.regionId && ` · ${[getBaliRegion(d.regionId)?.name, d.area].filter(Boolean).join(', ')}`}
              </p>
              {d.contact && !d.sample && <ContactLink contact={d.contact} label={n.contact} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
