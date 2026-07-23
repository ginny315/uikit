import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone: string;
  countryCode: string;
  avatarUrl?: string;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_admin_001',
  username: 'admin',
  email: 'admin@agentsys.io',
  phone: '13800138000',
  countryCode: '+86',
};

interface ProfileState {
  profile: UserProfile;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setAvatar: (avatarUrl: string | undefined) => void;
  resetProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,

      updateProfile: (patch) =>
        set((state) => ({ profile: { ...state.profile, ...patch } })),

      setAvatar: (avatarUrl) =>
        set((state) => ({ profile: { ...state.profile, avatarUrl } })),

      resetProfile: () => set({ profile: DEFAULT_PROFILE }),
    }),
    { name: 'agentsys-profile' },
  ),
);

export function getProfileInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'A';
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}
