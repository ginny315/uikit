# AgentSys 前端待办清单

**创建日期**: 2026-07-21
**状态**: P0 已完成（2026-07-21）
**关联文档**: [FRONTEND_PLAN.md](./FRONTEND_PLAN.md)（架构决策） · [PRD.md](./PRD.md)（功能优先级） · [DESIGN_SPEC.md](./DESIGN_SPEC.md)（视觉规范） · [TECH_DESIGN.md](./TECH_DESIGN.md)（API 契约）

---

## 1. 当前状态快照

| 维度 | 状态 | 说明 |
|------|------|------|
| 页面骨架 | ✅ 基本完成 | 12 个路由页面均已实现 UI |
| 生产构建 | ✅ 通过 | `npm run build` 零错误 |
| 数据层 | ✅ 已统一 | 所有页面走 `services/*` + React Query + MSW |
| 测试 | ❌ 无 | 无单元 / 组件 / E2E 测试 |
| CI | ❌ 无 | 无 GitHub Actions 门禁 |
| 后端联调 | ⏸ 等待后端 | `config.ts` 开关已预留，OpenAPI 未产出 |

**技术栈（实际）**: Vite + React 19 + TypeScript + Mantine v9 + React Query + MSW + ReactFlow + i18next

> 注意：根目录 `README.md` / `CLAUDE.md` 仍写「Pre-implementation + shadcn/ui」，与本仓库实际状态不符，需同步更新（见 §6）。

---

## 2. 已完成项（无需重复做）

- [x] Vite + React + TS 项目初始化
- [x] Mantine 主题映射（`src/theme.ts` + `globals.css`）
- [x] 环境开关（`src/config.ts`：auth / mock / realtime）
- [x] API 封装（`src/lib/api.ts`：Bearer token、错误分类、超时）
- [x] React Query 封装（`src/hooks/useApi.ts` + queryKey 工厂）
- [x] MSW 拦截层（`src/mocks/handlers.ts` + `data.ts`）
- [x] 路由 + 懒加载 + AuthGuard + ErrorBoundary
- [x] 布局框架（Sidebar + Topbar + AppLayout，含折叠 / 移动端 Drawer）
- [x] 国际化框架（zh-CN / en-US，13 个 namespace）
- [x] 登录页（Mock 凭据 + 真实 API 分支）
- [x] 共享组件：StatCard、StatusBadge、PriorityBadge、PageHeader、Select、ConfirmModal、QueueMonitor、SystemHealthCard、TimeRangePicker

---

## 3. 优先级定义

| 级别 | 含义 | 目标 |
|------|------|------|
| **P0** | 阻塞项 | 不修则无法 build / 联调 / 发布 |
| **P1** | MVP 闭环 | 前端可独立演示完整用户流程（Mock 或真实 API） |
| **P2** | 质量与体验 | 对齐 PRD 细节、可维护性、生产就绪 |
| **P3** | 增强 | PRD P2 功能、锦上添花 |

---

## 4. P0 — 阻塞项（立即处理）

### 4.1 修复 TypeScript 构建

当前 `npm run build` 失败，需逐项修复：

| 文件 | 问题 |
|------|------|
| `hooks/useApi.ts` | `queryKey` 参数类型应为 `readonly unknown[]`，兼容 `as const` 元组 |
| `pages/Costs/CostsPage.tsx` | 引用不存在的 `queryKeys.costs.all` |
| `pages/Settings/AccessSettingsPage.tsx` | users / apiKeys 共用同一 queryKey；readonly 类型报错 |
| `pages/Settings/WebhookSettingsPage.tsx` | readonly queryKey 类型报错 |
| `pages/Workflows/WorkflowEditorPage.tsx` | ReactFlow `Node.data` / `IsValidConnection` 类型不匹配 |
| `pages/Workflows/dagreLayout.ts` | @dagrejs/dagre Graph 泛型 API 变更 |
| `mocks/data.ts` | `WorkflowDetail` 缺少 `stepCount` 字段 |
| `mocks/handlers.ts` | 缺少 `WorkflowDetail` / `User` import；Task 创建类型不完整 |
| `components/shared/TimeRangePicker/TimeRangePicker.tsx` | DatePicker onChange 签名不匹配 |

**验收**: `npm run build` 零错误退出。

### 4.2 统一数据层（消除双轨 Mock）

