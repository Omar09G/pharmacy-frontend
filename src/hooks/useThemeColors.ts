import { useEffect, useState, type CSSProperties } from 'react';
import { useUIStore } from '../store/uiStore';

export interface ThemeChartColors {
  grid: string;
  tick: string;
  tooltipBg: string;
  tooltipText: string;
  brand: string;
  success: string;
  tooltipStyle: CSSProperties;
}

function fallbackColors(): ThemeChartColors {
  return {
    grid: '#e4e4dc',
    tick: '#5b6b64',
    tooltipBg: '#ffffff',
    tooltipText: '#1a2622',
    brand: '#047857',
    success: '#15803d',
    tooltipStyle: {},
  };
}

function readColors(): ThemeChartColors {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(name).trim();
  const grid = v('--line') || '#e4e4dc';
  return {
    grid,
    tick: v('--muted') || '#5b6b64',
    tooltipBg: v('--surface') || '#ffffff',
    tooltipText: v('--ink') || '#1a2622',
    brand: v('--brand') || '#047857',
    success: v('--success') || '#15803d',
    tooltipStyle: {
      backgroundColor: v('--surface') || '#ffffff',
      border: `1px solid ${grid}`,
      borderRadius: '10px',
      color: v('--ink') || '#1a2622',
      boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
    },
  };
}

export function useThemeColors(): ThemeChartColors {
  const theme = useUIStore((s) => s.theme);

  const [colors, setColors] = useState<ThemeChartColors>(() =>
    typeof document === 'undefined' ? fallbackColors() : readColors(),
  );

  useEffect(() => {
    const update = () => setColors(readColors());
    const raf = requestAnimationFrame(update);
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', update);
    return () => {
      cancelAnimationFrame(raf);
      mql.removeEventListener('change', update);
    };
  }, [theme]);

  return colors;
}
