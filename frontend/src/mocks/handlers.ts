/**
 * MSW Request Handlers
 *
 * 拦截所有 API 请求并返回中心化 mock 数据。
 * Session 9: 统一 mock 数据层，所有页面通过 services + MSW 取数。
 */

import { http, HttpResponse, delay } from 'msw';
import { config } from '../config';
import type { WorkflowSummary, WorkflowDetail, Webhook, User, TaskPriority } from '../types';
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
  dbServiceHealth,
  dbAuditLogs,
  dbThroughputByRange,
  dbLatencyDistribution,
} from './data';

// 使用路径匹配（不含 host），避免 localhost vs 127.0.0.1 等导致 MSW 漏拦截
async function mockDelay(): Promise<void> {
  if (config.mock.enabled && config.mock.delay > 0) {
    await delay(config.mock.delay);
  }
}

export const handlers = [
  // ═══════════════════════════════════════════════════════════
  // Dashboard
  // ═══════════════════════════════════════════════════════════
  http.get(`/api/v1/metrics/dashboard`, async () => {
    await mockDelay();
    return HttpResponse.json(dbDashboardMetrics);
  }),
  http.get(`/api/v1/metrics/queue`, async () => {
    await mockDelay();
    return HttpResponse.json({
      high: dbDashboardMetrics.queueHigh,
      medium: dbDashboardMetrics.queueMedium,
      low: dbDashboardMetrics.queueLow,
    });
  }),
  http.get(`/api/v1/metrics/health`, async () => {
    await mockDelay();
    return HttpResponse.json(dbSystemHealth);
  }),
  http.get(`/api/v1/metrics/services`, async () => {
    await mockDelay();
    return HttpResponse.json(dbServiceHealth);
  }),
  http.get(`/api/v1/metrics/throughput`, async ({ request }) => {
    await mockDelay();
    const url = new URL(request.url);
    const range = url.searchParams.get('range') ?? 'today';
    return HttpResponse.json(dbThroughputByRange[range] ?? dbThroughputByRange.today);
  }),
  http.get(`/api/v1/metrics/latency`, async () => {
    await mockDelay();
    return HttpResponse.json(dbLatencyDistribution);
  }),

  // ═══════════════════════════════════════════════════════════
  // Audit Logs
  // ═══════════════════════════════════════════════════════════
  http.get(`/api/v1/audit-logs`, async () => {
    await mockDelay();
    return HttpResponse.json(dbAuditLogs);
  }),

  // ═══════════════════════════════════════════════════════════
  // Agents
  // ═══════════════════════════════════════════════════════════
  http.get(`/api/v1/agents`, async ({ request }) => {
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
    else if (sort === 'status') filtered.sort((a, b) => a.status.localeCompare(b.status));
    else if (sort === 'todayTasks') filtered.sort((a, b) => a.todayTasks - b.todayTasks);
    else if (sort === 'todayTokens') filtered.sort((a, b) => a.todayTokens - b.todayTokens);
    else filtered.sort((a, b) => a.name.localeCompare(b.name));

    const order = url.searchParams.get('order') ?? 'asc';
    if (order === 'desc') filtered.reverse();

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ data, total, page, pageSize });
  }),

  http.get(`/api/v1/agents/:id`, async ({ params }) => {
    await mockDelay();
    const agent = dbAgents.find((a) => a.id === params.id);
    if (!agent) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(agent);
  }),

  http.post(`/api/v1/agents`, async ({ request }) => {
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

  http.put(`/api/v1/agents/:id`, async ({ params, request }) => {
    await mockDelay();
    const idx = dbAgents.findIndex((a) => a.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    dbAgents[idx] = { ...dbAgents[idx], ...body, updatedAt: new Date().toISOString().split('T')[0] } as typeof dbAgents[number];
    return HttpResponse.json(dbAgents[idx]);
  }),

  http.delete(`/api/v1/agents/:id`, async ({ params }) => {
    await mockDelay();
    const idx = dbAgents.findIndex((a) => a.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    dbAgents.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ═══════════════════════════════════════════════════════════
  // Tasks
  // ═══════════════════════════════════════════════════════════
  http.get(`/api/v1/tasks`, async ({ request }) => {
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
    const data = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ data, total, page, pageSize });
  }),

  http.get(`/api/v1/tasks/:id`, async ({ params }) => {
    await mockDelay();
    const task = dbTasks.find((t) => t.id === params.id);
    if (!task) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(task);
  }),

  http.get(`/api/v1/tasks/:id/timeline`, async ({ params }) => {
    await mockDelay();
    const task = dbTasks.find((t) => t.id === params.id);
    if (!task) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(deriveTimeline(task));
  }),

  http.post(`/api/v1/tasks`, async ({ request }) => {
    await mockDelay();
    const body = (await request.json()) as Record<string, unknown>;
    const newTask = {
      id: `task_${Date.now().toString(16)}`,
      agentId: body.agentId as string,
      agentName: dbAgents.find((a) => a.id === body.agentId)?.name ?? 'unknown',
      status: 'queued' as const,
      priority: (body.priority as TaskPriority) ?? 3,
      input: body.input as string,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    dbTasks.unshift(newTask);
    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.post(`/api/v1/tasks/:id/cancel`, async ({ params }) => {
    await mockDelay();
    const task = dbTasks.find((t) => t.id === params.id);
    if (!task) return new HttpResponse(null, { status: 404 });
    task.status = 'cancelled';
    task.completedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    return HttpResponse.json(task);
  }),

  http.post(`/api/v1/tasks/:id/retry`, async ({ params }) => {
    await mockDelay();
    const task = dbTasks.find((t) => t.id === params.id);
    if (!task) return new HttpResponse(null, { status: 404 });
    if (task.status !== 'failed' && task.status !== 'cancelled') {
      return HttpResponse.json({ code: 'INVALID_STATE', message: 'Only failed or cancelled tasks can be retried' }, { status: 400 });
    }
    task.status = 'queued';
    task.output = undefined;
    task.errorMessage = undefined;
    task.duration = undefined;
    task.tokensUsed = undefined;
    task.startedAt = undefined;
    task.completedAt = undefined;
    return HttpResponse.json(task);
  }),

  // ═══════════════════════════════════════════════════════════
  // Logs
  // ═══════════════════════════════════════════════════════════
  http.get(`/api/v1/logs`, async ({ request }) => {
    await mockDelay();
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const level = url.searchParams.get('level');
    const source = url.searchParams.get('source');
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;

    let filtered = [...dbLogs];
    if (search) filtered = filtered.filter((l) => l.message.toLowerCase().includes(search));
    if (level && level !== 'all') filtered = filtered.filter((l) => l.level === level);
    if (source && source !== 'all') {
      if (source === '__system__') {
        filtered = filtered.filter((l) => !l.agentId);
      } else {
        filtered = filtered.filter((l) => l.agentName === source);
      }
    }

    if (start) {
      filtered = filtered.filter((l) => l.timestamp >= start.replace('T', ' ').slice(0, 23));
    }
    if (end) {
      filtered = filtered.filter((l) => l.timestamp <= end.replace('T', ' ').slice(0, 23));
    }

    // Newest first
    filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    const total = filtered.length;
    const offset = (page - 1) * pageSize;
    const data = filtered.slice(offset, offset + pageSize);

    return HttpResponse.json({ data, total, page, pageSize });
  }),

  // ═══════════════════════════════════════════════════════════
  // Workflows
  // ═══════════════════════════════════════════════════════════
  http.get(`/api/v1/workflows`, async ({ request }) => {
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

  http.get(`/api/v1/workflows/:id`, async ({ params }) => {
    await mockDelay();
    const detail = dbWorkflowDetails[params.id as string];
    if (!detail) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(detail);
  }),

  http.post(`/api/v1/workflows`, async ({ request }) => {
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

  http.put(`/api/v1/workflows/:id`, async ({ params, request }) => {
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

  http.delete(`/api/v1/workflows/:id`, async ({ params }) => {
    await mockDelay();
    const idx = dbWorkflowSummaries.findIndex((w) => w.id === params.id);
    if (idx !== -1) dbWorkflowSummaries.splice(idx, 1);
    delete dbWorkflowDetails[params.id as string];
    return new HttpResponse(null, { status: 204 });
  }),

  // ═══════════════════════════════════════════════════════════
  // Costs
  // ═══════════════════════════════════════════════════════════
  http.get(`/api/v1/costs/report`, async ({ request }) => {
    await mockDelay();
    const url = new URL(request.url);
    const groupBy = url.searchParams.get('groupBy') ?? 'agent';
    const startParam = url.searchParams.get('start');
    const endParam = url.searchParams.get('end');

    const end = endParam ? new Date(endParam) : new Date();
    const start = startParam
      ? new Date(startParam)
      : new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);

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

    const costByDay: { date: string; cost: number }[] = [];
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);

    while (cursor <= endDay) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, '0');
      const d = String(cursor.getDate()).padStart(2, '0');
      const iso = `${y}-${m}-${d}`;
      const seed = cursor.getDate() + cursor.getMonth() * 3;
      costByDay.push({ date: iso, cost: Math.round((12 + (seed % 7) * 2.3 + (seed % 5) * 1.1) * 100) / 100 });
      cursor.setDate(cursor.getDate() + 1);
    }

    const rangeTotal = costByDay.reduce((sum, item) => sum + item.cost, 0);

    const quotas = [
      { id: '1', name: 'code-reviewer', dailyLimit: 500000, used: 425000 },
      { id: '2', name: 'security-scanner', dailyLimit: 300000, used: 283000 },
      { id: '3', name: 'test-generator', dailyLimit: 200000, used: 157500 },
      { id: '4', name: 'slack-notifier', dailyLimit: 100000, used: 32000 },
      { id: '5', name: 'doc-writer', dailyLimit: 250000, used: 189000 },
    ];

    return HttpResponse.json({
      summary: {
        todayCost: costByDay.at(-1)?.cost ?? 0,
        weekCost: Math.round(rangeTotal * 100) / 100,
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

  http.put(`/api/v1/costs/quotas/:agentId`, async () => {
    await mockDelay();
    return HttpResponse.json({ success: true });
  }),

  http.put(`/api/v1/costs/alerts`, async () => {
    await mockDelay();
    return HttpResponse.json({ success: true });
  }),

  // ═══════════════════════════════════════════════════════════
  // Users & Access
  // ═══════════════════════════════════════════════════════════
  http.get(`/api/v1/users`, async () => {
    await mockDelay();
    return HttpResponse.json(dbUsers);
  }),

  http.put(`/api/v1/users/:id/role`, async ({ params, request }) => {
    await mockDelay();
    const body = (await request.json()) as { role: string };
    const user = dbUsers.find((u) => u.id === params.id);
    if (!user) return new HttpResponse(null, { status: 404 });
    user.role = body.role as User['role'];
    return HttpResponse.json(user);
  }),

  http.delete(`/api/v1/users/:id`, async ({ params }) => {
    await mockDelay();
    const idx = dbUsers.findIndex((u) => u.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    dbUsers.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`/api/v1/users/invite`, async ({ request }) => {
    await mockDelay();
    const body = (await request.json()) as { email: string; role: string };
    if (dbUsers.some((u) => u.email === body.email)) {
      return HttpResponse.json({ code: 'DUPLICATE', message: 'User already exists' }, { status: 409 });
    }
    const namePart = body.email.split('@')[0] ?? 'user';
    const displayName = namePart.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: displayName,
      email: body.email,
      role: body.role as User['role'],
    };
    dbUsers.push(newUser);
    dbAuditLogs.unshift({
      id: `a_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'Alice Chen',
      action: 'user_invited',
      resource: newUser.id,
      detail: `邀请 ${newUser.email} 加入团队`,
      ip: '192.168.1.100',
    });
    return HttpResponse.json(newUser, { status: 201 });
  }),

  // ═══════════════════════════════════════════════════════════
  // API Keys
  // ═══════════════════════════════════════════════════════════
  http.get(`/api/v1/api-keys`, async () => {
    await mockDelay();
    return HttpResponse.json(dbApiKeys);
  }),

  http.post(`/api/v1/api-keys`, async ({ request }) => {
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

  http.delete(`/api/v1/api-keys/:id`, async ({ params }) => {
    await mockDelay();
    const idx = dbApiKeys.findIndex((k) => k.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    dbApiKeys.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ═══════════════════════════════════════════════════════════
  // Webhooks
  // ═══════════════════════════════════════════════════════════
  http.get(`/api/v1/webhooks`, async () => {
    await mockDelay();
    return HttpResponse.json(dbWebhooks);
  }),

  http.post(`/api/v1/webhooks`, async ({ request }) => {
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

  http.put(`/api/v1/webhooks/:id`, async ({ params, request }) => {
    await mockDelay();
    const body = (await request.json()) as Partial<Webhook>;
    const idx = dbWebhooks.findIndex((w) => w.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    dbWebhooks[idx] = { ...dbWebhooks[idx], ...body };
    return HttpResponse.json(dbWebhooks[idx]);
  }),

  http.delete(`/api/v1/webhooks/:id`, async ({ params }) => {
    await mockDelay();
    const idx = dbWebhooks.findIndex((w) => w.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    dbWebhooks.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`/api/v1/webhooks/:id/test`, async () => {
    await mockDelay();
    await delay(1000); // Simulate test request latency
    return HttpResponse.json({ success: true });
  }),
];
