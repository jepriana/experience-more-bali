'use client';

import React from 'react';
import { BALI_REGIONS, type BaliRegionId } from '@/data/regions';
import { BALI_MAP_HEIGHT, BALI_MAP_WIDTH, BALI_REGION_PATHS, projectToMap } from '@/data/baliMap';
import { orderDayRoute, type Stop } from '@/lib/tripPlanning';
import { DAY_COLORS } from '@/components/trip/useTrip';

/**
 * Self-contained SVG map of Bali (no map tiles, no API key — works offline at a demo).
 * Regions are coloured; chosen ones stand out. Optionally shows stops as pins coloured by
 * day, with a dashed route per day, and lets the user tap regions to select them.
 */
export function BaliMap({
  selectedRegions,
  onToggleRegion,
  stops = [],
  assignment = {},
  days = 0,
  regionLabel
}: {
  selectedRegions: BaliRegionId[];
  onToggleRegion?: (id: BaliRegionId) => void;
  stops?: Stop[];
  /** stopId → day index */
  assignment?: Record<string, number>;
  days?: number;
  regionLabel?: string;
}) {
  const anySelected = selectedRegions.length > 0;
  const interactive = !!onToggleRegion;

  const dayRoutes = Array.from({ length: days }, (_, d) => orderDayRoute(stops.filter((s) => assignment[s.id] === d)));

  return (
    <svg
      viewBox={`0 0 ${BALI_MAP_WIDTH} ${BALI_MAP_HEIGHT}`}
      className="w-full h-auto select-none"
      role="img"
      aria-label="Map of Bali"
    >
      <defs>
        <filter id="pin-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Regions */}
      {BALI_REGIONS.map((r) => {
        const selected = selectedRegions.includes(r.id);
        const opacity = selected ? 0.62 : anySelected ? 0.13 : 0.32;
        return (
          <path
            key={r.id}
            d={BALI_REGION_PATHS[r.id]}
            fill={r.color}
            fillOpacity={opacity}
            stroke={selected ? '#fafaf9' : '#0c0a09'}
            strokeWidth={selected ? 2.5 : 1.5}
            strokeLinejoin="round"
            className={interactive ? 'cursor-pointer transition-[fill-opacity,filter] duration-200 hover:brightness-125 focus:outline-none focus-visible:brightness-150' : undefined}
            onClick={interactive ? () => onToggleRegion?.(r.id) : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onToggleRegion?.(r.id);
                    }
                  }
                : undefined
            }
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-pressed={interactive ? selected : undefined}
            aria-label={interactive ? `${regionLabel ?? 'Region'} ${r.name}` : undefined}
          >
            <title>{`${r.name} — ${r.areas.slice(0, 3).join(', ')}`}</title>
          </path>
        );
      })}

      {/* Region names */}
      {BALI_REGIONS.map((r) => {
        const { x, y } = projectToMap(r.center.lat, r.center.lng);
        const selected = selectedRegions.includes(r.id);
        return (
          <text
            key={`label-${r.id}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={r.id === 'denpasar' ? 15 : 19}
            fontWeight={700}
            fill={selected || !anySelected ? '#fafaf9' : '#a8a29e'}
            stroke="#0c0a09"
            strokeWidth={4}
            paintOrder="stroke"
            pointerEvents="none"
          >
            {r.name}
          </text>
        );
      })}

      {/* Day routes */}
      {dayRoutes.map((route, d) =>
        route.length > 1 ? (
          <polyline
            key={`route-${d}`}
            points={route.map((s) => {
              const p = projectToMap(s.coords.lat, s.coords.lng);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none"
            stroke={DAY_COLORS[d % DAY_COLORS.length]}
            strokeWidth={3.5}
            strokeDasharray="9 6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.95}
          />
        ) : null
      )}

      {/* Stops */}
      {stops.map((s) => {
        const { x, y } = projectToMap(s.coords.lat, s.coords.lng);
        const day = assignment[s.id];
        const planned = day !== undefined && day < days;
        const color = planned ? DAY_COLORS[day % DAY_COLORS.length] : '#78716c';
        return (
          <g key={s.id} filter="url(#pin-shadow)" className="stream-in">
            <circle cx={x} cy={y} r={13} fill={color} stroke="#fafaf9" strokeWidth={3} />
            <text
              x={x}
              y={y + 0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={13}
              fontWeight={800}
              fill="#ffffff"
              pointerEvents="none"
            >
              {planned ? day + 1 : '?'}
            </text>
            <title>{s.name}</title>
          </g>
        );
      })}
    </svg>
  );
}
