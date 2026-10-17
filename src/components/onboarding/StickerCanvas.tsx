'use client';

import React, { useEffect, useRef } from 'react';
import { drawSticker, type StickerContent } from '@/lib/sticker';

/** Live memory-sticker preview. Redraws whenever the text changes (e.g. while typing). */
export function StickerCanvas({
  content,
  size,
  className = ''
}: {
  content: StickerContent;
  size: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { kind, title, region, tagline } = content;

  useEffect(() => {
    if (ref.current) void drawSticker(ref.current, { kind, title, region, tagline }, size);
  }, [kind, title, region, tagline, size]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ width: size, maxWidth: '100%', height: 'auto' }}
      className={className}
      role="img"
      aria-label={`${title} — ${region} — ${tagline} KOSSI Adventure`}
    />
  );
}
