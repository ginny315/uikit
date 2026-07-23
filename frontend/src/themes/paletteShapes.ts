import type { MantineThemeOverride } from '@mantine/core';
import type { ThemePalette } from './palettes';

/** 各配色的形状/密度覆盖（圆角、间距、字体、阴影等） */
export const PALETTE_SHAPES: Partial<Record<ThemePalette, MantineThemeOverride>> = {
  ocean: {
    radius: {
      xs: '4px',
      sm: '6px',
      md: '8px',
      lg: '10px',
      xl: '14px',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '22px',
    },
    defaultRadius: 'sm',
    shadows: {
      xs: '0 1px 2px rgba(6, 182, 212, 0.04)',
      sm: '0 1px 3px rgba(6, 182, 212, 0.06)',
      md: '0 2px 8px rgba(6, 182, 212, 0.08)',
      lg: '0 4px 16px rgba(6, 182, 212, 0.10)',
      xl: '0 8px 32px rgba(6, 182, 212, 0.12)',
    },
    components: {
      Card: {
        defaultProps: {
          radius: 'md',
          padding: 'lg',
          withBorder: true,
        },
      },
      Button: {
        defaultProps: {
          radius: 'md',
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
      Badge: {
        defaultProps: {
          ff: 'inherit',
          fw: 500,
          radius: 'sm',
        },
      },
      Modal: {
        defaultProps: {
          centered: true,
          radius: 'md',
          padding: 0,
          size: '440px',
          overlayProps: { backgroundOpacity: 0.40, blur: 5 },
          transitionProps: { transition: 'pop', duration: 180 },
        },
      },
      Tabs: {
        defaultProps: {
          variant: 'default',
          radius: 'sm',
        },
      },
    },
  },
  sunset: {
    radius: {
      xs: '6px',
      sm: '10px',
      md: '14px',
      lg: '18px',
      xl: '24px',
    },
    spacing: {
      xs: '6px',
      sm: '10px',
      md: '14px',
      lg: '20px',
      xl: '28px',
    },
    defaultRadius: 'md',
    shadows: {
      xs: '0 1px 2px rgba(234, 122, 30, 0.04)',
      sm: '0 1px 4px rgba(234, 122, 30, 0.06)',
      md: '0 2px 10px rgba(234, 122, 30, 0.08)',
      lg: '0 4px 20px rgba(234, 122, 30, 0.10)',
      xl: '0 12px 40px rgba(234, 122, 30, 0.12)',
    },
    components: {
      Card: {
        defaultProps: {
          radius: 'lg',
          padding: 'xl',
          withBorder: true,
        },
      },
      Button: {
        defaultProps: {
          radius: 'xl',
        },
      },
      TextInput: {
        defaultProps: {
          radius: 'md',
        },
      },
      Select: {
        defaultProps: {
          radius: 'md',
        },
      },
      Textarea: {
        defaultProps: {
          radius: 'md',
        },
      },
      Badge: {
        defaultProps: {
          ff: 'inherit',
          fw: 500,
          radius: 'md',
        },
      },
      Modal: {
        defaultProps: {
          centered: true,
          radius: 'lg',
          padding: 0,
          size: '440px',
          overlayProps: { backgroundOpacity: 0.35, blur: 4 },
          transitionProps: { transition: 'pop', duration: 180 },
        },
      },
    },
  },
  lavender: {
    fontFamily: 'Inter, DM Sans, -apple-system, BlinkMacSystemFont, sans-serif',
    headings: {
      fontFamily: 'Inter, DM Sans, sans-serif',
      fontWeight: '600',
    },
    radius: {
      xs: '5px',
      sm: '8px',
      md: '12px',
      lg: '14px',
      xl: '20px',
    },
    spacing: {
      xs: '5px',
      sm: '9px',
      md: '13px',
      lg: '18px',
      xl: '26px',
    },
    defaultRadius: 'md',
    shadows: {
      xs: '0 1px 2px rgba(147, 51, 234, 0.03)',
      sm: '0 1px 3px rgba(147, 51, 234, 0.05)',
      md: '0 2px 8px rgba(147, 51, 234, 0.06)',
      lg: '0 4px 16px rgba(147, 51, 234, 0.08)',
      xl: '0 10px 36px rgba(147, 51, 234, 0.10)',
    },
    components: {
      Card: {
        defaultProps: {
          radius: 'lg',
          padding: 'xl',
          withBorder: true,
        },
      },
      Button: {
        defaultProps: {
          radius: 'lg',
        },
      },
      TextInput: {
        defaultProps: {
          radius: 'md',
        },
      },
      Select: {
        defaultProps: {
          radius: 'md',
        },
      },
      Textarea: {
        defaultProps: {
          radius: 'md',
        },
      },
      Badge: {
        defaultProps: {
          ff: 'inherit',
          fw: 500,
          radius: 'md',
        },
      },
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
  },
  clinical: {
    fontFamily: 'Inter, DM Sans, -apple-system, BlinkMacSystemFont, sans-serif',
    headings: {
      fontFamily: 'Inter, DM Sans, sans-serif',
      fontWeight: '600',
    },
    radius: {
      xs: '6px',
      sm: '10px',
      md: '14px',
      lg: '16px',
      xl: '24px',
    },
    spacing: {
      xs: '6px',
      sm: '10px',
      md: '14px',
      lg: '20px',
      xl: '28px',
    },
    defaultRadius: 'md',
    shadows: {
      xs: '0 1px 2px rgba(0,0,0,0.03)',
      sm: '0 1px 3px rgba(0,0,0,0.04)',
      md: '0 2px 8px rgba(0,0,0,0.05)',
      lg: '0 4px 16px rgba(0,0,0,0.06)',
      xl: '0 12px 40px rgba(0,0,0,0.08)',
    },
    components: {
      Card: {
        defaultProps: {
          radius: 'lg',
          padding: 'xl',
          withBorder: true,
        },
      },
      Button: {
        defaultProps: {
          radius: 'xl',
        },
      },
      TextInput: {
        defaultProps: {
          radius: 'md',
        },
      },
      Select: {
        defaultProps: {
          radius: 'md',
        },
      },
      Textarea: {
        defaultProps: {
          radius: 'md',
        },
      },
      Badge: {
        defaultProps: {
          ff: 'inherit',
          fw: 500,
          radius: 'md',
        },
      },
      Modal: {
        defaultProps: {
          centered: true,
          radius: 'lg',
          padding: 0,
          size: '440px',
          overlayProps: { backgroundOpacity: 0.35, blur: 4 },
          transitionProps: { transition: 'pop', duration: 180 },
        },
      },
    },
  },
  analytics: {
    radius: {
      xs: '0px',
      sm: '2px',
      md: '4px',
      lg: '4px',
      xl: '6px',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '18px',
      xl: '24px',
    },
    defaultRadius: 'xs',
    shadows: {
      xs: '0 1px 2px rgba(16, 185, 129, 0.04)',
      sm: '0 1px 3px rgba(16, 185, 129, 0.06)',
      md: '0 2px 6px rgba(16, 185, 129, 0.07)',
      lg: '0 2px 8px rgba(16, 185, 129, 0.08)',
      xl: '0 4px 16px rgba(16, 185, 129, 0.10)',
    },
    components: {
      Card: {
        defaultProps: {
          radius: 'xs',
          padding: 'lg',
          withBorder: true,
        },
      },
      Button: {
        defaultProps: {
          radius: 'xs',
        },
      },
      TextInput: {
        defaultProps: {
          radius: 'xs',
        },
      },
      Select: {
        defaultProps: {
          radius: 'xs',
        },
      },
      Textarea: {
        defaultProps: {
          radius: 'xs',
        },
      },
      Badge: {
        defaultProps: {
          ff: 'inherit',
          fw: 500,
          radius: 'xs',
        },
      },
      Modal: {
        defaultProps: {
          centered: true,
          radius: 'xs',
          padding: 0,
          size: '440px',
          overlayProps: { backgroundOpacity: 0.40, blur: 5 },
          transitionProps: { transition: 'pop', duration: 180 },
        },
      },
      Tabs: {
        defaultProps: {
          variant: 'default',
          radius: 'xs',
        },
      },
    },
  },
};
