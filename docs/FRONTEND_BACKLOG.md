# AgentSys 前端待办清单

**最后更新**: 2026-07-21 · **P0 已完成**（commit `8db13c7`）
**关联**: [FRONTEND_PLAN.md](./FRONTEND_PLAN.md) · [PRD.md](./PRD.md) · [DESIGN_SPEC.md](./DESIGN_SPEC.md) · [TECH_DESIGN.md](./TECH_DESIGN.md)

---

## 当前状态

| 维度 | 状态 |
|------|------|
| 12 个路由页面 UI | ✅ |
| 数据层（services + React Query + MSW） | ✅ |
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

---

## P1 — 下一步（MVP 闭环）

### 功能缺口

- [ ] **Agent 编辑**：详情页「编辑」仍跳转 create 页，需接通 `updateAgent` 或独立编辑表单
- [ ] **任务重试**：TaskDetail 重试按钮仅 toast，需接 API
- [ ] **邀请用户**：Access 页如有入口，接 MSW/API
- [ ] **Dashboard 图表**：吞吐量 / 延迟仍为静态 CSS，接 API 或 `@mantine/charts`
- [ ] **登录流程验收**：`auth.enabled=true` 下端到端（含 Remember me）

### 实时数据

- [ ] 实现 `useRealtime` hook（读 `config.realtime`）
- [ ] Polling：Dashboard / TaskList 按 `pollingInterval` 自动 refetch
- [ ] WebSocket：预留 `wsUrl` + invalidate（后端就绪后）

### 后端联调准备

- [ ] 产出 `openapi.yaml`（对照 TECH_DESIGN §4）
- [ ] 引入 `openapi-typescript` 替换手写 `types/`
- [ ] `.env` 注入 `VITE_API_BASE_URL`，`config.ts` 读取环境变量
- [ ] 清理遗留 `mocks/agents.ts` 等独立文件（改为 re-export 或删除）

---

## P2 — 质量 & 工程化

- [ ] GitHub Actions：`npm ci` → `lint` → `build`
- [ ] `.gitignore` 加入 `frontend/dist/`
- [ ] 测试：Vitest（format / dagValidate / MSW CRUD）；后期 Playwright E2E
- [ ] i18n：清除硬编码中文；en-US key 对账
- [ ] 部署：`frontend/Dockerfile` + nginx SPA fallback
- [ ] `@mantine/spotlight` 命令面板
- [ ] 配额错误 UI（`ApiRequestError.isQuotaError`）
- [ ] 设计对齐：Agent 卡片布局 vs 表格、移动端表格/图表验证

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
| `auth.enabled=true` 登录流程 | ⬜ |
| 真实 API 联调 | ⬜ 等后端 |

---

## 变更记录

| 日期 | 变更 |
|------|------|
| 2026-07-21 | 精简文档：P0 折叠，删除已完成 checklist |
| 2026-07-21 | P0 完成 + 文档同步 |
