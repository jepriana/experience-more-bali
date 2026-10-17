import type React from 'react';

/**
 * Keyboard support for tab rows (WAI-ARIA tabs pattern): arrow keys move between tabs,
 * Home/End jump to the ends, and the focused tab is selected right away.
 * Pair with tabIndex={selected ? 0 : -1} so Tab enters the row once.
 */
export function tabKeyNav(e: React.KeyboardEvent<HTMLElement>) {
  if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
  const list = e.currentTarget.closest('[role="tablist"]');
  if (!list) return;
  const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
  const i = tabs.indexOf(e.currentTarget);
  const next =
    e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  e.preventDefault();
  tabs[next].focus();
  tabs[next].click();
}
