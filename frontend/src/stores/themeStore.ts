import { create } from 'zustand';
import { isThemePalette, type ThemePalette } from '../themes/palettes';

export type ThemeMode = 'light' | 'dark';

const MODE_STORAGE_KEY = 'agentsys-theme';
const PALETTE_STORAGE_KEY = 'agentsys-palette';

interface ThemeState {
  palette: ThemePalette;
  mode: ThemeMode;
  setPalette: (palette: ThemePalette) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  initialize: () => void;
}

function readStoredMode(): ThemeMode {
  const stored = localStorage.getItem(MODE_STORAGE_KEY);
  return stored === 'dark' ? 'dark' : 'light';
}

function readStoredPalette(): ThemePalette {
  const stored = localStorage.getItem(PALETTE_STORAGE_KEY);
  if (stored === 'rose') {
    localStorage.setItem(PALETTE_STORAGE_KEY, 'lavender');
    return 'lavender';
  }
  if (isThemePalette(stored)) return stored;
  return 'forest';
}

export function applyThemeAttributes(palette: ThemePalette, mode: ThemeMode) {
  const root = document.documentElement;
  root.setAttribute('data-agentsys-palette', palette);
  root.setAttribute('data-mantine-color-scheme', mode);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  palette: 'forest',
  mode: 'light',

  setPalette: (palette) => {
    localStorage.setItem(PALETTE_STORAGE_KEY, palette);
    set({ palette });
    applyThemeAttributes(palette, get().mode);
  },

  setMode: (mode) => {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
    set({ mode });
    applyThemeAttributes(get().palette, mode);
  },

  toggleMode: () => {
    const next = get().mode === 'light' ? 'dark' : 'light';
    get().setMode(next);
  },

  initialize: () => {
    const palette = readStoredPalette();
    const mode = readStoredMode();
    set({ palette, mode });
    applyThemeAttributes(palette, mode);
  },
}));

// 首屏渲染前同步 DOM，避免闪烁
applyThemeAttributes(readStoredPalette(), readStoredMode());