目标：**所有页面只通过 `services/*` + React Query 取数**，MSW 作为唯一 Mock 数据源。

| 页面 | 当前 | 目标 |
|------|------|------|
| `DashboardPage` | 页面内硬编码常量 | `fetchDashboardMetrics` + `fetchQueueStatus` + `fetchSystemHealth` + 最近任务 API |
| `AgentListPage` | `useState(MOCK_AGENTS)` | `useApiQuery(queryKeys.agents.list())` + mutations |
| `AgentDetailPage` | 直引 `mocks/agents` + `mocks/tasks` | `fetchAgent(id)` + `fetchTasks({ agentId })` |
| `AgentCreatePage` | 表单提交未写 MSW | `createAgent()` mutation |
| `TaskListPage` | `useState(MOCK_TASKS)` | `fetchTasks` + `createTask` + `cancelTask` mutations |
| `TaskDetailPage` | 直引 `MOCK_TASKS` | `fetchTask(id)` + `fetchTaskTimeline(id)` |
| `LogsPage` | 直引 `MOCK_LOGS` | `searchLogs(params)` |
| `WorkflowListPage` | `useState(MOCK_WORKFLOW_SUMMARIES)` | `fetchWorkflows()` |
| `WorkflowEditorPage` | 直引 `mocks/workflows` | `fetchWorkflow(id)` + `updateWorkflow()` mutation |
| `AccessSettingsPage` | 审计日志本地 `MOCK_AUDIT` | 新增 MSW 端点 `GET /api/v1/audit-logs` |

**附带修复**:

- [ ] 去掉 `useApi` 中的 mock delay（MSW 已有 delay，避免双倍延迟）
- [ ] 补齐 `queryKeys`：`costs.all`、`users.apiKeys`、`audit.list` 等
- [ ] 删除或降级 `mocks/agents.ts`、`mocks/tasks.ts` 等为 re-export（仅测试/fixture 用）

**验收**: 关闭页面内所有 `MOCK_*` 直引；改 `config.mock.enabled` 即可切换 Mock / 真实 API。

### 4.3 修正认证逻辑

| 任务 | 说明 |
|------|------|
| 移除自动登录 | `authStore.initialize()` 不应在无 token 时自动写入 `MOCK_TOKEN` |
| 开发模式规范 | 本地免登录用 `config.auth.enabled = false`，而非绕过 AuthGuard |
| Token 读取一致 | `api.ts` 需同时读 localStorage 和 sessionStorage（与 authStore 对齐） |
| 401 处理 | API 返回 401 时清 token 并跳转 `/login` |

**验收**: `auth.enabled=true` 时，未登录用户访问 `/` 被重定向到登录页。

---

## 5. P1 — MVP 用户流程闭环

### 5.1 核心流程（Mock 层即可验收）

```
登录 → 创建 Agent → 提交任务 → 查看任务状态/时间线 → 查看日志 → Dashboard 指标更新
```

| # | 任务 | 页面 / 模块 |
|---|------|------------|
| 1 | Agent 创建成功后列表可见 | AgentCreate → AgentList |
| 2 | Agent 启停状态持久化到 MSW | AgentDetail |
| 3 | Agent 编辑（目前只有创建，详情页编辑入口待接通） | AgentDetail |
| 4 | Agent 删除后列表刷新 | AgentList |
| 5 | 任务提交 Modal 调用 `createTask` API | TaskList |
| 6 | 任务取消调用 `cancelTask` API | TaskList / TaskDetail |
| 7 | 任务详情时间线从 API 获取 | TaskDetail |
| 8 | Dashboard 指标 / 队列 / 健康状态从 API 获取 | Dashboard |
| 9 | Dashboard 最近任务列表从 API 获取 | Dashboard |
| 10 | 日志搜索 / 筛选 / 分页走 API | LogsPage |

### 5.2 工作流（P1 功能，已有 UI 骨架）

| # | 任务 |
|---|------|
| 1 | 工作流列表 CRUD（创建 / 删除 / 暂停）接 API |
| 2 | 编辑器保存 → MSW `PUT /api/v1/workflows/:id` |
| 3 | 编辑器加载 → MSW `GET /api/v1/workflows/:id`（替换 `getWorkflowDetail` 直引） |
| 4 | DAG 环检测 + 保存前校验（已有 `dagValidate.ts`，需与 save 流程整合） |
| 5 | NodeConfigPanel Agent 下拉从 `fetchAgents` 获取 |

