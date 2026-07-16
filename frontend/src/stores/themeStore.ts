import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  initialize: () => void;
}

const STORAGE_KEY = 'agentsys-theme';

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light',

  toggleTheme: () =>
    set((state) => {
      const next = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, next);
      return { mode: next };
    }),

  setTheme: (mode: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    set({ mode });
  },

  initialize: () => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored) {
      set({ mode: stored });
    }
  },
}));
