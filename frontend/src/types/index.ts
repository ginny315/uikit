/**
 * 共享类型定义
 *
 * 后端是 Go + gRPC，无法自动生成 TS 类型。
 * 前端手写，后续可用 openapi-typescript 从 OpenAPI JSON 生成替换。
 *
 * 命名约定：请求类型用 XxxRequest，响应列表用 XxxListResponse，详情用 XxxResponse。
 */

// ── 分页 ──
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Agent ──
export type AgentStatus = 'running' | 'stopped' | 'error';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  llmProvider: string;
  llmModel: string;
  tools: string[];
  /** 每日 token 配额 */
  dailyTokenQuota: number;
  /** 今日已消耗 token */
  todayTokens: number;
  /** 今日任务数 */
  todayTasks: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentRequest {
  name: string;
  description: string;
  llmProvider: string;
  llmModel: string;
  tools: string[];
  dailyTokenQuota: number;
}

export type UpdateAgentRequest = Partial<CreateAgentRequest>;

// ── Task ──
export type TaskStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
export type TaskPriority = 1 | 2 | 3 | 4;

export interface Task {
  id: string;
  agentId: string;
  agentName: string;
  status: TaskStatus;
  priority: TaskPriority;
  input: string;
  output?: string;
  /** 耗时 (ms) */
  duration?: number;
  /** token 消耗 */
  tokensUsed?: number;
  /** 错误信息 */
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CreateTaskRequest {
  agentId: string;
  input: string;
  priority?: TaskPriority;
}

export interface TaskTimelineEvent {
  timestamp: string;
  type: 'enqueued' | 'assigned' | 'llm_call' | 'tool_call' | 'retry' | 'completed' | 'failed' | 'cancelled';
  detail: string;
  duration?: number;
}

// ── 工作流 ──
export type WorkflowStatus = 'active' | 'paused' | 'draft';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  agentName: string;
  position: { x: number; y: number };
  config?: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string; // step id
  target: string; // step id
}

// ── 日志 ──
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** 对应 ClickHouse agent_logs 表（TECH_DESIGN.md §3.3），camelCase 命名 */
export interface LogEntry {
  /** 前端展示用 key（后端由 timestamp + span_id 唯一确定） */
  id: string;
  /** 毫秒精度：YYYY-MM-DD HH:mm:ss.SSS */
  timestamp: string;
  level: LogLevel;
  /** 关联 Agent；系统级日志可为空 */
  agentId?: string;
  agentName?: string;
  /** 关联任务；Agent 生命周期日志可为空 */
  taskId?: string;
  instanceId: string;
  traceId: string;
  spanId: string;
  message: string;
  /** 结构化字段（fields JSON） */
  fields?: Record<string, string | number | boolean>;
}

// ── 监控指标 ──
export interface DashboardMetrics {
  todayTasks: number;
  successRate: number;
  tokensUsed: number;
  activeAgents: number;
}

export interface QueueStatus {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface SystemHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  latency: string;
}

// ── API Key ──
export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  key: string; // 仅创建时返回完整 key
}

// ── User / Role ──
export type UserRole = 'admin' | 'member' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

// ── Webhook ──
export type WebhookEvent = 'task.completed' | 'task.failed' | 'agent.started' | 'agent.stopped';

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  enabled: boolean;
  secret?: string;
  createdAt: string;
}

// ── 通用 ──
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>; // field-level validation errors
}
