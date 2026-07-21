# AgentSys 前端实现计划

**创建日期**: 2026-07-16
**最后更新**: 2026-07-21
**状态**: Session 1–11 已完成；P0 数据层统一已完成（详见 [FRONTEND_BACKLOG.md](./FRONTEND_BACKLOG.md)）
**决策者**: ginny

> **进度跟踪请以 [FRONTEND_BACKLOG.md](./FRONTEND_BACKLOG.md) 为准。** 本文件保留架构决策与 Session 划分，作为历史参考。

---

## 0. 核心决策

| 决策点 | 结论 | 原因 |
|--------|------|------|
| 组件库 | **Mantine v9** | 一人团队，需要组件完整度高、开箱即用，避免自研 Table/Select/DatePicker 等行为的 Bug 风险 |
| 样式方案 | **纯 Mantine theme，不用 Tailwind** | 集中式主题保证一致性；Mantine style props 覆盖大部分需求 |
| CSS 类型 | CSS Modules + Mantine styles API | 模块化、无冲突、主题变量可访问 |
| 工作模式 | **一次会话一个模块** | Context 有限，分治推进；git commit 作为跨会话持久记忆 |
| 环境控制 | **`src/config.ts` 集中开关** | 一行改 auth/mock/realtime 三类开关，零重构联调 |

---

## 1. 技术栈

```
Vite + React 19 + TypeScript
Mantine v9                — 组件 (100+) + 主题 + hooks (50+)
@mantine/form + zod       — 表单 + 校验
@mantine/charts           — 图表 (Recharts 封装)
@mantine/notifications    — 通知系统
@mantine/spotlight        — 命令面板（已安装，待接入）
@tanstack/react-query     — 异步状态管理
zustand                   — 客户端状态 (auth, theme, filters)
React Router v7           — 路由
ReactFlow                 — 工作流 DAG 编辑器
MSW (Mock Service Worker) — Mock 数据（已接入全部页面）
i18next                   — 国际化 (zh-CN / en-US)
```

---

## 2. 环境配置开关 `src/config.ts`

所有环境差异集中控制，一个文件改开关，零重构联调：

```ts
export const config = {
  // 认证（联调时改为 true）
  auth: {
    enabled: false,
  },

  // API 基础配置
  api: {
    baseUrl: 'http://localhost:8080',
    timeout: 10000,
  },

  // Mock 数据（联调时 false）
  mock: {
    enabled: true,
    delay: 300,        // 模拟延迟 ms
    errorRate: 0,      // 模拟错误率 0-1
  },

  // 实时数据方案（轮询简单 → 后期换 WebSocket）
  realtime: {
    method: 'polling' as 'polling' | 'websocket',
    pollingInterval: 3000,   // polling 模式下的间隔 ms
    wsUrl: 'ws://localhost:8080/ws',
  },
} as const;
```

**三种模式联动**:

```
本地开发 Phase 1    →  auth.enabled=false, mock.enabled=true
后端就绪联调         →  auth.enabled=true,  mock.enabled=false
本地开发 + 登录测试  →  auth.enabled=true,  mock.enabled=true
```

所有 API 代码、路由守卫、实时数据 hook 都从 `config.ts` 读取，底层根据开关自动切换行为。

---

## 3. 目录结构

```
frontend/
├── Dockerfile                   # nginx 静态托管 (Phase 3)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.development
├── .env.production
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── config.ts                # 环境开关 (auth/api/mock/realtime)
    ├── theme.ts                 # Mantine createTheme — 全部 Design Token 映射
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx
    │   │   ├── Topbar.tsx
    │   │   └── AppLayout.tsx    # Sidebar + Topbar + <Outlet/>
    │   ├── shared/
    │   │   ├── StatCard/
    │   │   ├── StatusBadge/
    │   │   ├── TaskTable/
    │   │   ├── QueueMonitor/
    │   │   ├── SystemHealthCard/
    │   │   └── Timeline/
    │   └── guard/
    │       └── AuthGuard.tsx     # 路由守卫 (auth.enabled=false 时直通)
    ├── pages/
    │   ├── Login/               # 登录页 (auth.enabled 之后启用)
    │   ├── Dashboard/           # / 首页监控面板
    │   ├── Agents/              # /agents Agent CRUD
    │   ├── Tasks/               # /tasks 任务调度
    │   ├── Workflows/           # /workflows 工作流编辑器
    │   ├── Logs/                # /logs 日志追踪
    │   ├── Costs/               # /costs 成本管理
    │   └── Settings/            # /settings 权限 + Webhook
    ├── hooks/                   # useApi, useRealtime, useAuth...
    ├── lib/
    │   ├── api.ts               # fetch 封装 + auth 拦截 + 错误分类
    │   └── constants.ts
    ├── stores/                  # Zustand stores
    ├── mocks/                   # MSW handlers + fixtures
    ├── types/                   # 共享 TS 类型 (后端 OpenAPI 约定)
    └── styles/
        └── globals.css          # CSS 变量覆盖 + Mantine @layer 处理
```

---

## 4. Theme 映射 — DESIGN_SPEC → Mantine

### 4.1 色彩

| DESIGN_SPEC Token | Mantine Theme |
|-------------------|---------------|
| `--accent` (green) | `primaryColor: 'agentGreen'` |
| `--accent-cyan` | 自定义 color 数组 `agentCyan` |
| `--accent-rose` | Mantine 内置 `red` |
| `--accent-amber` | Mantine 内置 `yellow` |
| `--bg-primary` | `colors.body` |
| `--bg-card` | `colors.card` (需自定义) |
| `--text-primary` | `colors.text` |
| `--text-secondary` | `colors.dimmed` |

