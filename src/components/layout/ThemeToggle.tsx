import { useState, useEffect, useCallback } from 'react';

function getIsDark(): boolean {
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark');
  }
  return true; // default to dark
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(getIsDark);

  // Sync state when component mounts or re-hydrates after View Transitions
  useEffect(() => {
    setDark(getIsDark());

    // Listen for Astro View Transitions page loads
    const syncTheme = () => setDark(getIsDark());
    document.addEventListener('astro:page-load', syncTheme);
    document.addEventListener('astro:after-swap', syncTheme);

    return () => {
      document.removeEventListener('astro:page-load', syncTheme);
      document.removeEventListener('astro:after-swap', syncTheme);
    };
  }, []);

  const toggle = useCallback(() => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');

    // Update Giscus theme if present
    const giscusFrame = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (giscusFrame?.contentWindow) {
      giscusFrame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: next ? 'dark' : 'light' } } },
        'https://giscus.app'
      );
    }
  }, [dark]);

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
