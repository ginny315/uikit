# AgentSys 设计规范文档 (Design Specification)

**版本**: 1.0  
**创建日期**: 2026-07-13  
**状态**: Draft  
**基于**: `web/index.html` (Landing Page · Dark), `web/dashboard.html` (Dashboard · Light), Figma 设计文件 `mj0sOm7lwxopTANhRB20Z8`

---

## 目录

1. [设计原则](#1-设计原则)
2. [主题系统](#2-主题系统)
3. [色彩系统](#3-色彩系统)
4. [字体系统](#4-字体系统)
5. [间距与网格](#5-间距与网格)
6. [圆角系统](#6-圆角系统)
7. [阴影与光影](#7-阴影与光影)
8. [边框与分割线](#8-边框与分割线)
9. [布局模式](#9-布局模式)
10. [组件规范](#10-组件规范)
11. [图标规范](#11-图标规范)
12. [动画与过渡](#12-动画与过渡)
13. [响应式断点](#13-响应式断点)
14. [已知问题 & 建议](#14-已知问题--建议)

---

## 1. 设计原则

### 1.1 核心定位

AgentSys 定位为 **"Kubernetes for LLM Agents"**，面向开发者团队。设计应传达：

| 原则 | 描述 | 设计体现 |
|------|------|----------|
| **专业可信** | 开发者工具需要可靠、精准的气质 | 等宽字体用于数据/代码，清晰的信息层级 |
| **实时感知** | 系统状态一目了然 | 状态指示器（dot + glow），颜色编码优先级 |
| **高效操作** | 减少认知负担，快速定位关键信息 | 统计卡片置顶，表格信息密度适中 |
| **技术美学** | 现代开发者工具的视觉语言 | 微妙的点阵纹理、等宽字体点缀、代码窗口元素 |
| **一致性** | 全局统一的设计语言 | CSS 自定义属性驱动，相同的间距/圆角/字体基准 |

### 1.2 视觉参考

对标产品气质：**Vercel Dashboard** (干净) + **Grafana** (数据密集) + **Linear** (精致) + **Kubernetes Dashboard** (操作感)

---

## 2. 主题系统

### 2.1 双主题策略（有意为之）

AgentSys 采用 **两个独立主题**，分别服务于不同场景：

| 场景 | 主题 | 文件 | 设计意图 |
|------|------|------|----------|
| Landing Page (营销页) | **Dark** | `web/index.html` | 科技感、视觉冲击、氛围营造 |
| Dashboard (产品系统) | **Light** | `web/dashboard.html` | 专业、高效、长时间使用不疲劳 |

这是一条成熟产品的常见策略（参考 Linear、Vercel、Stripe 等），**不是需要修复的问题**。Landing 负责吸引和印象，Dashboard 负责清晰和效率。

### 2.2 Dashboard 内主题切换（未来）

Dashboard 作为实际使用的产品，后续可支持 Dark/Light 切换，通过 CSS 变量驱动：

```css
/* 默认 Light（Dashboard 主用） */
:root { /* Light tokens */ }

/* 用户手动切 Dark */
[data-theme="dark"] { /* Dark tokens */ }

/* 跟随系统偏好 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* Dark tokens */ }
}
```

存储用户偏好到 `localStorage`，key: `agentsys-theme`。

---

## 3. 色彩系统

### 3.1 Dark Theme（Landing Page 风格）

```
背景层级 (由深到浅):
  --bg-deep:       #060912    ← 页面最底层，用于 body
  --bg-primary:    #0A0E1A    ← 主内容区背景
  --bg-surface:    #111827    ← 面板、容器（sidebar, card group）
  --bg-card:       #151B2A    ← 卡片、表格行
  --bg-card-hover: #1A2340    ← 卡片悬停

文字层级:
  --text-primary:   #F1F5F9   ← 标题、核心内容
  --text-secondary: #94A3B8   ← 描述文字、次要信息
  --text-muted:     #64748B   ← 辅助信息、占位符、时间戳

边框:
  --border-subtle:  rgba(255,255,255,0.06)  ← 卡片内分割线
  --border-default: rgba(255,255,255,0.10)  ← 卡片/面板边框
  --border-active:  rgba(34,197,94,0.25)    ← 聚焦态、选中态

品牌色:
  --accent:         #22C55E    ← 主色（绿）- 成功、运行中、CTA
  --accent-glow:    #4ADE80    ← 发光态 / hover 高亮
  --accent-cyan:    #06B6D4    ← 信息、链接、中性指标
  --accent-cyan-glow: #22D3EE ← 青色发光
  --accent-purple:  #A855F7    ← 高级功能、品牌点缀
  --accent-amber:   #F59E0B    ← 警告、中等优先级
  --accent-rose:    #F43F5E    ← 错误、危险、紧急

语义色 (状态):
  --status-success:  #22C55E
  --status-running:  #06B6D4
  --status-warning:  #F59E0B
  --status-error:    #F43F5E
  --status-queued:   #94A3B8

渐变:
  --gradient-brand:   linear-gradient(135deg, #22C55E 0%, #06B6D4 100%)
  --gradient-text:    linear-gradient(168deg, #4ADE80 0%, #22D3EE 100%)
  --gradient-card:    linear-gradient(147deg, rgba(34,197,94,0.2) 0%, rgba(6,182,212,0.2) 30%, transparent 60%)

半透明面板:
  --glass-nav-bg:    rgba(17,24,39,0.75)     ← 导航栏毛玻璃背景
  --glass-blur:      16px
```

### 3.2 Light Theme（Dashboard 风格）

```
背景层级:
  --bg-deep:       #F8F9FB    ← 页面最底层
  --bg-primary:    #FFFFFF    ← 主内容区
  --bg-surface:    #F1F3F7    ← 面板、队列项
  --bg-card:       #FFFFFF    ← 卡片
  --bg-card-hover: #F4F6FA    ← 卡片悬停
  --bg-sidebar:    #FAFBFC    ← 侧边栏专用

文字层级:
  --text-primary:   #0F172A
  --text-secondary: #475569
  --text-muted:     #94A3B8

边框:
  --border-subtle:  rgba(0,0,0,0.06)
  --border-default: rgba(0,0,0,0.10)
  --border-active:  rgba(22,163,74,0.35)    ← Light 模式绿色更深

品牌色 (Light 模式下略深以保证对比度):
  --accent:         #16A34A
  --accent-glow:    #22C55E
  --accent-cyan:    #0891B2
  --accent-cyan-glow: #06B6D4
  --accent-purple:  #9333EA
  --accent-amber:   #D97706
  --accent-rose:    #E11D48
  --accent-blue:    #2563EB

半透明面板:
  --glass-topbar-bg:    rgba(255,255,255,0.85)
  --glass-blur:         16px
```

### 3.3 调色板使用规则

| 用途 | 主色 | 辅助 |
|------|------|------|
| CTA 按钮、成功状态、运行中指示器 | `--accent` (绿) | `--accent-glow` |
| 链接、信息提示、中性指标 | `--accent-cyan` | `--accent-cyan-glow` |
| 品牌渐变、Logo、特色功能高亮 | `--accent` + `--accent-cyan` | `--accent-purple` |
| 警告态、中优先级、成本相关 | `--accent-amber` | — |
| 错误态、紧急、删除操作 | `--accent-rose` | — |
| 背景氛围光晕 (orb) | 绿/青/紫，opacity 0.06-0.12 | — |

---

## 4. 字体系统

### 4.1 字体家族

```
品牌/标题:  'Space Grotesk', sans-serif
正文:       'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif
代码/数据:  'JetBrains Mono', 'Fira Code', monospace
```

### 4.2 字号层级

```
Hero 大标题:   58.7px  / line-height 1.1   / weight 700 / tracking -0.02em   (仅 Landing)
H1 页面标题:   28px    / line-height 1.3   / weight 600
H2 Section:     22px    / line-height 1.3   / weight 600
H3 卡片标题:   18px    / line-height 1.4   / weight 600
H4 小标题:     16px    / line-height 1.4   / weight 600

正文大:        17.6px  / line-height 1.7   / weight 400    (Landing 描述)
正文标准:      14.4px  / line-height 1.6   / weight 400-500
正文小:        12.8px  / line-height 1.6   / weight 400     (卡片标签)

代码大:        13.12px / line-height 1.8   / weight 400     (终端)
代码标准:      12px    / line-height 1.6   / weight 400
代码小:        10.4px  / line-height 1.5   / weight 500     (表格头、sidebar label)

统计数字:      28.8px  / line-height 1     / weight 700     (stat card value)
```

### 4.3 字体使用规则

| 元素 | 字体 | 字重 | 说明 |
|------|------|------|------|
| 页面标题 (h1, h2) | Space Grotesk | 600 | 品牌感 |
| 卡片标题 | Space Grotesk | 600 | 微妙的品牌渗透 |
| 正文段落 | DM Sans | 400-500 | 高可读性 |
| 导航项、按钮 | DM Sans | 500 | 清晰易读 |
| 代码片段、CLI | JetBrains Mono | 400 | 终端感 |
| 数据表格内容 | DM Sans | 400 | 可读性优先 |
| 表格头、统计数字 | JetBrains Mono | 500-700 | 数据感、对齐 |
| Sidebar Section Label | JetBrains Mono | 500 | uppercase, 小号, 分组感 |
| Badge、标签 | JetBrains Mono | 500 | 紧凑数据感 |

---

## 5. 间距与网格

### 5.1 基准

**8px 网格系统**，允许 4px 微调。

### 5.2 间距量表

```
--space-xs:   4px     ← icon 内边距、紧凑 gap
--space-sm:   8px     ← 元素间最小间距
--space-md:   12px    ← nav item gap, inline gap  
--space-lg:   16px    ← 标准元素间距
--space-xl:   20px    ← 卡片内 padding
--space-2xl:  24px    ← 卡片 padding (标准)
--space-3xl:  28px    ← 内容区 padding
--space-4xl:  32px    ← section 间小间距
--space-5xl:  40px    ← section 底部留白
--space-6xl:  80px    ← section 底部大留白 (Landing)
--space-7xl:  100px   ← section 顶部 (Landing)
--space-8xl:  140px   ← Hero 顶部 (Landing)
```

### 5.3 布局尺寸

```
--sidebar-width:    240px
--topbar-height:    64px
--content-max-width: 1440px
--container-max:    1280px   ← Landing page 容器
```

---

## 6. 圆角系统

```
--radius-xs:   4px     ← chart bar top, 极小元素
--radius-sm:   8px     ← icon 容器, badge, 输入框, sidebar nav item
--radius-md:   12px    ← 中型卡片, 内部组件
--radius-lg:   16px    ← 标准卡片, 终端窗口, 面板, 图表卡片
--radius-xl:   24px    ← 导航栏, CTA 按钮, pill badge, 大容器
--radius-full: 9999px  ← 头像, 状态指示器圆点
```

### 圆角使用规则

| 组件 | 圆角 |
|------|------|
| 导航栏 (Nav) | `--radius-xl` (24px) — pill 风格 |
| 主按钮 (CTA) | `--radius-xl` (24px) — pill 风格 |
| 次按钮 (Outline) | `--radius-xl` (24px) |
| 卡片 (Card) | `--radius-lg` (16px) |
| 终端/代码窗口 | `--radius-lg` (16px) |
| 图表容器 | `--radius-lg` (16px) |
| 输入框、搜索框 | `--radius-sm` (8px) |
| Badge、Tag | `--radius-sm` (8px) 或 pill |
| 状态指示器 dot | `--radius-full` (圆形) |
| 头像 | `--radius-full` (圆形) |
| 图表 bar | `--radius-xs` (4px, 仅顶部) |
| Sidebar nav item | `--radius-sm` (8px) |
| Dropdown menu | `--radius-md` (12px) |

---

## 7. 阴影与光影

### 7.1 Dark Theme

```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.3)
--shadow-md:  0 4px 12px rgba(0,0,0,0.4)
--shadow-lg:  0 8px 24px rgba(0,0,0,0.5)
--shadow-xl:  0 24px 80px rgba(0,0,0,0.5)     ← 终端窗口

/* 发光阴影 (用于状态指示器) */
--glow-green:  0 0 8px rgba(34,197,94,0.3)
--glow-amber:  0 0 8px rgba(245,158,11,0.3)
--glow-rose:   0 0 8px rgba(244,63,94,0.3)
--glow-cyan:   0 0 8px rgba(6,182,212,0.3)
```

### 7.2 Light Theme

```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.04)
--shadow-md:  0 4px 12px rgba(0,0,0,0.06)
--shadow-lg:  0 8px 24px rgba(0,0,0,0.08)

/* Light 模式发光更收敛 */
--glow-green:  0 0 6px rgba(22,163,74,0.2)
--glow-amber:  0 0 6px rgba(217,119,6,0.2)
--glow-rose:   0 0 6px rgba(225,29,72,0.2)
--glow-cyan:   0 0 6px rgba(8,145,178,0.2)
```

### 7.3 使用规则

| 元素 | 阴影 |
|------|------|
| 固定导航栏 | `--shadow-sm` + backdrop-blur |
| 卡片 (默认) | 无阴影，仅边框 |
| 卡片 (hover) | `--shadow-lg` + translateY(-2px) |
| 弹出层/Dropdown | `--shadow-lg` |
| 终端/代码窗口 | `--shadow-xl` (Dark) / `--shadow-lg` (Light) |
| 状态指示器 | 对应颜色 glow (box-shadow) |

---

## 8. 边框与分割线

### 8.1 边框规格

所有组件边框统一: **1px solid**

| 场景 | Token |
|------|-------|
| 卡片/面板默认 | `--border-subtle` |
| 卡片 hover / 次要按钮 | `--border-default` |
| 聚焦态 / 选中态 | `--border-active` |
| 输入框默认 | `--border-default` |
| 输入框聚焦 | `--border-active` |

### 8.2 分割线

- **侧边栏分组**: 2px gap between nav items，section label 上方 `16px` padding-top
- **表格行**: `border-bottom: 1px solid var(--border-subtle)`，最后一行无边
- **卡片区域分割**: 依赖间距 (gap) 而非分割线

---

## 9. 布局模式

### 9.1 Dashboard 布局（应用内）

```
┌──────────────────────────────────────────────────────┐
│ Sidebar (240px, fixed)  │  Topbar (64px, fixed)      │
│                         ├─────────────────────────────┤
│ ┌─ Brand               │  Main Content               │
│ │─ Nav (overview)       │  ┌─────────┐ ┌───────────┐ │
│ │  Agent 管理      12   │  │ Stats   │ │ Stats     │ │
│ │  任务调度             │  │ Cards   │ │ Cards     │ │
│ │─ 工作流               │  └─────────┘ └───────────┘ │
│ │  日志追踪             │  ┌───────────┐ ┌─────────┐ │
│ │  成本管理             │  │ Chart     │ │ Chart   │ │
│ │─ 访问控制             │  └───────────┘ └─────────┘ │
│ │  Webhook              │  ┌──────┐ ┌──────────────┐ │
│ └─ Settings             │  │Queue │ │ Task Table   │ │
│                         │  └──────┘ └──────────────┘ │
│                         │  ┌─────────────────────────┐ │
│                         │  │ System Health           │ │
│                         │  └─────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### 9.2 Landing Page 布局

单列垂直滚动，全宽 Section，内容居中 `max-width: 1280px`。

### 9.3 网格系统

- **Stats Cards**: `grid-template-columns: repeat(4, 1fr)`, gap `18px`
- **Charts Row**: `grid-template-columns: 1fr 1fr`, gap `18px`
- **Queue + Tasks**: `grid-template-columns: 1fr 2fr`, gap `18px`
- **System Health**: `grid-template-columns: repeat(auto-fit, minmax(160px, 1fr))`, gap `12px`

---

## 10. 组件规范

### 10.1 侧边栏 (Sidebar)

| 属性 | 值 |
|------|-----|
| 宽度 | `240px` |
| 位置 | `fixed`, left: 0, height: 100vh |
| 背景 | `--bg-sidebar` (Light) / `--bg-surface` (Dark) |
| 右边框 | `1px solid var(--border-subtle)` |

**Section label**: JetBrains Mono, 10.4px, uppercase, `--text-muted`, letter-spacing 0.12em

**Nav item (默认)**:
- padding: 9px 12px, border-radius: 8px
- 文字: DM Sans 14px, `--text-secondary`
- hover: bg rgba(accent, 0.04), text → `--text-primary`

**Nav item (active)**:
- 文字: `--accent`, weight 600
- 背景: rgba(accent, 0.08)
- 左侧指示条: 3px × 18px, 圆角右侧, `--accent` 色, `position: absolute; left: 0`

**Badge**: JetBrains Mono 10.4px, pill 形状 (`radius: 10px`), rgba(rose, 0.15) 背景 + `--accent-rose` 文字

### 10.2 顶栏 (Topbar)

| 属性 | 值 |
|------|-----|
| 高度 | `64px` |
| 位置 | `fixed`, top: 0, left: `--sidebar-width` |
| 背景 | 半透明 + backdrop-blur(16px) |
| 底边框 | `1px solid var(--border-subtle)` |
| Padding | `0 28px` |

**搜索框**: 白底 + 1px border, 8px 圆角, 聚焦态 `--border-active`

**图标按钮**: 36×36px, 8px 圆角, 1px border subtle

**头像**: 30×30px circle, 渐变色背景, 文字首字母

### 10.3 统计卡片 (Stat Card)

| 属性 | 值 |
|------|-----|
| 背景 | `--bg-card` |
| 边框 | `1px solid var(--border-subtle)` |
| 圆角 | `--radius-lg` (16px) |
| Padding | `22px 24px` |
| Hover | border → `--border-active`, bg → `--bg-card-hover`, translateY(-2px), shadow-lg |

**结构**:
```
┌──────────────────────────┐
│ Label          Icon 32×32│
│                          │
│ Value (28.8px, bold)     │
│ Trend (12.5px)           │
└──────────────────────────┘
```

**Icon 容器**: 32×32px, 8px 圆角, 对应语义色 12% 透明度背景

### 10.4 图表卡片 (Chart Card)

| 属性 | 值 |
|------|-----|
| 背景 | `--bg-card` |
| 边框 | `1px solid var(--border-subtle)` |
| 圆角 | `--radius-lg` (16px) |
| Padding | `22px 24px` |

**Header**: 标题 (15.2px, weight 600) + 筛选下拉 (JetBrains Mono 11.2px)

**Bar Chart**: 8px 间距, max-width 48px 每列, 顶部圆角 6px, 渐变色填充

**Latency Bar**: 8px 高度, 4px 圆角, Label 50px 右对齐 + Track flex-1 + Count 40px

### 10.5 任务表格

| 属性 | 值 |
|------|-----|
| 表头 | JetBrains Mono 10.9px, uppercase, `--text-muted`, 底部边框 |
| 行 | 11px 12px padding, 底部 border subtle |
| Hover | bg rgba(0,0,0,0.03) (Light) / rgba(255,255,255,0.03) (Dark) |
| 最后一行 | 无底部边框 |

**列宽**: ID (mono) → Agent → 状态 → 优先级 (mono) → 耗时 (mono) → 时间

### 10.6 状态标识 (Status Badge)

```
--running:   bg rgba(cyan, 0.12)  + text accent-cyan    + dot
--succeeded: bg rgba(green, 0.12) + text accent          + dot
--failed:    bg rgba(rose, 0.12)  + text accent-rose     + dot
--queued:    bg rgba(amber, 0.12) + text accent-amber    + dot
```

Dot: 5px 圆形, `currentColor`. Badge: 12px padding, 12px 圆角.

### 10.7 队列项 (Queue Item)

- 背景: `--bg-surface`, 边框 subtle, 8px 圆角
- 优先级 dot: 8px 圆形 + 对应颜色 glow
- 左侧 dot, 中间 label, 右侧计数 (mono, bold)

### 10.8 系统健康卡 (Health Card)

- 水平排列, 12px gap, auto-fit 最小 160px
- 12px 圆角, 16px 18px padding
- 指示器: 10px 圆形 + glow
- 名称: JetBrains Mono 13px
- Meta: 11.5px, `--text-muted`

### 10.9 按钮

**主按钮 (Primary/CTA)**:
- 填充 `--accent`, 文字黑色
- 圆角 `--radius-xl` (24px)
- Padding: `12px 28px`
- 字体: Space Grotesk, weight 600, 14.4px

**次按钮 (Secondary/Outline)**:
- 透明底 + `--border-default`
- 文字 `--text-primary`
- 其余同主按钮

**文字按钮 (Link)**:
- 无背景无边框
- 文字 `--accent`, hover `--accent-glow`

### 10.10 导航栏 (Landing)

- 背景: `rgba(17,24,39,0.75)` + `backdrop-blur(16px)` (Dark Glassmorphism)
- 圆角: `--radius-xl` (24px)
- 边框: `1px solid rgba(255,255,255,0.1)`
- Padding: `13px 25px`

---

## 11. 图标规范

- **来源**: 内联 SVG（当前原型方案），后续考虑 Lucide Icons 或 Phosphor Icons
- **尺寸**: 
  - 导航 icon: `18px` × `18px`, 容器 `20px` × `20px`
  - 按钮 icon: `18px` × `18px`
  - 卡片 icon: `16px` × `16px`, 容器 `32px` × `32px`
- **描边**: `stroke-width: 2` or `2.2`, `stroke-linecap: round`
- **颜色**: 继承 `currentColor`

---

## 12. 动画与过渡

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)   ← hover 微交互
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1)   ← 展开/切换
--transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1)   ← 页面过渡
```

### 使用规则

| 场景 | 时长 | 说明 |
|------|------|------|
| nav-item hover, button hover | 150ms | 即时反馈 |
| card hover lift | 250ms | transform + shadow + border |
| sidebar open/close (mobile) | 250ms | transform slide |
| chart bar 加载 | 800ms | 高度从 0 到目标 |
| dropdown 展开 | 150ms | opacity + translateY |
| 页面路由切换 | 250ms | 淡入淡出 |

### 场景效果

**Landing Page**:
- Reveal-on-scroll: IntersectionObserver, `opacity 0→1` + `translateY(30px→0)`
- 背景 orb: CSS animation 缓慢漂浮 (`20s`, `ease-in-out`, `infinite alternate`)
- 终端光标闪烁: `@keyframes blink` (`1s step-end infinite`)

**Dashboard**:
- 卡片 hover: `translateY(-2px)` + border 变 active + shadow-lg
- 图表 bar hover: `filter: brightness(1.3)`
- Nav item 选中: 左侧指示条淡入

---

## 13. 响应式断点

```
≥ 1280px   完整 4 列 stats，2 列 charts，sidebar 可见
960-1280px 2 列 stats，1 列 charts，sidebar 可见
640-960px  2 列 stats，sidebar 隐藏（抽屉式），显示 hamburger
< 640px    1 列 stats，搜索框隐藏，用户名隐藏，padding 减小
```

---

## 14. 已知问题 & 建议

### 14.1 ✅ 双主题策略（已确认）

**确认**: Landing Page (Dark) 和 Dashboard (Light) 使用不同主题是 **有意为之** 的设计决策。Landing 是营销页，需要视觉冲击力；Dashboard 是日常使用的工具，需要清晰高效。这是 Linear、Vercel、Stripe 等产品的成熟做法，**无需修改**。

**后续**: Dashboard 内部可在未来支持 Dark/Light 切换供用户选择，但 Landing Page 保持 Dark 不变。

### 14.2 ⚠️ Figma 设计不完整

**问题**: Figma 中只有 Landing Page Hero 区域有实质设计，中间 4 个 Section 和 Dashboard 页面都未在 Figma 中实现。

**建议**:
1. 将 `dashboard.html` 中的组件反向导入 Figma（通过 `generate_figma_design`）
2. 补充 Landing Page 中间的功能展示 Section
3. 在 Figma 中建立完整的 Component Library（按钮、卡片、表格、图表、输入框等）

### 14.3 ⚠️ 原型代码为静态 HTML

**问题**: 当前所有页面为单一 HTML 文件，CSS 和 JS 内嵌，不可复用组件。

**建议**: 正式开发时采用 React + TypeScript + Tailwind CSS + shadcn/ui 架构（已在 `DESIGN.md` 中规划），将本规范中的 Design Token 映射为 Tailwind 配置。

### 14.4 UI Kit 组件库

`web/ui-kit.html` 是本规范的参考实现，包含所有基础 UI 组件的完整状态展示。支持 Light/Dark 双主题切换。应作为正式开发前的前端原型基准。

已覆盖组件: Input, Textarea, Select, Checkbox, Radio, Toggle, Date/Color Picker, Slider, File Upload, Form Group/Layout, Breadcrumb, Tabs, Pagination, Steps, Tooltip, Toast, Modal, Dropdown Menu, Progress Bar, Skeleton, Empty State, Status Indicator, Table, Search Box, Avatar, Chip/Tag, Badge, Kbd, Divider, Card, Button

### 14.5 后续待补充

- [ ] 暗色模式 Dashboard 的设计验证
- [x] Loading / Skeleton / Empty State 状态 (已在 ui-kit.html 中实现)
- [x] Toast 通知组件 (已在 ui-kit.html 中实现)
- [x] Modal / Drawer 组件 (已在 ui-kit.html 中实现)
- [x] 分页组件 (已在 ui-kit.html 中实现)
- [ ] 图表 Tooltip
- [ ] 移动端完整适配
- [ ] 可访问性 (a11y) 审查

---

## 附录 A: CSS 变量汇总

以下为建议的统一 Design Token（Dark 主题作为默认，通过 `[data-theme]` 切换）:

```css
:root {
  /* ── 背景 ── */
  --bg-deep: #060912;
  --bg-primary: #0A0E1A;
  --bg-surface: #111827;
  --bg-card: #151B2A;
  --bg-card-hover: #1A2340;
  --bg-sidebar: #0D1320;

  /* ── 文字 ── */
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;

  /* ── 边框 ── */
  --border-subtle: rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.10);
  --border-active: rgba(34,197,94,0.25);

  /* ── 品牌色 ── */
  --accent: #22C55E;
  --accent-glow: #4ADE80;
  --accent-cyan: #06B6D4;
  --accent-cyan-glow: #22D3EE;
  --accent-purple: #A855F7;
  --accent-amber: #F59E0B;
  --accent-rose: #F43F5E;
  --accent-blue: #3B82F6;

  /* ── 圆角 ── */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* ── 阴影 ── */
  --shadow-xs: 0 1px 1px rgba(0,0,0,0.2);
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);
  --shadow-xl: 0 24px 80px rgba(0,0,0,0.5);

  /* ── 发光 (状态指示器) ── */
  --glow-green:  0 0 8px rgba(34,197,94,0.3);
  --glow-cyan:   0 0 8px rgba(6,182,212,0.3);
  --glow-amber:  0 0 8px rgba(245,158,11,0.3);
  --glow-rose:   0 0 8px rgba(244,63,94,0.3);
  --glow-purple: 0 0 8px rgba(168,85,247,0.3);

  /* ── 过渡 ── */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ── 布局 ── */
  --sidebar-width: 240px;
  --topbar-height: 64px;
  --content-max-width: 1440px;

  /* ── 字体 ── */
  --font-brand: 'Space Grotesk', sans-serif;
  --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

---

> 本规范基于现有原型 (`web/index.html`, `web/dashboard.html`) 和 Figma 设计文件 (`mj0sOm7lwxopTANhRB20Z8`) 逆向提取。正式开发前应与设计师对齐确认。
