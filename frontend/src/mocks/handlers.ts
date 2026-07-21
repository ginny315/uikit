/**
 * MSW Request Handlers
 *
 * 拦截所有 API 请求并返回中心化 mock 数据。
 * Session 9: 统一 mock 数据层，页面迁移期间与旧 MOCK_* 导入并存。
 */

import { http, HttpResponse, delay } from 'msw';
import { config } from '../config';
import type { WorkflowSummary, Webhook } from '../types';
import {
  dbAgents,
  dbTasks,
  dbLogs,
  dbWorkflowSummaries,
  dbWorkflowDetails,
  deriveTimeline,
  dbUsers,
  dbApiKeys,
  dbWebhooks,
  dbDashboardMetrics,
  dbSystemHealth,
} from './data';

const BASE = config.api.baseUrl; // http://localhost:8080

// 模拟网络延迟
async function mockDelay(): Promise<void> {
  if (config.mock.enabled && config.mock.delay > 0) {
    await delay(config.mock.delay);
  }
}

export const handlers = [
  // ═══════════════════════════════════════════════════════════
  // Dashboard
  // ═══════════════════════════════════════════════════════════
  http.get(`${BASE}/api/v1/metrics/dashboard`, async () => {
    await mockDelay();
    return HttpResponse.json(dbDashboardMetrics);
  }),
  http.get(`${BASE}/api/v1/metrics/queue`, async () => {
    await mockDelay();
    return HttpResponse.json({
      high: dbDashboardMetrics.queueHigh,
      medium: dbDashboardMetrics.queueMedium,
      low: dbDashboardMetrics.queueLow,
    });
  }),
  http.get(`${BASE}/api/v1/metrics/health`, async () => {
    await mockDelay();
    return HttpResponse.json(dbSystemHealth);
  }),

  // ═══════════════════════════════════════════════════════════
  // Agents
  // ═══════════════════════════════════════════════════════════
  http.get(`${BASE}/api/v1/agents`, async ({ request }) => {
    await mockDelay();
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const status = url.searchParams.get('status');
    const sort = url.searchParams.get('sort');
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    let filtered = [...dbAgents];
    if (search) {
      filtered = filtered.filter((a) => a.name.toLowerCase().includes(search) || a.description.toLowerCase().includes(search));
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((a) => a.status === status);
    }
    if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'tasks') filtered.sort((a, b) => b.todayTasks - a.todayTasks);
    if (sort === 'tokens') filtered.sort((a, b) => b.todayTokens - a.todayTokens);

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ items, total, page, pageSize });
  }),

  http.get(`${BASE}/api/v1/agents/:id`, async ({ params }) => {
    await mockDelay();
    const agent = dbAgents.find((a) => a.id === params.id);
    if (!agent) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(agent);
  }),

  http.post(`${BASE}/api/v1/agents`, async ({ request }) => {
    await mockDelay();
    const body = (await request.json()) as Record<string, unknown>;
    const newAgent = {
      id: String(Date.now()),
      name: body.name as string,
      description: (body.description as string) ?? '',
      status: 'stopped' as const,
      llmProvider: (body.llmProvider as string) ?? 'Anthropic',
      llmModel: (body.llmModel as string) ?? 'Claude Sonnet 4.5',
      tools: (body.tools as string[]) ?? [],
      dailyTokenQuota: (body.dailyTokenQuota as number) ?? 100000,
      todayTokens: 0,
      todayTasks: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    dbAgents.unshift(newAgent);
    return HttpResponse.json(newAgent, { status: 201 });
  }),

  http.put(`${BASE}/api/v1/agents/:id`, async ({ params, request }) => {
    await mockDelay();
    const idx = dbAgents.findIndex((a) => a.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    dbAgents[idx] = { ...dbAgents[idx], ...body, updatedAt: new Date().toISOString().split('T')[0] } as typeof dbAgents[number];
    return HttpResponse.json(dbAgents[idx]);
  }),

  http.delete(`${BASE}/api/v1/agents/:id`, async ({ params }) => {
    await mockDelay();
    const idx = dbAgents.findIndex((a) => a.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    dbAgents.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ═══════════════════════════════════════════════════════════
  // Tasks
  // ═══════════════════════════════════════════════════════════
  http.get(`${BASE}/api/v1/tasks`, async ({ request }) => {
    await mockDelay();
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const agentId = url.searchParams.get('agentId');
    const sort = url.searchParams.get('sort') ?? 'createdAt';
    const order = url.searchParams.get('order') ?? 'desc';
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    let filtered = [...dbTasks];
    if (search) {
      filtered = filtered.filter((t) => t.input.toLowerCase().includes(search) || t.id.toLowerCase().includes(search));
    }
    if (status && status !== 'all') filtered = filtered.filter((t) => t.status === status);
    if (priority) filtered = filtered.filter((t) => t.priority === Number(priority));
    if (agentId) filtered = filtered.filter((t) => t.agentId === agentId);

    filtered.sort((a, b) => {
      const aVal = a[sort as keyof typeof a] ?? '';
      const bVal = b[sort as keyof typeof b] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return order === 'desc' ? -cmp : cmp;
    });

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ items, total, page, pageSize });
  }),

  http.get(`${BASE}/api/v1/tasks/:id`, async ({ params }) => {
    await mockDelay();
    const task = dbTasks.find((t) => t.id === params.id);
    if (!task) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(task);
  }),

  http.get(`${BASE}/api/v1/tasks/:id/timeline`, async ({ params }) => {
    await mockDelay();
    const task = dbTasks.find((t) => t.id === params.id);
    if (!task) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(deriveTimeline(task));
  }),

  http.post(`${BASE}/api/v1/tasks`, async ({ request }) => {
    await mockDelay();
    const body = (await request.json()) as Record<string, unknown>;
    const newTask = {
      id: `task_${Date.now().toString(16)}`,
      agentId: body.agentId as string,
      agentName: dbAgents.find((a) => a.id === body.agentId)?.name ?? 'unknown',
      status: 'queued' as const,
      priority: (body.priority as number) ?? 3,
      input: body.input as string,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    dbTasks.unshift(newTask);
    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.post(`${BASE}/api/v1/tasks/:id/cancel`, async ({ params }) => {
    await mockDelay();
    const task = dbTasks.find((t) => t.id === params.id);
    if (!task) return new HttpResponse(null, { status: 404 });
    task.status = 'cancelled';
    task.completedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    return HttpResponse.json(task);
  }),

  // ═══════════════════════════════════════════════════════════
  // Logs
  // ═══════════════════════════════════════════════════════════
  http.get(`${BASE}/api/v1/logs`, async ({ request }) => {
    await mockDelay();
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const level = url.searchParams.get('level');
    const source = url.searchParams.get('source');
    const timeRange = url.searchParams.get('timeRange');
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    let filtered = [...dbLogs];
    if (search) filtered = filtered.filter((l) => l.message.toLowerCase().includes(search));
    if (level && level !== 'all') filtered = filtered.filter((l) => l.level === level);
    if (source && source !== 'all') filtered = filtered.filter((l) => l.agentId === source);

    // Filter by time range
    if (timeRange) {
      const now = new Date();
      const ranges: Record<string, number> = { '1h': 60, '6h': 360, '24h': 1440, '7d': 10080 };
      const minutes = ranges[timeRange];
      if (minutes) {
        const cutoff = new Date(now.getTime() - minutes * 60000).toISOString();
        filtered = filtered.filter((l) => l.timestamp >= cutoff);
      }
    }

    // Newest first
    filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ items, total, page, pageSize });
  }),

  // ═══════════════════════════════════════════════════════════
  // Workflows
  // ═══════════════════════════════════════════════════════════
  http.get(`${BASE}/api/v1/workflows`, async ({ request }) => {
    await mockDelay();
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const status = url.searchParams.get('status');

    let filtered = [...dbWorkflowSummaries];
    if (search) {
      filtered = filtered.filter((w) => w.name.toLowerCase().includes(search) || w.description.toLowerCase().includes(search));
    }
    if (status && status !== 'all') filtered = filtered.filter((w) => w.status === status);

    return HttpResponse.json(filtered);
  }),

  http.get(`${BASE}/api/v1/workflows/:id`, async ({ params }) => {
    await mockDelay();
    const detail = dbWorkflowDetails[params.id as string];
    if (!detail) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(detail);
  }),

  http.post(`${BASE}/api/v1/workflows`, async ({ request }) => {
    await mockDelay();
    const body = (await request.json()) as Record<string, unknown>;
    const summary = {
      id: `wf_${Date.now().toString(16)}`,
      name: body.name as string,
      description: (body.description as string) ?? '',
      status: 'draft' as const,
      stepCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    dbWorkflowSummaries.unshift(summary);
    return HttpResponse.json(summary, { status: 201 });
  }),

  http.put(`${BASE}/api/v1/workflows/:id`, async ({ params, request }) => {
    await mockDelay();
    const body = (await request.json()) as Record<string, unknown>;
    const idx = dbWorkflowSummaries.findIndex((w) => w.id === params.id);
    if (idx !== -1) {
      dbWorkflowSummaries[idx] = { ...dbWorkflowSummaries[idx], ...(body as Partial<WorkflowSummary>), updatedAt: new Date().toISOString().split('T')[0] };
    }
    if (dbWorkflowDetails[params.id as string]) {
      dbWorkflowDetails[params.id as string] = { ...dbWorkflowDetails[params.id as string], ...body as Partial<WorkflowDetail> };
    }
    return HttpResponse.json(dbWorkflowSummaries[idx] ?? dbWorkflowDetails[params.id as string]);
  }),

  http.delete(`${BASE}/api/v1/workflows/:id`, async ({ params }) => {
    await mockDelay();
    const idx = dbWorkflowSummaries.findIndex((w) => w.id === params.id);
    if (idx !== -1) dbWorkflowSummaries.splice(idx, 1);
    delete dbWorkflowDetails[params.id as string];
    return new HttpResponse(null, { status: 204 });
  }),

  // ═══════════════════════════════════════════════════════════
  // Costs
  // ═══════════════════════════════════════════════════════════
  http.get(`${BASE}/api/v1/costs/report`, async ({ request }) => {
    await mockDelay();
    const url = new URL(request.url);
    const groupBy = url.searchParams.get('groupBy') ?? 'agent';

    const costByAgent = [
      { id: '1', name: 'code-reviewer', cost: 42.50, tokens: 425000, tasks: 87 },
      { id: '2', name: 'security-scanner', cost: 28.30, tokens: 283000, tasks: 54 },
      { id: '3', name: 'test-generator', cost: 15.75, tokens: 157500, tasks: 32 },
      { id: '4', name: 'slack-notifier', cost: 3.20, tokens: 32000, tasks: 148 },
      { id: '5', name: 'doc-writer', cost: 18.90, tokens: 189000, tasks: 23 },
    ];

    const costByUser = [
      { id: 'u1', name: 'Alice Chen', cost: 52.80, tokens: 528000, tasks: 156 },
      { id: 'u2', name: 'Bob Zhang', cost: 31.45, tokens: 314500, tasks: 89 },
      { id: 'u3', name: 'Carol Li', cost: 18.20, tokens: 182000, tasks: 67 },
      { id: 'u4', name: 'David Wang', cost: 6.20, tokens: 62000, tasks: 32 },
    ];

    const costByDay = [
      { date: '07/15', cost: 18.50 }, { date: '07/16', cost: 22.30 },
      { date: '07/17', cost: 15.80 }, { date: '07/18', cost: 28.90 },
      { date: '07/19', cost: 19.20 }, { date: '07/20', cost: 25.60 },
      { date: '07/21', cost: 12.40 },
    ];

    const quotas = [
      { id: '1', name: 'code-reviewer', dailyLimit: 500000, used: 425000 },
      { id: '2', name: 'security-scanner', dailyLimit: 300000, used: 283000 },
      { id: '3', name: 'test-generator', dailyLimit: 200000, used: 157500 },
      { id: '4', name: 'slack-notifier', dailyLimit: 100000, used: 32000 },
      { id: '5', name: 'doc-writer', dailyLimit: 250000, used: 189000 },
    ];

    return HttpResponse.json({
      summary: {
        todayCost: 12.40,
        weekCost: 108.65,
        monthCost: 452.80,
        todayTokens: 124000,
        avgCostPerTask: 0.36,
        projectedMonth: 512.00,
      },
      breakdown: groupBy === 'agent' ? costByAgent : costByUser,
      dailyTrend: costByDay,
      quotas,
    });
  }),

  http.put(`${BASE}/api/v1/costs/quotas/:agentId`, async () => {
    await mockDelay();
    return HttpResponse.json({ success: true });
  }),

  http.put(`${BASE}/api/v1/costs/alerts`, async () => {
    await mockDelay();
    return HttpResponse.json({ success: true });
  }),

  // ═══════════════════════════════════════════════════════════
  // Users & Access
  // ═══════════════════════════════════════════════════════════
  http.get(`${BASE}/api/v1/users`, async () => {
    await mockDelay();
    return HttpResponse.json(dbUsers);
  }),

  http.put(`${BASE}/api/v1/users/:id/role`, async ({ params, request }) => {
    await mockDelay();
    const body = (await request.json()) as { role: string };
    const user = dbUsers.find((u) => u.id === params.id);
    if (!user) return new HttpResponse(null, { status: 404 });
    user.role = body.role as User['role'];
    return HttpResponse.json(user);
  }),

  http.delete(`${BASE}/api/v1/users/:id`, async ({ params }) => {
    await mockDelay();
    const idx = dbUsers.findIndex((u) => u.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    dbUsers.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ═══════════════════════════════════════════════════════════
  // API Keys
  // ═══════════════════════════════════════════════════════════
  http.get(`${BASE}/api/v1/api-keys`, async () => {
    await mockDelay();
    return HttpResponse.json(dbApiKeys);
  }),

  http.post(`${BASE}/api/v1/api-keys`, async ({ request }) => {
    await mockDelay();
    const body = (await request.json()) as { name: string };
    const prefix = `asy_${body.name.toLowerCase().replace(/\s+/g, '_').slice(0, 8)}_***`;
    const newKey = {
      id: `key_${Date.now()}`,
      name: body.name,
      prefix,
      createdAt: new Date().toISOString(),
      lastUsedAt: undefined,
    };
    const rawKey = `asy_${crypto.randomUUID().replace(/-/g, '')}`;
    dbApiKeys.unshift(newKey);
    return HttpResponse.json({ ...newKey, rawKey }, { status: 201 });
  }),

  http.delete(`${BASE}/api/v1/api-keys/:id`, async ({ params }) => {
    await mockDelay();
    const idx = dbApiKeys.findIndex((k) => k.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    dbApiKeys.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ═══════════════════════════════════════════════════════════
  // Webhooks
  // ═══════════════════════════════════════════════════════════
  http.get(`${BASE}/api/v1/webhooks`, async () => {
    await mockDelay();
    return HttpResponse.json(dbWebhooks);
  }),

  http.post(`${BASE}/api/v1/webhooks`, async ({ request }) => {
    await mockDelay();
    const body = (await request.json()) as Partial<Webhook>;
    const newWh: Webhook = {
      id: `wh_${Date.now()}`,
      url: body.url ?? '',
      events: body.events ?? [],
      enabled: true,
      secret: body.secret,
      createdAt: new Date().toISOString(),
    };
    dbWebhooks.unshift(newWh);
    return HttpResponse.json(newWh, { status: 201 });
  }),

  http.put(`${BASE}/api/v1/webhooks/:id`, async ({ params, request }) => {
    await mockDelay();
    const body = (await request.json()) as Partial<Webhook>;
    const idx = dbWebhooks.findIndex((w) => w.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    dbWebhooks[idx] = { ...dbWebhooks[idx], ...body };
    return HttpResponse.json(dbWebhooks[idx]);
  }),

  http.delete(`${BASE}/api/v1/webhooks/:id`, async ({ params }) => {
    await mockDelay();
    const idx = dbWebhooks.findIndex((w) => w.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    dbWebhooks.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/api/v1/webhooks/:id/test`, async () => {
    await mockDelay();
    await delay(1000); // Simulate test request latency
    return HttpResponse.json({ success: true });
  }),
];
