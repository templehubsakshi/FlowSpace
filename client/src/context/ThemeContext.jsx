/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, useContext } from 'react';

// ── Dark tokens ──────────────────────────────────────────────────────────────
const darkTokens = {
  bg:      '#0b0d14',
  surface: '#0f1117',
  s2:      '#141824',
  s3:      '#1a1f30',
  s4:      '#1e2438',
  border:  'rgba(255,255,255,0.06)',
  border2: 'rgba(255,255,255,0.10)',
  border3: 'rgba(255,255,255,0.15)',
  text:    '#e2e8f0',
  text2:   '#cbd5e1',
  muted:   '#64748b',
  dim:     '#94a3b8',
  green:   '#10b981',
  green2:  '#34d399',
  indigo:  '#6366f1',
  indigo2: '#818cf8',
  amber:   '#f59e0b',
  orange:  '#f97316',
  red:     '#ef4444',
  red2:    '#fca5a5',
  purple:  '#a855f7',
  cyan:    '#06b6d4',
  surfaceCard: 'linear-gradient(145deg,#13151f,#0f1117)',
  panel: { background: 'linear-gradient(145deg,#13151f,#0f1117)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, boxShadow: '0 6px 28px rgba(0,0,0,0.28)' },
};

// ── Light tokens ─────────────────────────────────────────────────────────────
const lightTokens = {
  bg:      '#f0f2f7',
  surface: '#ffffff',
  s2:      '#f5f7fb',
  s3:      '#ebeef5',
  s4:      '#e2e7f0',
  border:  'rgba(0,0,0,0.07)',
  border2: 'rgba(0,0,0,0.11)',
  border3: 'rgba(0,0,0,0.18)',
  text:    '#0f172a',
  text2:   '#1e293b',
  muted:   '#64748b',
  dim:     '#475569',
  green:   '#059669',
  green2:  '#10b981',
  indigo:  '#4338ca',
  indigo2: '#6366f1',
  amber:   '#b45309',
  orange:  '#c2410c',
  red:     '#dc2626',
  red2:    '#fca5a5',
  purple:  '#7c3aed',
  cyan:    '#0891b2',
  surfaceCard: '#ffffff',
  panel: { background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
};

// ── Context ───────────────────────────────────────────────────────────────────
export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);
  const tokens = isDark ? darkTokens : lightTokens;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function useThemeColors() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeColors must be used within ThemeProvider');
  return ctx.tokens;
}