### 5.3 设置模块（部分已完成）

| 模块 | 状态 | 待办 |
|------|------|------|
| 成本管理 | ✅ React Query | 修复 queryKeys；mutation invalidate |
| 权限 / API Key | ✅ React Query | 拆分 queryKey；审计日志接 API |
| Webhook | ✅ React Query | 修复 readonly 类型 |

### 5.4 实时数据

| 任务 | 说明 |
|------|------|
| 实现 `useRealtime` hook | 读取 `config.realtime.method` |
| Polling 模式 | Dashboard / TaskList 按 `pollingInterval` 自动 refetch |
| WebSocket 模式 | 预留 `wsUrl` 连接 + 事件 dispatch invalidate（后端就绪后启用） |

### 5.5 后端联调准备

| 任务 | 说明 |
|------|------|
| OpenAPI 对齐 | 与 `TECH_DESIGN.md` §4 API 设计对照，产出 `openapi.yaml` |
| 类型生成 | 引入 `openapi-typescript` 替换手写 `types/index.ts` |
| 环境变量 | `.env.development` / `.env.production` 注入 `VITE_API_BASE_URL` 等 |
| 联调文档 | 在本文档或 README 补充「Mock → 真实 API」切换步骤 |

---

## 6. P2 — 质量、体验、工程化

### 6.1 文档同步

- [ ] 更新根目录 `README.md`：加入 `frontend/` 目录、实际技术栈（Mantine v9）
- [ ] 更新 `CLAUDE.md`：阶段改为「前端原型 + 后端待建」
- [ ] 更新 `FRONTEND_PLAN.md` 状态，或标记为历史参考、以本文档为准
- [ ] 替换 `frontend/README.md`（当前为 Vite 默认模板）
- [ ] 修正 `DESIGN.md` → `TECH_DESIGN.md` 引用

### 6.2 CI / 质量门禁

- [ ] GitHub Actions：`npm ci` → `npm run lint` → `npm run build`
- [ ] `.gitignore` 加入 `frontend/dist/`
- [ ] Pre-commit 或 CI 阻止 TypeScript 错误合入

### 6.3 测试

| 层级 | 范围 | 工具建议 |
|------|------|---------|
| 单元测试 | `lib/format.ts`、`dagValidate.ts`、queryKeys | Vitest |
| 组件测试 | StatusBadge、StatCard、AuthGuard | Vitest + Testing Library |
| API 集成 | MSW handlers 覆盖 CRUD 流程 | Vitest |
| E2E | 登录 → 创建 Agent → 提交任务 | Playwright（P2 后期） |

### 6.4 国际化完善

- [ ] 清除硬编码中文（AgentDetail 通知、AccessSettings 角色名、WorkflowEditor aria-label 等）
- [ ] 统一日期 / 数字格式化走 `lib/format.ts` + i18n locale
- [ ] 补全 en-US 遗漏 key（与 zh-CN 对账）

### 6.5 设计规范对齐（DESIGN_SPEC）

| 项 | PRD / DESIGN_SPEC | 当前 | 待办 |
|----|-------------------|------|------|
| Agent 列表布局 | 卡片式 | 表格 | 评估是否改卡片或更新 PRD |
| 双主题 | Light Dashboard + Dark Landing | Dashboard 支持 Dark/Light 切换 | 验证 token 一致性 |
| 响应式 | 移动端可用 | Sidebar Drawer 已有 | 各页面表格 / 图表移动端验证 |
| 字体 | Space Grotesk + DM Sans + JetBrains Mono | theme.ts 已配置 | 确认加载与 fallback |

### 6.6 部署

- [ ] `frontend/Dockerfile`（nginx 静态托管）
- [ ] `nginx.conf`（SPA fallback、`/api` 反代）
- [ ] 与 `web/index.html` Landing 页的部署策略（同域 or 分离）

### 6.7 未使用的规划能力

- [ ] `@mantine/spotlight` 命令面板（全局搜索 / 快捷导航）
- [ ] `@mantine/charts` 替换 Dashboard 手写 CSS 柱状图
- [ ] ErrorBoundary 分级（页面级 vs 全局级）
- [ ] 配额错误（429 QUOTA_EXCEEDED）专用 UI（`ApiRequestError.isQuotaError` 已预留）

---

## 7. P3 — PRD 增强功能（有资源再做）

