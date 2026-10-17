'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BadgeCheck, ChevronDown, LogOut, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePartners } from '@/context/PartnersContext';
import { getBaliRegion } from '@/data/regions';
import type { CuratedPartner } from '@/data/curatedPartners';
import { partnerRegionId } from '@/lib/tripPlanning';
import {
  CHECK_IDS,
  VERIFICATION_STATUSES,
  type AdminAction,
  type CheckId,
  type VerificationRecord,
  type VerificationStatus
} from '@/lib/verification';
import { formatVerifiedDate } from '@/components/verification/VerificationBadge';

interface Row {
  partner: CuratedPartner;
  builtIn: boolean;
  record: VerificationRecord;
}

const STATUS_STYLE: Record<VerificationStatus, string> = {
  published: 'bg-stone-800 text-stone-300 border-stone-700',
  in_review: 'bg-sky-950 text-sky-300 border-sky-800',
  verified: 'bg-emerald-950 text-emerald-300 border-emerald-700',
  needs_changes: 'bg-amber-950 text-amber-300 border-amber-800',
  removed: 'bg-red-950 text-red-300 border-red-800'
};

const NAME_KEY = 'kossi_admin_name_v1';
const fill = (s: string, n: number | string) => s.replace('{n}', String(n));

/** /admin — KOSSI team: review published partners and verify them in batches. */
export function AdminPage() {
  const { t, language } = useLanguage();
  const v = t.verify;
  const { refresh: refreshDirectory } = usePartners();

  const [session, setSession] = useState<{ configured: boolean; signedIn: boolean } | null>(null);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState<VerificationStatus | 'all'>('published');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [name, setName] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem(NAME_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmVerify, setConfirmVerify] = useState(false);

  const loadRows = useCallback(async () => {
    const res = await fetch('/api/admin/partners', { cache: 'no-store' });
    if (res.status === 401) return setSession((s) => (s ? { ...s, signedIn: false } : s));
    const data = await res.json();
    setRows(data.partners ?? []);
  }, []);

  const loadSession = useCallback(async () => {
    const res = await fetch('/api/admin/session', { cache: 'no-store' });
    const next = (await res.json()) as { configured: boolean; signedIn: boolean };
    setSession(next);
    if (next.signedIn) await loadRows();
  }, [loadRows]);

  // first load: is the admin set up, and is this browser signed in?
  useEffect(() => {
    let alive = true;
    fetch('/api/admin/session', { cache: 'no-store' })
      .then((res) => res.json())
      .then((next: { configured: boolean; signedIn: boolean }) => {
        if (!alive) return;
        setSession(next);
        if (next.signedIn) void loadRows();
      })
      .catch(() => alive && setSession({ configured: false, signedIn: false }));
    return () => {
      alive = false;
    };
  }, [loadRows]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return setAuthError(data?.error ?? 'Sign-in failed.');
    }
    setPasscode('');
    await loadSession();
  };

  const signOut = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    setRows([]);
    await loadSession();
  };

  const saveName = (n: string) => {
    setName(n);
    try {
      localStorage.setItem(NAME_KEY, n);
    } catch {}
  };

  const act = async (action: AdminAction, ids: string[], extra: { note?: string; checklist?: Partial<Record<CheckId, boolean>> } = {}) => {
    if (!name.trim()) return setMessage(v.adminNameRequired);
    if (action === 'needs_changes' && !note.trim()) return setMessage(v.adminNoteRequired);
    if (action === 'checklist' && extra.checklist) {
      // tick the box straight away; the server confirms
      setRows((rs) =>
        rs.map((r) => (ids.includes(r.partner.id) ? { ...r, record: { ...r.record, checklist: { ...r.record.checklist, ...extra.checklist } } } : r))
      );
    } else {
      setBusy(true);
    }
    setMessage(null);
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action, by: name.trim(), ...extra })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return setMessage(data?.error ?? 'Action failed.');
      setRows(data.partners ?? []);
      if (action !== 'checklist') {
        setMessage(fill(v.adminDone, data.updated?.length ?? 0) + (data.batchId ? ` · ${v.adminBatch} ${data.batchId}` : ''));
        setSelected(new Set());
        setNote('');
        setConfirmVerify(false);
      }
      void refreshDirectory(); // badges elsewhere in this browser update right away
    } finally {
      setBusy(false);
    }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const s of VERIFICATION_STATUSES) c[s] = rows.filter((r) => r.record.status === s).length;
    return c;
  }, [rows]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => tab === 'all' || r.record.status === tab)
      .filter(
        (r) =>
          !q ||
          [r.partner.name, r.partner.location, r.partner.area ?? '', r.partner.whatsappInquiryNumber].some((x) => x.toLowerCase().includes(q))
      )
      .sort((a, b) => (b.record.publishedAt ?? '').localeCompare(a.record.publishedAt ?? ''));
  }, [rows, tab, query]);

  const selectedRows = rows.filter((r) => selected.has(r.partner.id));
  const incomplete = selectedRows.filter((r) => CHECK_IDS.some((c) => !r.record.checklist[c])).length;

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // ── Sign-in states ──
  if (!session) return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-stone-400" aria-busy="true">…</div>;

  if (!session.signedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="space-y-2">
          <ShieldCheck className="w-8 h-8 text-emerald-400" aria-hidden="true" />
          <h1 className="text-2xl font-extrabold text-stone-50">{v.adminTitle}</h1>
          <p className="text-sm text-stone-400">{v.adminSubtitle}</p>
        </div>
        {!session.configured ? (
          <p role="alert" className="text-sm text-amber-300 bg-amber-950/40 border border-amber-800 rounded-xl p-4">
            {v.adminNotConfigured}
          </p>
        ) : (
          <form onSubmit={signIn} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-pass" className="text-sm font-semibold text-stone-200 block">
                {v.adminPasscode}
              </label>
              <input
                id="admin-pass"
                type="password"
                autoComplete="current-password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                aria-invalid={!!authError || undefined}
                aria-describedby={authError ? 'admin-pass-error' : undefined}
                className="w-full border rounded-lg px-3.5 py-3 text-base"
              />
              {authError && (
                <p id="admin-pass-error" role="alert" className="text-sm text-red-400 font-semibold">
                  {authError}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={!passcode}
              className="w-full px-5 py-3 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-(--action-hover) text-white disabled:opacity-40 cursor-pointer"
            >
              {v.adminSignIn}
            </button>
          </form>
        )}
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-40">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-50">{v.adminTitle}</h1>
          <p className="text-sm text-stone-400 mt-1 max-w-[70ch]">{v.adminSubtitle}</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label htmlFor="admin-name" className="text-xs font-semibold text-stone-400 block">
              {v.adminYourName}
            </label>
            <input id="admin-name" value={name} onChange={(e) => saveName(e.target.value.slice(0, 60))} className="border rounded-lg px-3 py-2 text-sm w-56" />
          </div>
          <button
            onClick={() => void loadRows()}
            className="px-3 py-2 rounded-lg border border-stone-700 text-sm text-stone-300 hover:text-stone-50 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            {v.adminRefresh}
          </button>
          <button
            onClick={() => void signOut()}
            className="px-3 py-2 rounded-lg border border-stone-700 text-sm text-stone-300 hover:text-stone-50 flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            {v.adminSignOut}
          </button>
        </div>
      </div>

      {/* Status filter + search */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Status">
          {(['published', 'in_review', 'needs_changes', 'verified', 'removed', 'all'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setTab(s);
                setSelected(new Set());
              }}
              aria-pressed={tab === s}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border cursor-pointer transition-colors ${
                tab === s ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-stone-700 text-stone-400 hover:text-stone-50'
              }`}
            >
              {s === 'all' ? v.adminAll : v.statuses[s]} <span className="font-normal">({counts[s] ?? 0})</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={v.adminSearch}
            aria-label={v.adminSearch}
            className="border rounded-lg pl-9 pr-3 py-2 text-sm w-full lg:w-72"
          />
        </div>
      </div>

      <p role="status" aria-live="polite" className="min-h-5 text-sm text-emerald-300">
        {message}
      </p>

      {/* List */}
      <div className="border border-stone-800 rounded-2xl overflow-hidden divide-y divide-stone-800 bg-stone-900">
        <div className="flex items-center gap-3 px-4 py-2.5 text-xs text-stone-400 bg-stone-950/40">
          <input
            type="checkbox"
            aria-label={v.adminSelectAll}
            checked={shown.length > 0 && shown.every((r) => selected.has(r.partner.id))}
            onChange={(e) => setSelected(e.target.checked ? new Set(shown.map((r) => r.partner.id)) : new Set())}
            className="w-4 h-4 accent-emerald-600"
          />
          <span>{v.adminSelectAll}</span>
        </div>
        {shown.length === 0 && <p className="px-4 py-10 text-center text-sm text-stone-500">{v.adminEmpty}</p>}
        {shown.map(({ partner: p, builtIn, record: r }) => {
          const region = getBaliRegion(partnerRegionId(p));
          const checked = CHECK_IDS.filter((c) => r.checklist[c]).length;
          const isOpen = open === p.id;
          return (
            <div key={p.id}>
              <div className="flex items-start gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  aria-label={p.name}
                  className="w-4 h-4 mt-1 accent-emerald-600"
                />
                <button
                  onClick={() => setOpen(isOpen ? null : p.id)}
                  aria-expanded={isOpen}
                  className="flex-1 min-w-0 text-left grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-1 cursor-pointer rounded-md"
                >
                  <span className="md:col-span-4 min-w-0">
                    <span className="font-bold text-stone-50 flex items-center gap-1.5">
                      <span className="truncate">{p.name}</span>
                      {r.status === 'verified' && <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />}
                    </span>
                    <span className="text-xs text-stone-400">
                      {p.category} · {p.area ? `${p.area}, ` : ''}
                      {region?.name ?? p.location}
                      {builtIn ? ` · ${p.isSample ? v.adminSample : v.adminBuiltIn}` : ` · ${v.adminNew}`}
                    </span>
                  </span>
                  <span className="md:col-span-3 text-xs text-stone-400">
                    {v.adminContact}: <span className="text-stone-200">{p.whatsappInquiryNumber}</span>
                    <br />
                    {v.adminPublished}: {formatVerifiedDate(r.publishedAt, language)}
                  </span>
                  <span className="md:col-span-2 text-xs text-stone-400">
                    {v.adminChecklist}: <span className={checked === CHECK_IDS.length ? 'text-emerald-300' : 'text-stone-200'}>{checked}/{CHECK_IDS.length}</span>
                    {r.batchId && (
                      <>
                        <br />
                        {v.adminBatch} {r.batchId}
                      </>
                    )}
                  </span>
                  <span className="md:col-span-3 flex items-center md:justify-end gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[r.status]}`}>{v.statuses[r.status]}</span>
                    <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </span>
                </button>
              </div>

              {isOpen && (
                <div className="px-4 pb-5 pl-11 grid grid-cols-1 lg:grid-cols-3 gap-5 text-sm">
                  <div className="space-y-2 lg:col-span-1">
                    <p className="text-stone-300 leading-relaxed">{p.description}</p>
                    <div className="text-xs font-semibold text-stone-400">{v.adminFacts}</div>
                    <ul className="list-disc pl-4 text-stone-300 space-y-1">
                      {p.verifiedFacts.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                    {r.note && <p className="text-amber-300">“{r.note}”</p>}
                  </div>
                  <fieldset className="space-y-2">
                    <legend className="text-xs font-semibold text-stone-400 mb-2">{v.adminChecklist}</legend>
                    {CHECK_IDS.map((c) => (
                      <label key={c} className="flex items-center gap-2.5 text-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!r.checklist[c]}
                          onChange={(e) => void act('checklist', [p.id], { checklist: { [c]: e.target.checked } })}
                          className="w-4 h-4 accent-emerald-600"
                        />
                        {v.checks[c]}
                      </label>
                    ))}
                  </fieldset>
                  <div>
                    <div className="text-xs font-semibold text-stone-400 mb-2">{v.adminHistory}</div>
                    {r.history.length === 0 ? (
                      <p className="text-stone-500">{v.adminNoHistory}</p>
                    ) : (
                      <ol className="space-y-1.5 text-xs">
                        {[...r.history].reverse().slice(0, 8).map((h, i) => (
                          <li key={i} className="text-stone-300">
                            <span className="text-stone-500">{new Date(h.at).toLocaleString(language === 'id' ? 'id-ID' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>{' '}
                            · {v.actions[h.action]} · {h.by}
                            {h.note && <span className="block text-stone-400">“{h.note}”</span>}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Batch bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-4 inset-x-4 z-40">
          <div className="max-w-5xl mx-auto bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <span className="text-sm font-bold text-stone-50 shrink-0">{fill(v.adminSelected, selected.size)}</span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 500))}
                placeholder={v.adminNotePlaceholder}
                aria-label={v.adminNotePlaceholder}
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <BatchButton onClick={() => void act('review', [...selected])} disabled={busy}>
                {v.adminStartReview}
              </BatchButton>
              <BatchButton
                primary
                disabled={busy}
                onClick={() => {
                  if (incomplete > 0 && !confirmVerify) return setConfirmVerify(true);
                  void act('verify', [...selected], { note: note || undefined });
                }}
              >
                <BadgeCheck className="w-4 h-4" aria-hidden="true" />
                {v.adminVerify}
              </BatchButton>
              <BatchButton onClick={() => void act('needs_changes', [...selected], { note })} disabled={busy}>
                {v.adminNeedsChanges}
              </BatchButton>
              <BatchButton onClick={() => void act('remove', [...selected], { note: note || undefined })} disabled={busy}>
                {v.adminRemove}
              </BatchButton>
              <BatchButton onClick={() => void act('restore', [...selected])} disabled={busy}>
                {v.adminRestore}
              </BatchButton>
            </div>
            {confirmVerify && incomplete > 0 && (
              <p role="alert" className="text-sm text-amber-300">
                {fill(v.adminChecklistIncomplete, incomplete)}{' '}
                <button onClick={() => void act('verify', [...selected], { note: note || undefined })} className="underline font-bold cursor-pointer">
                  {v.adminVerify}
                </button>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BatchButton({
  children,
  onClick,
  disabled,
  primary
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
        primary ? 'bg-emerald-600 hover:bg-(--action-hover) text-white' : 'border border-stone-600 text-stone-200 hover:bg-stone-800'
      }`}
    >
      {children}
    </button>
  );
}
