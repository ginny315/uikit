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
│   ├── DESIGN_SPEC.md             # 设计规范文档（token、组件、原则）
│   └── archive/
│       └── llm-agent-manager-prd.md   # 原始合并版需求（仅历史参考）
├── web/                           # 静态 HTML 原型 & 设计系统
│   ├── index.html                 # Landing Page — Dark 主题营销页
│   ├── agentsys_cn.html           # Landing Page — 中文版
│   ├── dashboard.html             # Dashboard 原型 — Light 主题（完整页面）
│   ├── design-system.html         # 设计系统组件库 — Token 参考 + Dashboard 业务组件
│   └── ui-kit.html                # 基础 UI 组件库 — 23 类原子组件全状态展示
├── scripts/                       # 工具脚本
│   ├── create_ppt.js
│   └── create_ppt_cn.js
├── output/                        # 输出产物
│   ├── AgentSys_PRD.pptx
│   └── AgentSys_PRD_CN.pptx
├── CLAUDE.md                      # Claude Code 项目指引
├── .mcp.json                      # Figma MCP 连接配置
└── README.md                      # 本文件
```

## 🎨 设计系统 (2026-07-13)

基于 `dashboard.html` (Light) 和 `index.html` (Dark) 提取的完整设计系统，分为三层：

| 文件 | 定位 | 内容 |
|------|------|------|
| **`docs/DESIGN_SPEC.md`** | 📐 设计规范文档 | 14 章 — 原则、双主题策略、色彩、字体、间距、圆角、阴影、边框、布局、10 个组件规范、图标、动画、响应式断点、已知问题 |
| **`web/design-system.html`** | 🧩 Dashboard 业务组件 | Token 展示（色彩/字体/间距/圆角/阴影）+ Stat Cards、Charts(Bar+Latency)、Queue、Table、Status Badges、System Health、Navbar、Search、Buttons。Dark/Light 切换。 |
| **`web/ui-kit.html`** | ⚛️ 基础 UI 原子组件 | 23 类组件，全部覆盖 default/focus/error/disabled 状态：Input、Textarea、Select、Checkbox、Radio、Toggle、Date/Color Picker、Slider、File Upload、Form Group、Form Layout、Breadcrumb、Tabs、Pagination、Steps、Tooltip、Toast、Modal、Dropdown Menu、Progress Bar、Skeleton、Empty State、Avatar、Chip/Tag、Badge、Kbd、Divider、Card、Buttons。Dark/Light 切换。 |

### 启动设计系统

```bash
cd web && python3 -m http.server 8088
# 打开 http://localhost:8088/ui-kit.html        → 基础组件
# 打开 http://localhost:8088/design-system.html  → Dashboard 组件
# 打开 http://localhost:8088/dashboard.html       → 完整页面预览
# 打开 http://localhost:8088/index.html           → Landing Page
```

### 设计原则

- **双主题策略**: Landing Page 使用 Dark（营销冲击），Dashboard 使用 Light（长时间使用效率）
- **8px 网格**: 所有间距基于 8px 基准
- **CSS 变量驱动**: 全局 Token 通过 `:root` 自定义属性切换 Dark/Light
- **三字体体系**: Space Grotesk（品牌/标题）、DM Sans（正文）、JetBrains Mono（代码/数据）
- **品牌色**: 绿色系 `#16A34A` (Light) / `#22C55E` (Dark)

## 🏗️ 技术栈 (规划中)

| 层 | 技术 |
|----|------|
| 后端 | Go 微服务 (gRPC + REST) |
| 前端 | React + TypeScript + Tailwind CSS + shadcn/ui |
| 数据 | PostgreSQL + Redis + ClickHouse |
| 部署 | Docker Compose → Kubernetes |
| 监控 | Prometheus + Grafana + Jaeger |

## 📖 文档

- [**docs/PRD.md**](./docs/PRD.md) — 产品需求（给产品和设计看）
- [**docs/TECH_DESIGN.md**](./docs/TECH_DESIGN.md) — 技术设计（给开发看）
- [**docs/DESIGN_SPEC.md**](./docs/DESIGN_SPEC.md) — 设计规范（给设计和前端看）
- [**CLAUDE.md**](./CLAUDE.md) — AI Agent 项目指引