来源：[PRD.md §5.2](./PRD.md)

| 功能 | PRD 优先级 | 前端工作 |
|------|-----------|---------|
| Agent YAML 定义 | P0（表单 or YAML） | 增加 YAML 编辑器 Tab（Monaco / CodeMirror） |
| Agent 版本管理与回滚 | P1 | 详情页 Versions Tab |
| 批量提交任务 | P1 | TaskList 多选 + 批量 API |
| 定时任务 | P1 | 新页面或 TaskList 扩展 |
| 工作流条件分支 / 循环 | P2 | ReactFlow 新节点类型 |
| 工作流并行执行 | P1 | 编辑器 + 运行时状态展示 |
| 日志导出 | P2 | LogsPage 导出按钮 |
| 分布式追踪 | P2 | Trace 瀑布图页面 |
| 成本预测 / 优化建议 | P2 | CostsPage 扩展 |
| 第三方集成（Slack / DingTalk） | P2 | Settings 新 Tab |
| GitHub PR 触发 | P2 | Webhook 模板 / 集成向导 |

---

## 8. 页面级 Checklist

### Dashboard `/`

- [ ] 指标卡片接 API
- [ ] 吞吐量 / 延迟图表接 API（或 @mantine/charts）
- [ ] 队列监控接 API
- [ ] 系统健康卡片接 API
- [ ] 最近任务表接 API + 轮询刷新
- [ ] 时间范围筛选生效

### Agents `/agents`

- [ ] 列表接 React Query
- [ ] 搜索 / 排序 / 分页服务端 or MSW 一致
- [ ] 创建表单调用 API
- [ ] 详情页编辑配置
- [ ] 启停 / 删除 mutation
- [ ] （可选）卡片布局

### Tasks `/tasks`

- [ ] 列表接 React Query + 轮询
- [ ] 提交任务 Modal 接 API
- [ ] 取消任务接 API
- [ ] 筛选 / 分页
- [ ] 详情页时间线接 API
- [ ] 输入 / 输出展示

### Workflows `/workflows`

- [ ] 列表 CRUD 接 API
- [ ] 编辑器 load / save 接 API
- [ ] 修复 TS 构建错误
- [ ] 新建工作流流程

### Logs `/logs`

- [ ] 搜索 / 级别 / Agent / 时间范围筛选接 API
- [ ] 分页 or 无限滚动
- [ ] 结构化 fields 展示

### Costs `/costs`

- [ ] 修复 queryKeys.costs.all
- [ ] 成本报告切换 agent / user 维度
- [ ] 配额编辑 mutation
- [ ] 告警配置 mutation

### Settings

- [ ] Access：拆分 users / apiKeys queryKey
- [ ] Access：审计日志接 API
- [ ] Access：邀请用户（目前 UI 可能有入口但未接 API）
- [ ] Webhooks：CRUD + 测试 webhook

### Login `/login`

- [ ] 移除 authStore 自动登录后，登录流程端到端验证
- [ ] Remember me + sessionStorage 验证

---

## 9. 建议实施顺序

```
Week 1  P0  修复 build → 统一 queryKey 类型 → 修正 auth
Week 2  P0  数据层迁移（Agents + Tasks + Dashboard）
Week 3  P1  数据层迁移（Logs + Workflows + 审计日志）
Week 4  P1  useRealtime polling + MVP 流程验收
Week 5  P2  CI + 文档同步 + i18n 清理
Week 6  P2  测试 + Dockerfile + 联调准备（等后端）
```

---

## 10. MVP 验收标准（前端侧）

在 **Mock 模式** 或 **真实 API 模式** 下，以下流程可完整走通：

1. 登录（或 auth 关闭时直接进入）
2. 创建一个 Agent，在列表中看到
3. 对该 Agent 提交任务，在任务列表看到状态变化
4. 进入任务详情，看到执行时间线
5. 在日志页搜索到相关日志
6. Dashboard 指标与队列数据反映上述操作
7. `npm run build` 成功
8. 无页面内 `MOCK_*` 直引（数据全走 services 层）

---

## 11. 变更记录

| 日期 | 变更 |
|------|------|
| 2026-07-21 | P0 完成：修复 build、统一数据层、修正 auth、补齐 MSW 端点 |
| 2026-07-21 | 初版：基于代码审查创建，覆盖 build 错误、数据层双轨、PRD 差距 |
