# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Identity

AgentSys — an open-source LLM agent management platform positioned as "Kubernetes for LLM Agents." It orchestrates, schedules, monitors, and governs fleets of AI agents across teams.

**Current phase**: Pre-implementation (design & planning). No backend or frontend application code exists yet.

## Documentation Map

| File | Purpose | Audience |
|------|---------|----------|
| `docs/PRD.md` | Product requirements — personas, user stories, feature priorities (P0/P1/P2), success metrics, milestones | PMs, designers, devs |
| `docs/DESIGN.md` | Technical design — system architecture, Go microservice specs, data models, API design, security, deployment | Architects, backend devs |
| `docs/archive/llm-agent-manager-prd.md` | Original combined PRD+design doc — `PRD.md` and `DESIGN.md` were split from this. Read only for historical context. | — |
| `web/index.html` | Dark-themed landing/marketing page with terminal mockup | — |
| `web/dashboard.html` | Dashboard prototype (light theme) — stats cards, charts, task table, queue, system health | — |
| `docs/DESIGN_SPEC.md` | Design specification — design principles, color/type/spacing tokens, component specs, theme system | Designers, frontend devs |

**Always read `docs/PRD.md` and `docs/DESIGN.md` together** before making architectural decisions. PRD defines what and why; DESIGN defines how. Read `docs/DESIGN_SPEC.md` before any UI/frontend work.

## Planned Architecture

- **Backend**: Go microservices (Control, Scheduler, AgentRun, Coordinator, Auth, Metrics, Log, Webhook) communicating via gRPC, exposed through Nginx/Kong API gateway with REST + WebSocket
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui (not yet scaffolded)
- **Data stores**: PostgreSQL 16 (config, users, agents), Redis (task queues, instance state), ClickHouse (structured logs, time-series analytics)
- **Observability**: Prometheus metrics, OpenTelemetry tracing → Jaeger, Grafana dashboards
- **Deployment**: Docker Compose for MVP → Kubernetes for production
- **LLM abstraction**: Provider interface supporting Anthropic Claude, OpenAI GPT, and local models (Ollama/vLLM in Phase 2)

See `DESIGN.md` §1–§2 for full architecture diagrams and service interface definitions.

## Project Structure

```
agentSys/
├── docs/                   # Product & technical documentation
│   ├── PRD.md
│   ├── DESIGN.md
│   └── archive/
│       └── llm-agent-manager-prd.md
├── web/                    # Static HTML prototypes (served via `python3 -m http.server 8088`)
│   ├── index.html          # Dark-themed landing/marketing page
│   ├── agentsys_cn.html    # Chinese landing page variant
│   └── dashboard.html      # Dashboard prototype (light theme)
├── scripts/                # Utility scripts
│   ├── create_ppt.js
│   └── create_ppt_cn.js
├── output/                 # Generated assets
│   ├── AgentSys_PRD.pptx
│   └── AgentSys_PRD_CN.pptx
├── .mcp.json               # Figma MCP server config
├── package.json
└── package-lock.json
```

- `web/index.html` — Dark-themed landing page with embedded CSS (custom properties, dot-grid background, terminal mockup, reveal-on-scroll animations) and vanilla JS.
- `web/dashboard.html` — Dashboard prototype (light theme) with sidebar nav, stats cards, charts, task table, queue monitor, system health cards.
- `web/design-system.html` — Design system component library: tokens (colors, typography, spacing, radius, shadows) + dashboard-level components (stat cards, charts, queue, table, badges, health cards). Dark/light theme toggle.
- `web/ui-kit.html` — 🆕 Atomic form & UI component library: Input, Textarea, Select, Checkbox, Radio, Toggle, Date/Color Picker, Slider, File Upload, Form Groups, Breadcrumb, Tabs, Pagination, Steps, Tooltip, Toast, Modal, Dropdown Menu, Progress Bar, Skeleton, Empty State, Avatar, Chip/Tag, Badge, Kbd, Divider, Card, Buttons. Every component in all states (default, focus, error, disabled). Dark/light theme toggle.
- `.mcp.json` — Figma MCP server configured at `https://mcp.figma.com/mcp`.

## Figma Integration

The Figma MCP server is configured for bi-directional design↔code workflows. Before using `use_figma`, always load the `/figma-use` skill. Key Figma assets:
- Landing page design file: `mj0sOm7lwxopTANhRB20Z8` (team: `team::1642071958117568046`)
- Architecture diagram (FigJam): `jDX9se4tz1zc1f8NtrpXgM`
