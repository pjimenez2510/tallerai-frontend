'use client';

import { useCallback, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'tallerai-theme';

function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  const preferred: Theme =
    stored ??
    (window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light');
  applyTheme(preferred);
  return preferred;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
