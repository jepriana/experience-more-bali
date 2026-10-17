/** Shared by the server layout (inline script) and the client theme hook. */
export const THEME_STORAGE_KEY = 'emb_theme_v1';

/** Inline script for <head>: applies the saved theme before first paint (dark by default). */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;
