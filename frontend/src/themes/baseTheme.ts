import type { MantineThemeOverride } from '@mantine/core';

export const baseThemeConfig: MantineThemeOverride = {
  fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Fira Code, monospace',
  headings: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '28px', lineHeight: '1.3' },
      h2: { fontSize: '22px', lineHeight: '1.3' },
      h3: { fontSize: '18px', lineHeight: '1.4' },
      h4: { fontSize: '16px', lineHeight: '1.4' },
    },
  },
  fontSizes: {
    xs: '10.4px',
    sm: '12.8px',
    md: '14.4px',
    lg: '16px',
    xl: '18px',
  },
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
  },
  shadows: {
    xs: '0 1px 1px rgba(0,0,0,0.04)',
    sm: '0 1px 2px rgba(0,0,0,0.04)',
    md: '0 4px 12px rgba(0,0,0,0.06)',
    lg: '0 8px 24px rgba(0,0,0,0.08)',
    xl: '0 24px 80px rgba(0,0,0,0.5)',
  },
  defaultRadius: 'lg',
  components: {
    Card: {
      defaultProps: {
        radius: 'lg',
        padding: 'xl',
      },
    },
    Button: {
      defaultProps: {
        radius: 'xl',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'sm',
      },
    },
    Select: {
      defaultProps: {
        radius: 'sm',
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'sm',
      },
    },
    Table: {
      defaultProps: {
        highlightOnHover: true,
        withTableBorder: false,
        withRowBorders: true,
      },
    },
    Badge: {
      defaultProps: {
        ff: 'monospace',
        fw: 500,
      },
    },
    Modal: {
      defaultProps: {
        centered: true,
        radius: 'lg',
        padding: 0,
        size: '440px',
        overlayProps: { backgroundOpacity: 0.45, blur: 6 },
        transitionProps: { transition: 'pop', duration: 180 },
      },
    },
    Tabs: {
      defaultProps: {
        variant: 'pills',
      },
    },
  },
  other: {
    glowGreen: '0 0 8px rgba(34,197,94,0.3)',
    glowCyan: '0 0 8px rgba(6,182,212,0.3)',
    glowAmber: '0 0 8px rgba(245,158,11,0.3)',
    glowRose: '0 0 8px rgba(244,63,94,0.3)',
    glowPurple: '0 0 8px rgba(168,85,247,0.3)',
    sidebarWidth: 240,
    topbarHeight: 64,
    contentMaxWidth: 1440,
    glassBg: 'rgba(255,255,255,0.85)',
    glassBlur: 16,
  },
};
