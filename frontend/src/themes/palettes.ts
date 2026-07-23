export type ThemePalette = 'forest' | 'ocean' | 'sunset' | 'lavender' | 'clinical' | 'analytics';

export type MantineColorTuple = [
  string, string, string, string, string,
  string, string, string, string, string,
];

export interface PaletteDefinition {
  id: ThemePalette;
  accent: string;
  accentGlow: string;
  accentSecondary: string;
  primaryScale: MantineColorTuple;
  secondaryScale: MantineColorTuple;
}

const forestPrimary: MantineColorTuple = [
  '#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80',
  '#22C55E', '#16A34A', '#15803D', '#166534', '#14532D',
];

const forestSecondary: MantineColorTuple = [
  '#ECFEFF', '#CFFAFE', '#A5F3FC', '#67E8F9', '#22D3EE',
  '#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63',
];

const oceanPrimary: MantineColorTuple = [
  '#ECFEFF', '#CFFAFE', '#A5F3FC', '#67E8F9', '#22D3EE',
  '#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63',
];

const oceanSecondary: MantineColorTuple = [
  '#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA',
  '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A',
];

const sunsetPrimary: MantineColorTuple = [
  '#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74', '#FB923C',
  '#F97316', '#EA580C', '#EA7A1E', '#C2410C', '#9A3412',
];

const sunsetSecondary: MantineColorTuple = [
  '#F0FDFA', '#CCFBF1', '#99F6E4', '#5EEAD4', '#2DD4BF',
  '#14B8A6', '#0D9488', '#0F766E', '#115E59', '#134E4A',
];

const lavenderPrimary: MantineColorTuple = [
  '#FAF5FF', '#F3E8FF', '#E9D5FF', '#D8B4FE', '#C084FC',
  '#A855F7', '#9333EA', '#7E22CE', '#6B21A8', '#581C87',
];

const lavenderSecondary: MantineColorTuple = [
  '#EEF2FF', '#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8',
  '#6366F1', '#4F46E5', '#4338CA', '#3730A3', '#312E81',
];

const clinicalPrimary: MantineColorTuple = [
  '#FAF8FF', '#F3EEFF', '#E9E2FF', '#D4C9FF', '#B8A6FF',
  '#9B85FF', '#7B61FF', '#6B51EF', '#5B41D9', '#4C35B8',
];

const clinicalSecondary: MantineColorTuple = [
  '#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA',
  '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A',
];

const analyticsPrimary: MantineColorTuple = [
  '#ECFDF5', '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399',
  '#10B981', '#059669', '#047857', '#065F46', '#064E3B',
];

const analyticsSecondary: MantineColorTuple = [
  '#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74', '#FB923C',
  '#F97316', '#EA580C', '#C2410C', '#9A3412', '#7C2D12',
];

export const PALETTES: Record<ThemePalette, PaletteDefinition> = {
  forest: {
    id: 'forest',
    accent: '#16A34A',
    accentGlow: '#22C55E',
    accentSecondary: '#06B6D4',
    primaryScale: forestPrimary,
    secondaryScale: forestSecondary,
  },
  ocean: {
    id: 'ocean',
    accent: '#06B6D4',
    accentGlow: '#22D3EE',
    accentSecondary: '#38BDF8',
    primaryScale: oceanPrimary,
    secondaryScale: oceanSecondary,
  },
  sunset: {
    id: 'sunset',
    accent: '#EA7A1E',
    accentGlow: '#F5973A',
    accentSecondary: '#14B8A6',
    primaryScale: sunsetPrimary,
    secondaryScale: sunsetSecondary,
  },
  lavender: {
    id: 'lavender',
    accent: '#9333EA',
    accentGlow: '#A855F7',
    accentSecondary: '#4F6FDE',
    primaryScale: lavenderPrimary,
    secondaryScale: lavenderSecondary,
  },
  clinical: {
    id: 'clinical',
    accent: '#6B51EF',
    accentGlow: '#7B61FF',
    accentSecondary: '#60A5FA',
    primaryScale: clinicalPrimary,
    secondaryScale: clinicalSecondary,
  },
  analytics: {
    id: 'analytics',
    accent: '#059669',
    accentGlow: '#10B981',
    accentSecondary: '#F97316',
    primaryScale: analyticsPrimary,
    secondaryScale: analyticsSecondary,
  },
};

export const PALETTE_ORDER: ThemePalette[] = ['forest', 'ocean', 'sunset', 'lavender', 'clinical', 'analytics'];

export function isThemePalette(value: string | null): value is ThemePalette {
  return value !== null && value in PALETTES;
}
