import type { MantineThemeOverride } from '@mantine/core';
import type { ThemePalette } from './palettes';

export type AppTabsVariant = 'pills' | 'underline';

/** 各配色的形状/密度/字体覆盖 — 全量 6 主题，差异拉满 */
export const PALETTE_SHAPES: Record<ThemePalette, MantineThemeOverride> = {
  forest: {
    fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif',
    headings: {
      fontFamily: 'Space Grotesk, sans-serif',
      fontWeight: '600',
    },
    defaultRadius: 'lg',
    components: {
      Card: { defaultProps: { radius: 'lg', padding: 'xl' } },
      Button: { defaultProps: { radius: 'xl', variant: 'filled' } },
      Badge: { defaultProps: { ff: 'monospace', fw: 500 } },
      Tabs: { defaultProps: { variant: 'pills' } },
    },
    other: {
      appTabsVariant: 'pills' as AppTabsVariant,
    },
  },

  ocean: {
    fontFamily: "'IBM Plex Sans', DM Sans, -apple-system, BlinkMacSystemFont, sans-serif",
    headings: {
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontWeight: '600',
    },
    radius: { xs: '2px', sm: '4px', md: '6px', lg: '8px', xl: '12px' },
    spacing: { xs: '3px', sm: '6px', md: '10px', lg: '14px', xl: '20px' },
    defaultRadius: 'sm',
    shadows: {
      xs: '0 1px 2px rgba(6, 182, 212, 0.05)',
      sm: '0 1px 4px rgba(6, 182, 212, 0.07)',
      md: '0 2px 10px rgba(6, 182, 212, 0.09)',
      lg: '0 4px 18px rgba(6, 182, 212, 0.11)',
      xl: '0 8px 36px rgba(6, 182, 212, 0.14)',
    },
    components: {
      Card: { defaultProps: { radius: 'sm', padding: 'md', withBorder: true } },
      Button: { defaultProps: { radius: 'sm', variant: 'outline' } },
      TextInput: { defaultProps: { radius: 'sm' } },
      Select: { defaultProps: { radius: 'sm' } },
      Textarea: { defaultProps: { radius: 'sm' } },
      Badge: { defaultProps: { ff: 'inherit', fw: 600, radius: 'xs' } },
      Tabs: { defaultProps: { variant: 'default', radius: 'sm' } },
      Modal: {
        defaultProps: {
          centered: true,
          radius: 'sm',
          padding: 0,
          size: '440px',
          overlayProps: { backgroundOpacity: 0.45, blur: 8 },
          transitionProps: { transition: 'pop', duration: 180 },
        },
      },
    },
    other: {
      appTabsVariant: 'underline' as AppTabsVariant,
    },
  },

  sunset: {
    fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif',
    headings: {
      fontFamily: 'DM Sans, sans-serif',
      fontWeight: '700',
    },
    radius: { xs: '8px', sm: '12px', md: '16px', lg: '20px', xl: '28px' },
    spacing: { xs: '8px', sm: '12px', md: '16px', lg: '24px', xl: '32px' },
    defaultRadius: 'lg',
    shadows: {
      xs: '0 2px 4px rgba(234, 122, 30, 0.06)',
      sm: '0 2px 8px rgba(234, 122, 30, 0.08)',
      md: '0 4px 16px rgba(234, 122, 30, 0.10)',
      lg: '0 8px 28px rgba(234, 122, 30, 0.14)',
      xl: '0 16px 48px rgba(234, 122, 30, 0.18)',
    },
    components: {
      Card: { defaultProps: { radius: 'xl', padding: 'xl', withBorder: true } },
      Button: { defaultProps: { radius: 'xl', variant: 'filled' } },
      TextInput: { defaultProps: { radius: 'lg' } },
      Select: { defaultProps: { radius: 'lg' } },
      Textarea: { defaultProps: { radius: 'lg' } },
      Badge: { defaultProps: { ff: 'inherit', fw: 500, radius: 'lg' } },
      Tabs: { defaultProps: { variant: 'pills', radius: 'xl' } },
      Modal: {
        defaultProps: {
          centered: true,
          radius: 'xl',
          padding: 0,
          size: '440px',
          overlayProps: { backgroundOpacity: 0.30, blur: 6 },
          transitionProps: { transition: 'pop', duration: 220 },
        },
      },
    },
    other: {
      appTabsVariant: 'pills' as AppTabsVariant,
    },
  },

  lavender: {
    fontFamily: 'Inter, DM Sans, -apple-system, BlinkMacSystemFont, sans-serif',
    headings: {
      fontFamily: 'Inter, sans-serif',
      fontWeight: '600',
    },
    radius: { xs: '6px', sm: '10px', md: '14px', lg: '16px', xl: '22px' },
    spacing: { xs: '6px', sm: '10px', md: '14px', lg: '20px', xl: '28px' },
    defaultRadius: 'md',
    shadows: {
      xs: '0 1px 3px rgba(147, 51, 234, 0.04)',
      sm: '0 2px 6px rgba(147, 51, 234, 0.06)',
      md: '0 4px 14px rgba(147, 51, 234, 0.08)',
      lg: '0 8px 24px rgba(147, 51, 234, 0.10)',
      xl: '0 14px 40px rgba(147, 51, 234, 0.12)',
    },
    components: {
      Card: { defaultProps: { radius: 'lg', padding: 'xl', withBorder: true } },
      Button: { defaultProps: { radius: 'lg', variant: 'light' } },
      TextInput: { defaultProps: { radius: 'md' } },
      Select: { defaultProps: { radius: 'md' } },
      Textarea: { defaultProps: { radius: 'md' } },
      Badge: { defaultProps: { ff: 'inherit', fw: 500, radius: 'md' } },
      Tabs: { defaultProps: { variant: 'pills', radius: 'lg' } },
      Modal: {
        defaultProps: {
          centered: true,
          radius: 'lg',
          padding: 0,
          size: '440px',
          overlayProps: { backgroundOpacity: 0.38, blur: 5 },
          transitionProps: { transition: 'pop', duration: 180 },
        },
      },
    },
    other: {
      appTabsVariant: 'pills' as AppTabsVariant,
    },
  },

  clinical: {
    fontFamily: 'Inter, DM Sans, -apple-system, BlinkMacSystemFont, sans-serif',
    headings: {
      fontFamily: 'Inter, sans-serif',
      fontWeight: '600',
    },
    radius: { xs: '8px', sm: '12px', md: '16px', lg: '20px', xl: '28px' },
    spacing: { xs: '8px', sm: '12px', md: '16px', lg: '24px', xl: '36px' },
    defaultRadius: 'lg',
    shadows: {
      xs: '0 1px 2px rgba(0,0,0,0.02)',
      sm: '0 1px 3px rgba(0,0,0,0.03)',
      md: '0 2px 8px rgba(0,0,0,0.04)',
      lg: '0 4px 16px rgba(0,0,0,0.05)',
      xl: '0 12px 40px rgba(0,0,0,0.06)',
    },
    components: {
      Card: { defaultProps: { radius: 'xl', padding: 'xl', withBorder: true } },
      Button: { defaultProps: { radius: 'xl', variant: 'filled' } },
      TextInput: { defaultProps: { radius: 'md' } },
      Select: { defaultProps: { radius: 'md' } },
      Textarea: { defaultProps: { radius: 'md' } },
      Badge: { defaultProps: { ff: 'inherit', fw: 500, radius: 'md' } },
      Tabs: { defaultProps: { variant: 'pills', radius: 'xl' } },
      Modal: {
        defaultProps: {
          centered: true,
          radius: 'xl',
          padding: 0,
          size: '480px',
          overlayProps: { backgroundOpacity: 0.32, blur: 4 },
          transitionProps: { transition: 'pop', duration: 200 },
        },
      },
    },
    other: {
      appTabsVariant: 'pills' as AppTabsVariant,
    },
  },

  analytics: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontFamilyMonospace: 'JetBrains Mono, Fira Code, monospace',
    headings: {
      fontFamily: 'Inter, sans-serif',
      fontWeight: '700',
      sizes: {
        h1: { fontSize: '26px', lineHeight: '1.2' },
        h2: { fontSize: '20px', lineHeight: '1.25' },
        h3: { fontSize: '16px', lineHeight: '1.3' },
        h4: { fontSize: '14px', lineHeight: '1.35' },
      },
    },
    fontSizes: { xs: '10px', sm: '12px', md: '13px', lg: '14px', xl: '16px' },
    radius: { xs: '0px', sm: '0px', md: '0px', lg: '0px', xl: '2px' },
    spacing: { xs: '2px', sm: '6px', md: '10px', lg: '14px', xl: '20px' },
    defaultRadius: 'xs',
    shadows: {
      xs: 'none',
      sm: '0 1px 2px rgba(16, 185, 129, 0.05)',
      md: '0 1px 4px rgba(16, 185, 129, 0.07)',
      lg: '0 2px 6px rgba(16, 185, 129, 0.08)',
      xl: '0 4px 12px rgba(16, 185, 129, 0.10)',
    },
    components: {
      Card: { defaultProps: { radius: 'xs', padding: 'md', withBorder: true } },
      Button: { defaultProps: { radius: 'xs', variant: 'outline' } },
      TextInput: { defaultProps: { radius: 'xs' } },
      Select: { defaultProps: { radius: 'xs' } },
      Textarea: { defaultProps: { radius: 'xs' } },
      Badge: { defaultProps: { ff: 'monospace', fw: 600, radius: 'xs' } },
      Table: { defaultProps: { highlightOnHover: true, verticalSpacing: 'xs' } },
      Tabs: { defaultProps: { variant: 'default', radius: 'xs' } },
      Modal: {
        defaultProps: {
          centered: true,
          radius: 'xs',
          padding: 0,
          size: '420px',
          overlayProps: { backgroundOpacity: 0.50, blur: 2 },
          transitionProps: { transition: 'fade', duration: 120 },
        },
      },
    },
    other: {
      appTabsVariant: 'underline' as AppTabsVariant,
    },
  },
};
