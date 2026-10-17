'use client';

import React, { useMemo } from 'react';
import { qrSvg } from '@/lib/qr';

/** A QR code as inline SVG (scales sharply to any size). */
export function QrImage({ value, className = 'w-40 h-40', label }: { value: string; className?: string; label?: string }) {
  const { viewBox, path } = useMemo(() => qrSvg(value), [value]);
  return (
    <svg
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      className={`${className} bg-white rounded-lg`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={label ?? 'QR code'}
    >
      <path d={path} fill="#0c0a09" />
    </svg>
  );
}
