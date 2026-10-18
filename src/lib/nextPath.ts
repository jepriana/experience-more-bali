/**
 * "Come back here after sign-up": pages that need an account link to /traveler?next=<path>
 * (or /partner?next=…). Only same-site paths are accepted, so the link can't send people
 * to another website.
 */
export function safeNext(raw: string | null | undefined): string | null {
  if (!raw || raw.length > 300) return null;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return null;
  return /^\/[\w\-./?=&%~]*$/.test(raw) ? raw : null;
}

/** /traveler?next=<current page> */
export function signupHref(base: '/traveler' | '/partner', next: string): string {
  const safe = safeNext(next);
  return safe ? `${base}?next=${encodeURIComponent(safe)}` : base;
}

/** current path + query (browser only) */
export function currentPath(): string {
  return typeof window === 'undefined' ? '/' : window.location.pathname + window.location.search;
}

/** the ?next= of the current URL (browser only) */
export function readNext(): string | null {
  if (typeof window === 'undefined') return null;
  return safeNext(new URLSearchParams(window.location.search).get('next'));
}
