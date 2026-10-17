'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTrip } from '@/components/trip/useTrip';
import { Stepper, StepBasket, StepCategories, StepRegions } from '@/components/trip/TripSteps';
import { DayPlanner } from '@/components/trip/DayPlanner';
import { StepGear } from '@/components/trip/StepGear';

/**
 * Traveler trip builder, as the team lead designed it — choose, don't type:
 *   1. tap Bali regions (map or cards)   2. tap experiences
 *   3. basket pre-filled with matching partners (+ nearby across the border)
 *   4. day grid with AI "Arrange my days", travel-time warnings and the map
 *   5. memory gear: their sticker on a T-shirt / hat / bag with a QR patch linking to the trip
 */
export function TripWizard() {
  const { t } = useLanguage();
  const trip = useTrip();

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Stepper trip={trip} />
        {trip.step > 0 && (
          <button
            onClick={trip.startOver}
            className="shrink-0 px-3 py-2 rounded-lg text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-800 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.trip.startOver}</span>
          </button>
        )}
      </div>

      {trip.step === 0 && <StepRegions trip={trip} />}
      {trip.step === 1 && <StepCategories trip={trip} />}
      {trip.step === 2 && <StepBasket trip={trip} />}
      {trip.step === 3 && <DayPlanner trip={trip} />}
      {trip.step === 4 && <StepGear trip={trip} />}
    </div>
  );
}
