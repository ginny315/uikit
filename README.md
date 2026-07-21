# AgentSys — Kubernetes for LLM Agents

开源 LLM Agent 管理平台，定义、部署、编排和监控 AI Agent 集群。

## 🔗 Figma 设计文件

| 文件 | 链接 |
|------|------|
| **Landing Page 设计稿** | [Figma Design](https://www.figma.com/design/mj0sOm7lwxopTANhRB20Z8?node-id=1-2) |
| **系统架构图 (FigJam)** | [Figma Board](https://www.figma.com/board/jDX9se4tz1zc1f8NtrpXgM) |

## 📁 项目结构

```
agentSys/
├── docs/                          # 产品 & 技术文档
│   ├── PRD.md                     # 产品需求文档
│   ├── TECH_DESIGN.md             # 技术设计文档
│   ├── DESIGN_SPEC.md             # 设计规范（token、组件、原则）
│   ├── FRONTEND_PLAN.md           # 前端架构决策（历史参考）
│   ├── FRONTEND_BACKLOG.md        # 前端待办 & 进度（以这个为准）
│   └── archive/
├── frontend/                      # React 管理后台（已实现 UI + MSW Mock）
│   ├── src/
│   │   ├── config.ts              # 环境开关（auth / mock / api）
│   │   ├── pages/                 # Dashboard、Agents、Tasks、Workflows…
│   │   ├── services/              # API 调用层
│   │   └── mocks/                 # MSW handlers + mock 数据
│   └── package.json
├── web/                           # 静态 HTML 原型 & 设计系统
│   ├── index.html                 # Landing Page — Dark 主题
│   ├── dashboard.html             # Dashboard 原型 — Light 主题
│   ├── design-system.html         # Dashboard 业务组件库
│   └── ui-kit.html                # 原子 UI 组件库
├── scripts/
├── output/
├── CLAUDE.md
└── README.md
```

## 🚀 快速启动

### 管理后台（React）

```bash
cd frontend
npm install
npm run dev
# 默认 http://localhost:5173
# Mock 模式：auth.enabled=false, mock.enabled=true（见 src/config.ts）
```

```bash
npm run build   # 生产构建
npm run lint    # Oxlint
```

### 静态原型 & 设计系统

```bash
cd web && python3 -m http.server 8088
# http://localhost:8088/index.html           → Landing Page
# http://localhost:8088/dashboard.html       → Dashboard 原型
# http://localhost:8088/design-system.html   → 业务组件
# http://localhost:8088/ui-kit.html          → 原子组件
```

## 🏗️ 当前进度（2026-07-21）

| 模块 | 状态 |
|------|------|
| 产品 & 技术文档 | ✅ |
| 静态 HTML 原型 / 设计系统 | ✅ |
| **React 管理后台** | ✅ UI 完成，MSW Mock 联调，**等待后端** |
| Go 后端微服务 | ❌ 未开始 |

前端 P0 已完成：统一数据层（services + React Query + MSW）、生产构建通过、auth 逻辑修正。详见 [docs/FRONTEND_BACKLOG.md](./docs/FRONTEND_BACKLOG.md)。

## 🎨 设计系统

| 文件 | 定位 |
|------|------|
| **`docs/DESIGN_SPEC.md`** | 设计规范文档 |
| **`web/design-system.html`** | Dashboard 业务组件 + Token 展示 |
| **`web/ui-kit.html`** | 23 类原子组件全状态展示 |
| **`frontend/src/theme.ts`** | DESIGN_SPEC → Mantine 主题映射 |

设计原则：Landing 用 Dark、Dashboard 用 Light；8px 网格；品牌色 `#16A34A` / `#22C55E`。

## 🏗️ 技术栈

| 层 | 技术 | 状态 |
|----|------|------|
| 后端 | Go 微服务 (gRPC + REST) | 规划中 |
| 前端 | Vite + React 19 + TypeScript + **Mantine v9** + React Query + MSW + ReactFlow + i18next | **已实现** |
| 数据 | PostgreSQL + Redis + ClickHouse | 规划中 |
| 部署 | Docker Compose → Kubernetes | 规划中 |
| 监控 | Prometheus + Grafana + Jaeger | 规划中 |

## 📖 文档

| 文档 | 说明 |
|------|------|
| [docs/PRD.md](./docs/PRD.md) | 产品需求 |
| [docs/TECH_DESIGN.md](./docs/TECH_DESIGN.md) | 技术设计（后端架构、API） |
| [docs/DESIGN_SPEC.md](./docs/DESIGN_SPEC.md) | 设计规范 |
| [docs/FRONTEND_PLAN.md](./docs/FRONTEND_PLAN.md) | 前端架构决策 |
| [docs/FRONTEND_BACKLOG.md](./docs/FRONTEND_BACKLOG.md) | 前端待办 & 进度 |
| [frontend/README.md](./frontend/README.md) | 前端开发指引 |
| [CLAUDE.md](./CLAUDE.md) | AI Agent 项目指引 |
