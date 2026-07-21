# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Identity

AgentSys — an open-source LLM agent management platform positioned as "Kubernetes for LLM Agents." It orchestrates, schedules, monitors, and governs fleets of AI agents across teams.

**Current phase**: Frontend MVP prototype complete (React admin UI + MSW mock). Backend not started. Static HTML prototypes and design docs are in place.

## Documentation Map

| File | Purpose | Audience |
|------|---------|----------|
| `docs/PRD.md` | Product requirements — personas, user stories, feature priorities (P0/P1/P2), success metrics, milestones | PMs, designers, devs |
| `docs/TECH_DESIGN.md` | Technical design — system architecture, Go microservice specs, data models, API design, security, deployment | Architects, backend devs |
| `docs/DESIGN_SPEC.md` | Design specification — design principles, color/type/spacing tokens, component specs, theme system | Designers, frontend devs |
| `docs/FRONTEND_PLAN.md` | Frontend architecture decisions (Mantine, config.ts, session plan) | Frontend devs |
| `docs/FRONTEND_BACKLOG.md` | **Frontend progress & remaining tasks** — source of truth for frontend work | Frontend devs |
| `docs/archive/llm-agent-manager-prd.md` | Original combined PRD+design doc — read only for historical context | — |
| `web/index.html` | Dark-themed landing/marketing page with terminal mockup | — |
| `web/dashboard.html` | Dashboard prototype (light theme) — stats cards, charts, task table, queue, system health | — |

**Always read `docs/PRD.md` and `docs/TECH_DESIGN.md` together** before making architectural decisions. PRD defines what and why; TECH_DESIGN defines how. Read `docs/DESIGN_SPEC.md` before any UI/frontend work. For frontend task status, read `docs/FRONTEND_BACKLOG.md`.

## Architecture

- **Backend** (not implemented): Go microservices (Control, Scheduler, AgentRun, Coordinator, Auth, Metrics, Log, Webhook) via gRPC, exposed through Nginx/Kong with REST + WebSocket
- **Frontend** (implemented): Vite + React 19 + TypeScript + Mantine v9 + React Query + MSW + ReactFlow + i18next in `frontend/`
- **Data stores** (planned): PostgreSQL 16, Redis, ClickHouse
- **Observability** (planned): Prometheus, OpenTelemetry → Jaeger, Grafana
- **Deployment** (planned): Docker Compose for MVP → Kubernetes for production

See `docs/TECH_DESIGN.md` §1–§2 for full architecture diagrams and service interface definitions.

## Project Structure

```
agentSys/
├── docs/                   # Product & technical documentation
│   ├── PRD.md
│   ├── TECH_DESIGN.md
│   ├── DESIGN_SPEC.md
│   ├── FRONTEND_PLAN.md
│   ├── FRONTEND_BACKLOG.md
│   └── archive/
├── frontend/               # React admin dashboard (MSW mock, no backend yet)
│   └── src/
│       ├── config.ts       # auth / mock / api / realtime switches
│       ├── pages/          # Dashboard, Agents, Tasks, Workflows, Logs, Costs, Settings
│       ├── services/       # Typed API calls
│       ├── mocks/          # MSW handlers + centralized mock DB
│       └── hooks/useApi.ts # React Query wrapper + queryKey factory
├── web/                    # Static HTML prototypes (python3 -m http.server 8088)
│   ├── index.html
│   ├── dashboard.html
│   ├── design-system.html
│   └── ui-kit.html
├── scripts/
├── output/
├── .mcp.json
└── package.json
```

## Frontend Development

```bash
cd frontend && npm install && npm run dev
```

Environment switches in `frontend/src/config.ts`:

| Mode | auth.enabled | mock.enabled |
|------|-------------|--------------|
| Local dev (default) | `false` | `true` |
| Backend integration | `true` | `false` |
| Dev + login testing | `true` | `true` |

All pages fetch data via `services/*` + React Query; MSW intercepts in mock mode. Do not import `mocks/*.ts` directly from pages.

## Figma Integration

The Figma MCP server is configured for bi-directional design↔code workflows. Before using `use_figma`, always load the `/figma-use` skill. Key Figma assets:
- Landing page design file: `mj0sOm7lwxopTANhRB20Z8` (team: `team::1642071958117568046`)
- Architecture diagram (FigJam): `jDX9se4tz1zc1f8NtrpXgM`
