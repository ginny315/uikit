# AgentSys 前端待办清单

**最后更新**: 2026-07-22 · **P0 已完成**（commit `8db13c7`）· **P1 功能缺口已完成**
**关联**: [FRONTEND_PLAN.md](./FRONTEND_PLAN.md) · [PRD.md](./PRD.md) · [DESIGN_SPEC.md](./DESIGN_SPEC.md) · [TECH_DESIGN.md](./TECH_DESIGN.md)

---

## 当前状态

| 维度 | 状态 |
|------|------|
| 12 个路由页面 UI | ✅ |
| 数据层（services + React Query + MSW） | ✅ |
| P1 功能闭环（编辑/重试/邀请/图表/轮询/env） | ✅ |
| `npm run build` / `npm run lint` | ✅ |
| 测试 / CI | ❌ |
| 后端联调 | ⏸ 等待后端 + OpenAPI |

**技术栈**: Vite · React 19 · TS · Mantine v9 · React Query · MSW · ReactFlow · i18next

<details>
<summary>P0 已完成（点击展开）</summary>

- 修复 TypeScript 构建；统一 queryKey 类型
- 所有页面改走 `services/*` + React Query，移除页面内 `MOCK_*` 直引
- 修正 auth（移除自动登录、401 跳转、双 storage 读 token）；`config.auth.enabled=false` 为默认开发模式
- MSW 补齐：服务健康、审计日志；分页响应统一 `{ data, total, page, pageSize }`
- 文档同步：README / CLAUDE / FRONTEND_PLAN / frontend/README

</details>

<details>
<summary>P1 功能缺口已完成（点击展开）</summary>

- Agent 编辑：Create 页 `?edit=id` 模式，预填 + `updateAgent`
- 任务重试：`retryTask` service + MSW + TaskDetail 接线
- 用户邀请：邀请 Modal + `inviteUser` + MSW
- Dashboard 图表：吞吐量/延迟接 API（`/metrics/throughput`、`/metrics/latency`）
- `useRealtime` hook：Dashboard / TaskList 按 `config.realtime.pollingInterval` 轮询
- `.env` 注入 + `config.ts` 读取 `VITE_*` 环境变量
- 清理 legacy `mocks/agents.ts` 等 4 个 re-export 文件

</details>

---

## P1 — 剩余（MVP 闭环）

### 后端联调准备

- [ ] 产出 `openapi.yaml`（对照 TECH_DESIGN §4）
- [ ] 引入 `openapi-typescript` 替换手写 `types/`
- [ ] **登录流程验收**：`auth.enabled=true` 下端到端（含 Remember me）

### 实时数据（进阶）

- [ ] WebSocket：完善 `useRealtimeInvalidation` 消息协议（后端就绪后）

---

## P2 — 质量 & 工程化

| 项 | 状态 | 备注 |
|----|------|------|
| `.gitignore` 加入 `frontend/dist/` | ✅ | 根目录 `.gitignore` 第 21 行 |
| GitHub Actions：`npm ci` → `lint` → `build` | ❌ | 无 `.github/workflows/` |
| 测试：Vitest（format / dagValidate / MSW CRUD） | ❌ | 无 vitest 配置与 `*.test.ts`；`lib/format.ts`、`pages/Workflows/dagValidate.ts` 待覆盖 |
| Playwright E2E | ❌ | 后期 |
| i18n：页面 UI 走 `t()` + en-US / zh-CN key 对账 | ✅ | 26 个 locale 文件 key 一致 |
| 配额错误 UI（`ApiRequestError.isQuotaError`） | ❌ | `lib/api.ts` 已定义 getter，无 UI 处理 |

**待办 checklist（按优先级）**

- [ ] GitHub Actions：`npm ci` → `lint` → `build`
- [x] `.gitignore` 加入 `frontend/dist/`
- [x] i18n：页面 UI 走 `t()` + en-US / zh-CN key 对账
- [ ] 测试：Vitest（format / dagValidate / MSW CRUD）；后期 Playwright E2E
- [ ] 配额错误 UI（`ApiRequestError.isQuotaError`）

---

## P3 — PRD 增强（有资源再做）

| 功能 | 前端工作 |
|------|---------|
| Agent YAML 定义 | YAML 编辑器 Tab |
| Agent 版本管理 | 详情页 Versions Tab |
| 批量 / 定时任务 | TaskList 扩展 |
| 工作流条件分支 / 循环 | ReactFlow 新节点类型 |
| 日志导出 / 分布式追踪 | Logs / Trace 页 |
| 第三方集成 / GitHub PR | Settings 扩展 |

完整列表见 [PRD.md §5.2](./PRD.md)。

---

## MVP 验收（前端侧）

| 项 | 状态 |
|----|------|
| Mock 模式下完整用户流程（Agent → Task → 日志 → Dashboard） | ✅ |
| `npm run build` 成功 | ✅ |
| 数据全走 services 层 | ✅ |
| Agent 编辑 / 任务重试 / 用户邀请 | ✅ |
| Dashboard 实时轮询 + API 图表 | ✅ |
| `auth.enabled=true` 登录流程 | ⬜ |
| 真实 API 联调 | ⬜ 等后端 |

---

## 变更记录

| 日期 | 变更 |
|------|------|
| 2026-07-22 | P2 工程化盘点：`.gitignore`、i18n 标记完成；部署 / Spotlight / 设计对齐移出清单；其余 3 项待做（CI / 测试 / 配额 UI） |
| 2026-07-21 | P1 功能缺口完成：编辑/重试/邀请/图表/useRealtime/env/清理 mocks |
| 2026-07-21 | 精简文档：P0 折叠，删除已完成 checklist |
| 2026-07-21 | P0 完成 + 文档同步 |