### 4.2 圆角 (1:1)

```ts
radius: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' }
```

### 4.3 字体

| 用途 | 配置 |
|------|------|
| 标题 | `headings.fontFamily: 'Space Grotesk, sans-serif'` |
| 正文 | `fontFamily: 'DM Sans, sans-serif'` |
| 代码/数据 | `fontFamilyMonospace: 'JetBrains Mono, monospace'` |

### 4.4 阴影

```ts
shadows: {
  sm: '0 1px 2px rgba(0,0,0,0.04)',
  md: '0 4px 12px rgba(0,0,0,0.06)',
  lg: '0 8px 24px rgba(0,0,0,0.08)',
}
```

### 4.5 特效（任何库都得手写）

| 效果 | 方式 |
|------|------|
| Glow 阴影 | CSS Module `box-shadow` |
| Glassmorphism | `backdrop-filter: blur()` |
| Sidebar 指示条 | `::before` 伪元素 |
| Mantine CSS Layers | `@layer` 包裹自定义样式 |

---

## 5. 样式方法论 (四层)

```
层级 1: style props      → <Box p="xl" bg="card" c="dimmed">
层级 2: styles API       → <Table styles={{ thead: {...} }}>
层级 3: className + CSS   → <Card className={classes.statCard}>
层级 4: CSS 变量全局覆写  → :root { --mantine-color-* }
```

---

## 6. 页面清单与路由

```
/                          Dashboard 首页 (P0)
/login                     Login (auth.enabled 后)
/agents                    Agent 列表 (P0)
/agents/create             Agent 创建 (P0)
/agents/:id                Agent 详情 + Tab (P0)
/tasks                    任务列表 (P0)
/tasks/:id                任务详情 + 时间线 (P0)
/workflows                 工作流列表 (P1)
/workflows/:id             工作流编辑器 (P1)
/logs                      日志追踪 (P0)
/costs                     成本管理 (P1)
/settings/access           权限管理 (P1)
/settings/webhooks         Webhook 配置 (P1)
```

---

## 7. 会话划分

| # | 会话 | 产出 | 预估 |
|---|------|------|------|
| **1** | **项目初始化 + 基础设施** | Vite + Mantine + theme + config.ts + api.ts + 路由骨架 + AuthGuard + ErrorBoundary + globals.css | 1-2h |
| 2 | 布局框架 | Sidebar + Topbar + AppLayout + 移动端 Drawer | 1-2h |
| 3 | Dashboard | StatCard、图表、QueueMonitor、SystemHealthCard | 2-3h |
| 4 | Agent 管理 | 列表 + 创建/编辑 + 详情(Tab) | 3-4h |
| 5 | 任务调度 | 表格排序分页 + 详情(Timeline) | 3-4h |
| 6 | 日志追踪 | 日志流 + 搜索筛选 | 2-3h |
| 7 | 工作流编辑器 | ReactFlow DAG (最大挑战) | 4-6h |
| 8 | 成本+权限+Webhook | 三模块一并完成 | 3-4h |
| 9 | MSW Mock | 全部 API handler + fixture | 2-3h |
| 10 | 双主题+响应式 | Dark/Light + 移动端 | 2-3h |
| 11 | 收尾 | a11y、性能、ErrorBoundary 完善、生产构建 | 2-3h |

---

## 8. Session 1 详细任务清单

```
[ ] 1. Vite + React + TS 初始化 (npm create vite)
[ ] 2. 安装全量依赖
[ ] 3. 清理 Vite 模板文件
[ ] 4. .env.development / .env.production
[ ] 5. src/config.ts — 环境开关
[ ] 6. src/theme.ts — Mantine createTheme (DESIGN_SPEC 全量映射)
[ ] 7. src/styles/globals.css — CSS 变量 + @layer mantine 处理
[ ] 8. src/types/ — 共享类型骨架 (Agent, Task, User...)
[ ] 9. src/lib/api.ts — fetch 封装 (auth 拦截 + 错误分类)
[ ] 10. src/lib/constants.ts
[ ] 11. src/stores/ — authStore, themeStore
[ ] 12. src/hooks/ — useApi (基于 React Query 封装)
[ ] 13. src/components/guard/AuthGuard.tsx
[ ] 14. src/components/guard/ErrorBoundary.tsx
[ ] 15. src/main.tsx — MantineProvider + QueryClient + Router
[ ] 16. src/App.tsx — 路由配置 (所有页面 placeholder)
[ ] 17. pages/ 目录 — 每页一个占位组件
[ ] 18. npm run dev 验证 →
[ ] 19. git commit "Session 1: 项目初始化 + 基础设施"
```

---

## 9. 风险与缓解

| 风险 | 缓解 |
|------|------|
| Mantine 样式与 DESIGN_SPEC 细节偏差 | 分层修复：先页面结构，后 CSS Module 精修 |
| ReactFlow 定制复杂 | P1 功能，P0 完成后再做 |
| Mantine v7 CSS Layers 覆盖问题 | globals.css 提前用 @layer 处理 |
| Mock 数据不够真 | 用 faker 或手写 generator，100+ 条 + 状态组合 |
| 后端类型对不上 | 前端手写 types/ 并约定后端后续提供 OpenAPI JSON |

---

> 本文件随开发进度更新。Session 1 开始于 2026-07-16。
