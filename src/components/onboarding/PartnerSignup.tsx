'use client';

import React, { useState } from 'react';
import { ArrowRight, Check, Lock, Store } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAccounts, partnerRegionLabel, type PartnerAccount } from '@/lib/accounts';
import { BALI_REGIONS, getBaliRegion, type BaliRegionId } from '@/data/regions';
import { StickerCanvas } from '@/components/onboarding/StickerCanvas';
import { Field, inputClass, isValidContact } from '@/components/onboarding/SignupFields';

/** First visit as a partner: 4 quick answers (region by tapping), partner sticker drawn live. */
export function PartnerSignup({ onCreated }: { onCreated: (account: PartnerAccount) => void }) {
  const { t } = useLanguage();
  const { savePartner } = useAccounts();

  const [picName, setPicName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [contact, setContact] = useState('');
  const [regionId, setRegionId] = useState<BaliRegionId | ''>('');
  const [area, setArea] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const region = getBaliRegion(regionId);
  const previewRegion = regionId ? partnerRegionLabel({ regionId, area }) : 'Bali';

  const pickRegion = (id: BaliRegionId) => {
    setRegionId(id);
    setArea(''); // areas belong to a region
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!picName.trim()) next.pic = t.signup.errPic;
    if (!businessName.trim()) next.business = t.signup.errBusiness;
    if (!isValidContact(contact)) next.contact = t.signup.errContact;
    if (!regionId) next.region = t.signup.errRegion;
    setErrors(next);
    if (Object.keys(next).length > 0 || !regionId) return;

    const account: PartnerAccount = {
      picName: picName.trim(),
      businessName: businessName.trim(),
      contact: contact.trim(),
      regionId,
      area: area || undefined,
      createdAt: new Date().toISOString()
    };
    savePartner(account);
    onCreated(account);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Live sticker preview (first on phones) */}
        <div className="lg:col-span-5 lg:order-2 lg:sticky lg:top-40 flex flex-col items-center gap-3 stream-in">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">
            {t.signup.previewLabel}
          </span>
          <StickerCanvas
            size={360}
            content={{
              kind: 'partner',
              title: businessName || t.landing.samplePartnerName,
              region: previewRegion,
              tagline: t.sticker.strategicPartnerOf
            }}
          />
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="lg:col-span-7 lg:order-1 bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 stream-in"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
              <Store className="w-3.5 h-3.5" />
              <span>{t.nav.tabPartner}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{t.signup.partnerTitle}</h1>
            <p className="text-sm text-stone-400">{t.signup.partnerSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t.signup.labelPic} error={errors.pic} htmlFor="pa-pic">
              <input
                id="pa-pic"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                placeholder={t.signup.placeholderPic}
                autoComplete="name"
                autoFocus
                className={inputClass}
              />
            </Field>
            <Field label={t.signup.labelContact} error={errors.contact} htmlFor="pa-contact">
              <input
                id="pa-contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t.signup.placeholderContact}
                inputMode="email"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label={t.signup.labelBusiness} error={errors.business} htmlFor="pa-business">
            <input
              id="pa-business"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={t.signup.placeholderBusiness}
              maxLength={48}
              autoComplete="organization"
              className={inputClass}
            />
          </Field>

          {/* Region: tap a card instead of typing */}
          <Field label={t.signup.labelBaliRegion} error={errors.region}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label={t.signup.labelBaliRegion}>
              {BALI_REGIONS.map((r) => {
                const selected = regionId === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => pickRegion(r.id)}
                    className={`text-left rounded-xl border px-3 py-2.5 transition-all cursor-pointer ${
                      selected
                        ? 'bg-emerald-950/70 border-emerald-500 ring-1 ring-emerald-500/60'
                        : 'bg-stone-800/70 border-stone-700 hover:border-stone-500'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-white">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                      {r.name}
                      {selected && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                    </span>
                    <span className="block text-[10px] text-stone-400 truncate mt-0.5">{r.areas.slice(0, 3).join(' · ')}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          {region && (
            <Field label={t.signup.labelArea}>
              <div className="flex flex-wrap gap-1.5 stream-in">
                {['', ...region.areas].map((a) => (
                  <button
                    key={a || 'none'}
                    type="button"
                    onClick={() => setArea(a)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      area === a
                        ? 'bg-emerald-600 text-white ring-1 ring-emerald-400'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700/60'
                    }`}
                  >
                    {a || t.signup.areaNone}
                  </button>
                ))}
              </div>
            </Field>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
          >
            <span>{t.signup.btnCreatePartner}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-stone-500 flex items-start gap-1.5">
            <Lock className="w-3 h-3 mt-0.5 shrink-0" />
            <span>{t.signup.privacyNote}</span>
          </p>
        </form>
      </div>
    </div>
  );
}
