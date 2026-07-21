import { createTheme, DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';

// ── AgentSys 自定义色阶（基于 DESIGN_SPEC.md §3 色彩系统）──
//
// Mantine 要求 10 级色阶: [0..9]，0 最浅 9 最深。
// DESIGN_SPEC 定义:
//   Light: accent=#16A34A, accent-glow=#22C55E
//   Dark:  accent=#22C55E, accent-glow=#4ADE80

const agentGreen: [
  string, string, string, string, string,
  string, string, string, string, string,
] = [
  '#F0FDF4', // 0
  '#DCFCE7', // 1
  '#BBF7D0', // 2
  '#86EFAC', // 3
  '#4ADE80', // 4  — glow
  '#22C55E', // 5  — accent (dark)
  '#16A34A', // 6  — accent (light)
  '#15803D', // 7
  '#166534', // 8
  '#14532D', // 9
];

// ── 品牌扩展色 ──
const agentCyan: [
  string, string, string, string, string,
  string, string, string, string, string,
] = [
  '#ECFEFF', // 0
  '#CFFAFE', // 1
  '#A5F3FC', // 2
  '#67E8F9', // 3
  '#22D3EE', // 4  — cyan-glow
  '#06B6D4', // 5  — accent-cyan
  '#0891B2', // 6
  '#0E7490', // 7
  '#155E75', // 8
  '#164E63', // 9
];

/**
 * AgentSys 主题
 *
 * 对应 DESIGN_SPEC.md 的完整 Token 映射。
 * Mantine 未覆盖的特效（glow、glassmorphism、dot-grid）在 globals.css 或 CSS Module 中手写。
 */
export const theme = createTheme({
  // ── 主色 ──
  primaryColor: 'agentGreen',

  colors: {
    agentGreen,
    agentCyan,
  },

  // ── 字体 (DESIGN_SPEC §4) ──
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

  // ── 字号 (DESIGN_SPEC §4.2) ──
  fontSizes: {
    xs: '10.4px',
    sm: '12.8px',
    md: '14.4px',
    lg: '16px',
    xl: '18px',
  },

  // ── 圆角 (DESIGN_SPEC §6) ──
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },

  // ── 间距 (DESIGN_SPEC §5.2, 8px grid) ──
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
  },

  // ── 阴影 (DESIGN_SPEC §7.2, Light Theme) ──
  shadows: {
    xs: '0 1px 1px rgba(0,0,0,0.04)',
    sm: '0 1px 2px rgba(0,0,0,0.04)',
    md: '0 4px 12px rgba(0,0,0,0.06)',
    lg: '0 8px 24px rgba(0,0,0,0.08)',
    xl: '0 24px 80px rgba(0,0,0,0.5)',
  },

  // ── 默认圆角策略 ──
  defaultRadius: 'lg', // 16px — 卡片标准圆角

  // ── 组件级默认值 ──
  components: {
    // 卡片: 白底 + 1px subtle 边框 (DESIGN_SPEC §10.3)
    Card: {
      defaultProps: {
        radius: 'lg',
        padding: 'xl', // 24px — 标准卡片内边距
      },
    },

    // 按钮: pill 风格 (DESIGN_SPEC §10.9)
    Button: {
      defaultProps: {
        radius: 'xl',
      },
    },

    // 输入框: sm 圆角 (DESIGN_SPEC §8.1)
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

    // 表格表头: monospace (DESIGN_SPEC §10.5)
    Table: {
      defaultProps: {
        highlightOnHover: true,
        withTableBorder: false,
        withRowBorders: true,
      },
    },

    // Badge: monospace font (DESIGN_SPEC §10.6)
    Badge: {
      defaultProps: {
        ff: 'monospace',
        fw: 500,
      },
    },

    // Modal: 统一弹窗基准（AppModal 在此基础上扩展）
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

    // Tabs: 默认 pills 风格
    Tabs: {
      defaultProps: {
        variant: 'pills',
      },
    },
  },

  // ── Mantine 未知 Token 放入 other (供 CSS Module 或 runtime 引用) ──
  other: {
    // Glow 阴影
    glowGreen: '0 0 8px rgba(34,197,94,0.3)',
    glowCyan: '0 0 8px rgba(6,182,212,0.3)',
    glowAmber: '0 0 8px rgba(245,158,11,0.3)',
    glowRose: '0 0 8px rgba(244,63,94,0.3)',
    glowPurple: '0 0 8px rgba(168,85,247,0.3)',

    // 布局
    sidebarWidth: 240,
    topbarHeight: 64,
    contentMaxWidth: 1440,

    // 玻璃态
    glassBg: 'rgba(255,255,255,0.85)',
    glassBlur: 16,
  },

  // ── 暗色模式对应的 other (通过 DARK 前缀 CSS 变量实现) ──
  // Mantine v7 自动处理 primaryShade 等，这里只列自定义值
});

// 合并内置主题（保留 Mantine 内置色板如 red, yellow, gray）
export const mergedTheme = mergeMantineTheme(DEFAULT_THEME, theme);
