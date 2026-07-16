import { create } from 'zustand';
import { config } from '../config';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;

  login: (token: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: !config.auth.enabled, // auth 未启用时始终为 true

  login: (token: string) => {
    localStorage.setItem(config.auth.storageKey, token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(config.auth.storageKey);
    set({ token: null, isAuthenticated: false });
  },

  initialize: () => {
    if (!config.auth.enabled) {
      set({ token: null, isAuthenticated: true });
      return;
    }
    const token = localStorage.getItem(config.auth.storageKey);
    set({ token, isAuthenticated: !!token });
  },
}));
