import { createTheme, DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';
import { baseThemeConfig } from './baseTheme';
import { PALETTES, type ThemePalette } from './palettes';

export function createAppTheme(palette: ThemePalette) {
  const colors = PALETTES[palette];

  return mergeMantineTheme(
    DEFAULT_THEME,
    createTheme({
      ...baseThemeConfig,
      primaryColor: 'agentGreen',
      colors: {
        agentGreen: colors.primaryScale,
        agentCyan: colors.secondaryScale,
      },
      other: {
        ...baseThemeConfig.other,
        palette,
        accent: colors.accent,
        accentGlow: colors.accentGlow,
        accentSecondary: colors.accentSecondary,
      },
    }),
  );
}
