'use client';

import React, { useState } from 'react';
import { ArrowRight, Compass, Lock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAccounts, travelerRegionLabel } from '@/lib/accounts';
import { INDONESIA_PROVINCES, INTERNATIONAL } from '@/data/regions';
import { StickerCanvas } from '@/components/onboarding/StickerCanvas';
import { Field, inputClass, isValidContact } from '@/components/onboarding/SignupFields';

/** First visit as a traveler: 3 quick answers, with the family sticker drawing itself live. */
export function TravelerSignup({ onCreated }: { onCreated: () => void }) {
  const { t } = useLanguage();
  const { saveTraveler } = useAccounts();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [homeProvince, setHomeProvince] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isInternational = homeProvince === INTERNATIONAL;
  const previewRegion = homeProvince ? travelerRegionLabel({ homeProvince, homeCity }) : 'Indonesia';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = t.signup.errName;
    if (!isValidContact(contact)) next.contact = t.signup.errContact;
    if (!homeProvince || (isInternational && !homeCity.trim())) next.home = t.signup.errHome;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    saveTraveler({
      name: name.trim(),
      contact: contact.trim(),
      homeProvince,
      homeCity: homeCity.trim() || undefined,
      createdAt: new Date().toISOString()
    });
    onCreated();
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Live sticker preview (first on phones) */}
        <div className="lg:col-span-5 lg:order-2 lg:sticky lg:top-40 flex flex-col items-center gap-3 stream-in">
          <span className="text-xs font-semibold text-emerald-400">
            {t.signup.previewLabel}
          </span>
          <StickerCanvas
            size={360}
            content={{
              kind: 'traveler',
              title: name || t.landing.sampleTravelerName,
              region: previewRegion,
              tagline: t.sticker.poweredBy
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
              <Compass className="w-3.5 h-3.5" />
              <span>{t.nav.tabTraveler}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-50 tracking-tight">{t.signup.travelerTitle}</h1>
            <p className="text-sm text-stone-400">{t.signup.travelerSubtitle}</p>
          </div>

          <Field label={t.signup.labelName} error={errors.name} htmlFor="tr-name">
            <input
              id="tr-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.signup.placeholderName}
              maxLength={40}
              autoComplete="name"
              autoFocus
              className={inputClass}
            />
          </Field>

          <Field label={t.signup.labelContact} error={errors.contact} htmlFor="tr-contact">
            <input
              id="tr-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={t.signup.placeholderContact}
              autoComplete="email"
              inputMode="email"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t.signup.labelHome} error={errors.home} htmlFor="tr-home">
              <select
                id="tr-home"
                value={homeProvince}
                onChange={(e) => setHomeProvince(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  —
                </option>
                {INDONESIA_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value={INTERNATIONAL}>{t.signup.homeInternational}</option>
              </select>
            </Field>
            <Field label={isInternational ? t.signup.labelCountry : t.signup.labelCity} htmlFor="tr-city">
              <input
                id="tr-city"
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
                placeholder={isInternational ? t.signup.placeholderCountry : t.signup.placeholderCity}
                maxLength={32}
                className={inputClass}
              />
            </Field>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-(--action-hover) text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
          >
            <span>{t.signup.btnCreateTraveler}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-xs text-stone-500 flex items-start gap-1.5">
            <Lock className="w-3 h-3 mt-0.5 shrink-0" />
            <span>{t.signup.privacyNote}</span>
          </p>
        </form>
      </div>
    </div>
  );
}
