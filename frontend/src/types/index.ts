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

/** 工作流摘要 — 列表页用 */
export interface WorkflowSummary {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  stepCount: number;
  createdAt: string;
  updatedAt: string;
}

/** ReactFlow 节点 data — Agent 步骤 */
export interface WorkflowNodeData {
  label: string;
  agentId?: string;
  agentName?: string;
  /** 传给 Agent 的输入模板（支持 {{output.prev}} 等占位符） */
  inputTemplate?: string;
}

/** ReactFlow 边 data */
export interface WorkflowEdgeData {
  condition?: string;
}

/**
 * 工作流详情 — 编辑器用。
 * nodes / edges 为 ReactFlow 原生结构，直接用于 <ReactFlow> 的受控 props。
 * 序列化存储时只保留 id、type、position、data（ReactFlow 运行时字段由框架管理）。
 */
export interface WorkflowDetail extends WorkflowSummary {
  nodes: WorkflowNode[];
  edges: WorkflowEdgeType[];
}

/**
 * ReactFlow 节点 — 序列化友好的子集。
 * 不包含 ReactFlow 运行时字段（measured、internals 等），
 * 用于 mock 数据和 API 传输。
 */
export interface WorkflowNode {
  id: string;
  type: 'start' | 'agent' | 'end';
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

/** ReactFlow 边 — 序列化友好的子集 */
export interface WorkflowEdgeType {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  data?: WorkflowEdgeData;
}

// ── 保留旧类型别名，向下兼容已有引用 ──
/** @deprecated 使用 WorkflowSummary */
export type Workflow = WorkflowSummary;
/** @deprecated 使用 WorkflowNode */
export type WorkflowStep = WorkflowNode;
/** @deprecated 使用 WorkflowEdgeType */
export type WorkflowEdge = WorkflowEdgeType;

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
