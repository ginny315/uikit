# AgentSys Frontend

React 管理后台 — Agent 管理、任务调度、工作流编排、监控、日志、成本、权限设置。

## 技术栈

- Vite + React 19 + TypeScript
- Mantine v9（组件 + 主题）
- TanStack React Query（服务端状态）
- MSW（Mock Service Worker，开发期 Mock API）
- ReactFlow + dagre（工作流 DAG 编辑器）
- react-i18next（zh-CN / en-US）
- Zustand（auth 等客户端状态）

## 快速开始

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 生产构建（tsc + vite）
npm run lint     # oxlint
npm run preview  # 预览 dist/
```

## 环境开关

所有环境差异集中在 **`src/config.ts`**：

```ts
export const config = {
  auth:  { enabled: false },          // false = 免登录直通
  mock:  { enabled: true, delay: 300 }, // true = MSW 拦截 API
  api:   { baseUrl: 'http://localhost:8080' },
  realtime: { method: 'polling', pollingInterval: 3000 },
}
```

| 场景 | auth.enabled | mock.enabled |
|------|-------------|--------------|
| 本地开发（默认） | `false` | `true` |
| 后端联调 | `true` | `false` |
| 本地 + 登录测试 | `true` | `true` |

Mock 登录凭据：`admin` / `admin123`（仅 `mock.enabled=true` 时有效）。

## 目录结构

```
src/
├── config.ts           # 环境开关
├── theme.ts            # Mantine 主题（DESIGN_SPEC 映射）
├── App.tsx             # 路由
├── pages/              # 页面组件
├── components/         # 布局 + 共享组件
├── services/           # API 调用（所有页面通过这里取数）
├── hooks/useApi.ts     # React Query 封装 + queryKey 工厂
├── mocks/              # MSW handlers + 中心化 mock 数据
├── stores/             # Zustand（authStore 等）
├── types/              # 共享 TS 类型
└── i18n/               # 国际化
```

## 数据流约定

```
Page → useApiQuery / useApiMutation → services/*.ts → lib/api.ts → fetch
                                                          ↓
                                              MSW handlers（mock 模式）
```

**不要**在页面中直接 `import` `mocks/agents.ts` 等文件。

## 路由

| 路径 | 页面 |
|------|------|
| `/` | Dashboard |
| `/agents` | Agent 列表 |
| `/agents/create` | 创建 Agent |
| `/agents/:id` | Agent 详情 |
| `/tasks` | 任务列表 |
| `/tasks/:id` | 任务详情 |
| `/workflows` | 工作流列表 |
| `/workflows/:id` | 工作流编辑器 |
| `/logs` | 日志追踪 |
| `/costs` | 成本管理 |
| `/settings/access` | 权限 & API Key |
| `/settings/webhooks` | Webhook 配置 |
| `/login` | 登录 |

## 相关文档

- [docs/FRONTEND_BACKLOG.md](../docs/FRONTEND_BACKLOG.md) — 待办 & 进度（主文档）
- [docs/FRONTEND_PLAN.md](../docs/FRONTEND_PLAN.md) — 架构决策
- [docs/DESIGN_SPEC.md](../docs/DESIGN_SPEC.md) — 视觉规范
