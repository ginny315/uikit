import { createTheme, DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';
import { baseThemeConfig } from './baseTheme';
import { PALETTE_SHAPES } from './paletteShapes';
import { PALETTES, type ThemePalette } from './palettes';

export function createAppTheme(palette: ThemePalette) {
  const colors = PALETTES[palette];
  const shape = PALETTE_SHAPES[palette];

  return mergeMantineTheme(
    DEFAULT_THEME,
    createTheme({
      ...baseThemeConfig,
      ...shape,
      primaryColor: 'agentGreen',
      colors: {
        agentGreen: colors.primaryScale,
        agentCyan: colors.secondaryScale,
      },
      headings: {
        ...baseThemeConfig.headings,
        ...shape?.headings,
      },
      components: {
        ...baseThemeConfig.components,
        ...shape?.components,
      },
      other: {
        ...baseThemeConfig.other,
        ...shape?.other,
        palette,
        accent: colors.accent,
        accentGlow: colors.accentGlow,
        accentSecondary: colors.accentSecondary,
      },
    }),
  );
}
