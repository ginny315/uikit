# LLM Agent 管理系统 - 技术设计文档

**版本**: 1.0
**创建日期**: 2026-07-03
**状态**: Draft
**文档类型**: 技术设计文档

---

## 文档说明

本文档定义 **LLM Agent 管理系统** 的技术设计方案，面向架构师和研发团队。

- **技术视角**: 描述系统架构、模块设计、技术选型
- **实现导向**: 指导研发团队进行开发
- **对应产品需求**: 产品需求详见 [PRD.md](./PRD.md)

---

## 目录

1. [系统架构](#1-系统架构)
2. [模块设计](#2-模块设计)
3. [数据模型](#3-数据模型)
4. [API 设计](#4-api-设计)
5. [技术选型](#5-技术选型)
6. [部署架构](#6-部署架构)
7. [安全设计](#7-安全设计)
8. [监控与可观测性](#8-监控与可观测性)

---

## 1. 系统架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        接入层 (Access Layer)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │API Gateway│  │ Web UI   │  │   CLI    │  │WebSocket │       │
│  │  (Nginx)  │  │ (React)  │  │(Go Binary)│  │  (Push)   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        服务层 (Service Layer)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    核心服务集群                             │   │
│  │                                                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │ Control  │  │Scheduler │  │ AgentRun │  │Coordinator│ │   │
│  │  │ Service  │  │ Service  │  │ Service  │  │  Service  │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │  Auth    │  │ Metrics  │  │   Log    │  │  Webhook │  │   │
│  │  │ Service  │  │ Service  │  │ Service  │  │  Service  │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│              │      │              │      │              │
│  PostgreSQL  │      │    Redis     │      │ ClickHouse   │
│              │      │              │      │              │
│ (配置/用户)   │      │ (队列/状态)   │      │   (日志)     │
│              │      │              │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
```

### 1.2 架构分层

| 层级 | 职责 | 技术选型 |
|-----|------|---------|
| **接入层** | 路由、认证、限流 | Nginx / Kong |
| **服务层** | 业务逻辑 | Go (gRPC) |
| **存储层** | 数据持久化 | PostgreSQL / Redis / ClickHouse |
| **外部依赖** | LLM 调用、工具 | HTTP / MCP |

### 1.3 核心组件关系

```
                    ┌─────────────┐
                    │   Client    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ API Gateway │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼─────┐      ┌────▼────┐
   │ Control │      │ Scheduler │      │  Auth   │
   └────┬────┘      └─────┬─────┘      └─────────┘
        │                  │
        └────────┬─────────┘
                 │
        ┌────────▼─────────┐
        │   Redis Queue    │
        └────────┬─────────┘
                 │
        ┌────────▼─────────┐
        │   Agent Run      │
        └────────┬─────────┘
                 │
        ┌────────▼─────────┐
        │   LLM Provider   │
        └──────────────────┘
```

---

## 2. 模块设计

### 2.1 Control Service (控制服务)

**职责**: Agent 生命周期管理

**核心接口**:
```go
type ControlService interface {
    // 创建 Agent
    CreateAgent(ctx context.Context, req *CreateAgentRequest) (*Agent, error)

    // 启动 Agent
    StartAgent(ctx context.Context, agentID string) error

    // 停止 Agent
    StopAgent(ctx context.Context, agentID string) error

    // 获取 Agent 状态
    GetAgentStatus(ctx context.Context, agentID string) (*AgentStatus, error)

    // 列出 Agent
    ListAgents(ctx context.Context, filter *AgentFilter) ([]*Agent, error)
}
```

**状态机**:
```
┌────────┐
│ DRAFT  │
└───┬────┘
    │ start()
    ▼
┌────────┐     stop()     ┌────────┐
│ ACTIVE │───────────────▶│ PAUSED │
└────────┘                 └────────┘
    │                          │
    │ delete()                │ delete()
    ▼                          ▼
┌────────┐                 ┌────────┐
│DEPRECATED│               │TERMINATED│
└────────┘                 └────────┘
```

---

### 2.2 Scheduler Service (调度服务)

**职责**: 任务调度、队列管理

**核心接口**:
```go
type SchedulerService interface {
    // 提交任务
    SubmitTask(ctx context.Context, req *SubmitTaskRequest) (*Task, error)

    // 分配任务
    AssignTask(ctx context.Context, taskID string) (*Assignment, error)

    // 更新任务状态
    UpdateTaskStatus(ctx context.Context, taskID string, status TaskStatus) error

    // 取消任务
    CancelTask(ctx context.Context, taskID string) error
}
```

**队列设计**:
```go
// 优先级队列
type PriorityQueue struct {
    Urgent   *Queue  // 优先级最高
    High     *Queue
    Normal   *Queue
    Low      *Queue
}

// 公平调度：防止低优先级任务饥饿
func (pq *PriorityQueue) Next() *Task {
    // 70% 概率从高优先级取
    // 30% 概率从低优先级取
    // 确保最终都能被执行
}
```

**重试策略**:
```go
type RetryPolicy struct {
    MaxAttempts     int           // 最大重试次数
    Backoff         BackoffType   // backoff 策略
    InitialDelay    time.Duration // 初始延迟
    MaxDelay        time.Duration // 最大延迟
    Multiplier      float64       // 延迟倍数
}

// 指数退避
func (rp *RetryPolicy) GetDelay(attempt int) time.Duration {
    delay := rp.InitialDelay * time.Duration(math.Pow(rp.Multiplier, float64(attempt)))
    if delay > rp.MaxDelay {
        return rp.MaxDelay
    }
    return delay
}
```

---

### 2.3 Agent Run Service (执行服务)

**职责**: Agent 实例执行、LLM 调用

**核心接口**:
```go
type AgentRunService interface {
    // 启动 Agent 实例
    StartAgent(ctx context.Context, agent *Agent, task *Task) (*Instance, error)

    // 执行任务
    ExecuteTask(ctx context.Context, inst *Instance, task *Task) (*Result, error)

    // 停止实例
    StopInstance(ctx context.Context, instanceID string) error

    // 发送消息 (Agent 间通信)
    SendMessage(ctx context.Context, from, to string, msg *Message) error
    ReceiveMessage(ctx context.Context, instanceID string) (*Message, error)
}
```

**执行上下文**:
```go
type ExecutionContext struct {
    TaskID      string
    AgentID     string
    InstanceID  string

    // LLM 配置
    LLMConfig   LLMConfig

    // 工具集
    Tools       []Tool

    // Token 追踪
    TokenUsage  *TokenCounter

    // 超时控制
    Timeout     time.Duration
    CancelFunc  context.CancelFunc
}
```

---

### 2.4 Coordinator Service (协调服务)

**职责**: 工作流编排、Agent 间通信

**工作流定义**:
```go
type Workflow struct {
    ID          string
    Name        string
    Description string
    Steps       []*WorkflowStep
}

type WorkflowStep struct {
    ID          string
    Name        string
    Agent       string
    InputFrom   []string  // 从前序步骤获取输入
    OutputTo    string    // 输出存储位置
    Parallel    bool      // 是否并行执行
    Condition   string    // 条件表达式
}
```

**执行引擎**:
```go
func (c *Coordinator) ExecuteWorkflow(ctx context.Context, wf *Workflow) (*WorkflowResult, error) {
    // 1. 构建执行图 (DAG)
    dag := c.buildDAG(wf)

    // 2. 拓扑排序
    sorted := dag.TopologicalSort()

    // 3. 按层级执行
    for _, level := range sorted.Levels() {
        if level.IsParallel() {
            // 并行执行
            c.executeParallel(ctx, level.Steps)
        } else {
            // 串行执行
            c.executeSequential(ctx, level.Steps)
        }
    }

    // 4. 收集结果
    return c.collectResults(wf)
}
```

---

### 2.5 Metrics Service (指标服务)

**职责**: 指标收集、聚合、查询

**指标定义**:
```go
// Counter - 计数器
var (
    TasksTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "agent_tasks_total",
            Help: "Total number of tasks",
        },
        []string{"agent", "status"},
    )

    TokensConsumed = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "agent_tokens_consumed_total",
            Help: "Total tokens consumed",
        },
        []string{"agent", "model"},
    )
)

// Histogram - 直方图
var (
    TaskDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "agent_task_duration_seconds",
            Help:    "Task duration in seconds",
            Buckets: prometheus.DefBuckets,
        },
        []string{"agent", "priority"},
    )
)

// Gauge - 仪表
var (
    QueueLength = prometheus.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "agent_queue_length",
            Help: "Current queue length",
        },
        []string{"priority"},
    )
)
```

---

### 2.6 Log Service (日志服务)

**职责**: 日志收集、存储、查询

**日志格式**:
```go
type LogEntry struct {
    Timestamp   time.Time              `json:"timestamp"`
    Level       string                 `json:"level"`
    TaskID      string                 `json:"task_id"`
    AgentID     string                 `json:"agent_id"`
    InstanceID  string                 `json:"instance_id"`
    TraceID     string                 `json:"trace_id"`
    SpanID      string                 `json:"span_id"`
    Message     string                 `json:"message"`
    Fields      map[string]interface{} `json:"fields"`
}
```

---

## 3. 数据模型

### 3.1 核心实体

#### Agent (代理)
```sql
CREATE TABLE agents (
    id              UUID PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    version         VARCHAR(50) NOT NULL,
    status          VARCHAR(20) NOT NULL,  -- draft, active, paused, deprecated
    config          JSONB NOT NULL,         -- Agent 配置
    capabilities    JSONB,                 -- 能力列表
    llm_config      JSONB NOT NULL,        -- LLM 配置
    tools           JSONB,                 -- 工具列表
    resource_limits JSONB,                 -- 资源限制
    created_by      UUID,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_capabilities ON agents USING GIN(capabilities);
```

#### Task (任务)
```sql
CREATE TABLE tasks (
    id              UUID PRIMARY KEY,
    agent_id        UUID NOT NULL,
    agent_version   VARCHAR(50),
    status          VARCHAR(20) NOT NULL,  -- queued, assigned, running, succeeded, failed, cancelled
    priority        VARCHAR(10) NOT NULL,  -- low, normal, high, urgent
    input           JSONB,
    output          JSONB,
    error           TEXT,
    retry_count     INT DEFAULT 0,
    max_retries     INT DEFAULT 3,
    queue_time      TIMESTAMP,
    start_time      TIMESTAMP,
    end_time        TIMESTAMP,
    timeout         INTERVAL,
    callback_url    VARCHAR(500),
    submitted_by    UUID,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_agent ON tasks(agent_id);
CREATE INDEX idx_tasks_created ON tasks(created_at DESC);
```

#### Execution (执行记录)
```sql
CREATE TABLE executions (
    id              UUID PRIMARY KEY,
    task_id         UUID NOT NULL,
    agent_id        UUID NOT NULL,
    agent_version   VARCHAR(50),
    instance_id     VARCHAR(255),
    status          VARCHAR(20) NOT NULL,
    input           JSONB,
    output          JSONB,
    error           TEXT,
    token_usage     JSONB,              -- {input: 1000, output: 2000, total: 3000}
    duration_ms     INT,
    trace_id        VARCHAR(255),
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,

    CONSTRAINT fk_task FOREIGN KEY (task_id) REFERENCES tasks(id),
    CONSTRAINT fk_execution_agent FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE INDEX idx_executions_task ON executions(task_id);
CREATE INDEX idx_executions_trace ON executions(trace_id);
```

#### Workflow (工作流)
```sql
CREATE TABLE workflows (
    id              UUID PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    definition      JSONB NOT NULL,       -- 工作流定义
    status          VARCHAR(20) NOT NULL,
    created_by      UUID,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workflow_executions (
    id              UUID PRIMARY KEY,
    workflow_id     UUID NOT NULL,
    status          VARCHAR(20) NOT NULL,
    input           JSONB,
    output          JSONB,
    error           TEXT,
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,

    CONSTRAINT fk_workflow FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);
```

#### User (用户)
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    name            VARCHAR(255),
    role            VARCHAR(50) NOT NULL,
    api_key         VARCHAR(255) UNIQUE,
    quota           JSONB,                -- 配额 {daily_tokens: 1000000}
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_sessions (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL,
    token           VARCHAR(500) NOT NULL,
    expires_at      TIMESTAMP NOT NULL,

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

### 3.2 Redis 数据结构

#### 任务队列
```
# 优先级队列
queue:tasks:urgent    → [task_id1, task_id2, ...]
queue:tasks:high      → [task_id3, task_id4, ...]
queue:tasks:normal    → [task_id5, task_id6, ...]
queue:tasks:low       → [task_id7, task_id8, ...]

# 任务详情 (hash)
task:task_id1 → {
    "id": "task_id1",
    "agent_id": "agent_id",
    "status": "running",
    "priority": "high",
    ...
}
```

#### Agent 状态
```
# Agent 在线实例
agent:instances:agent_id → [instance_id1, instance_id2, ...]

# 实例状态
instance:instance_id1 → {
    "agent_id": "agent_id",
    "task_id": "task_id",
    "status": "busy",
    "last_heartbeat": "2026-07-03T10:00:00Z"
}
```

#### 配额追踪
```
# 每日 Token 使用
quota:user:user_id:daily:20260703 → 50000

# 配额信息
quota:user:user_id → {
    "daily_tokens": 1000000,
    "max_concurrent": 10
}
```

---

### 3.3 ClickHouse 日志表

```sql
CREATE TABLE agent_logs (
    timestamp DateTime64(3),
    level String,
    task_id String,
    agent_id String,
    instance_id String,
    trace_id String,
    span_id String,
    message String,
    fields JSON,
    INDEX idx_trace_id trace_id TYPE bloom_filter GRANULARITY 1,
    INDEX idx_task_id task_id TYPE bloom_filter GRANULARITY 1
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, trace_id)
TTL timestamp + INTERVAL 30 DAY;
```

---

## 4. API 设计

### 4.1 REST API 规范

#### 通用响应格式
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "request_id": "req-xxx"
}
```

#### 错误响应
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AGENT_NOT_FOUND",
    "message": "Agent not found: xxx",
    "details": { ... }
  },
  "request_id": "req-xxx"
}
```

#### 错误码定义
| 错误码 | HTTP 状态 | 说明 |
|-------|----------|------|
| `AGENT_NOT_FOUND` | 404 | Agent 不存在 |
| `AGENT_ALREADY_RUNNING` | 409 | Agent 已在运行 |
| `TASK_NOT_FOUND` | 404 | 任务不存在 |
| `QUOTA_EXCEEDED` | 429 | 超出配额 |
| `INVALID_INPUT` | 400 | 输入参数无效 |
| `INTERNAL_ERROR` | 500 | 内部错误 |

---

### 4.2 核心 API 端点

#### Agent 管理
```http
# 创建 Agent
POST /api/v1/agents
Content-Type: application/json

{
  "name": "code-reviewer",
  "description": "Review code changes",
  "version": "1.0.0",
  "config": {
    "capabilities": ["code_review", "bug_detection"],
    "llm": {
      "provider": "anthropic",
      "model": "claude-opus-4-8",
      "max_tokens": 200000
    },
    "tools": ["github", "eslint"]
  },
  "resource_limits": {
    "max_concurrent": 5,
    "token_quota": 5000000
  }
}

# 响应
{
  "success": true,
  "data": {
    "id": "agent-xxx",
    "name": "code-reviewer",
    "version": "1.0.0",
    "status": "draft",
    "created_at": "2026-07-03T10:00:00Z"
  }
}

# 启动 Agent
POST /api/v1/agents/{agent_id}/start

# 停止 Agent
POST /api/v1/agents/{agent_id}/stop
```

#### 任务管理
```http
# 提交任务
POST /api/v1/tasks
Content-Type: application/json

{
  "agent": "code-reviewer",
  "priority": "high",
  "input": {
    "repository": "acme/widget",
    "pr_number": 123
  },
  "options": {
    "timeout": "600s",
    "callback_url": "https://..."
  }
}

# 获取任务状态
GET /api/v1/tasks/{task_id}

# 响应
{
  "success": true,
  "data": {
    "id": "task-xxx",
    "status": "running",
    "agent": "code-reviewer",
    "input": { ... },
    "output": null,
    "created_at": "2026-07-03T10:00:00Z",
    "started_at": "2026-07-03T10:00:01Z"
  }
}

# 取消任务
DELETE /api/v1/tasks/{task_id}

# 获取任务日志
GET /api/v1/tasks/{task_id}/logs
```

#### 工作流
```http
# 创建工作流
POST /api/v1/workflows
Content-Type: application/json

{
  "name": "code-review-pipeline",
  "description": "Complete code review workflow",
  "definition": {
    "steps": [
      {
        "name": "fetch-changes",
        "agent": "github-fetcher",
        "output_to": "changes"
      },
      {
        "name": "security-scan",
        "agent": "security-scanner",
        "input_from": ["changes"],
        "parallel": true
      }
    ]
  }
}

# 执行工作流
POST /api/v1/workflows/{workflow_id}/execute
Content-Type: application/json

{
  "input": {
    "repository": "acme/widget",
    "pr_number": 123
  }
}
```

#### 监控指标
```http
# 查询任务指标
GET /api/v1/metrics/tasks?from=-24h&by=agent

# 响应
{
  "success": true,
  "data": {
    "period": { "start": "2026-07-02T10:00:00Z", "end": "2026-07-03T10:00:00Z" },
    "total": 1250,
    "by_agent": [
      { "agent": "code-reviewer", "count": 800 },
      { "agent": "test-generator", "count": 450 }
    ]
  }
}

# 查询延迟
GET /api/v1/metrics/latency?percentile=p99&from=-24h

# 查询成本
GET /api/v1/costs/report?from=-30d
```

---

### 4.3 WebSocket 协议

#### 连接
```
ws://api/v1/stream?token={jwt_token}
```

#### 订阅消息
```json
// 订阅所有任务
{ "action": "subscribe", "resource": "tasks" }

// 订阅特定任务
{ "action": "subscribe", "resource": "task", "task_id": "task-xxx" }

// 订阅 Agent 状态
{ "action": "subscribe", "resource": "agent", "agent_id": "agent-xxx" }
```

#### 推送事件
```json
// 任务状态变更
{
  "type": "task.status_changed",
  "data": {
    "task_id": "task-xxx",
    "old_status": "running",
    "new_status": "succeeded",
    "timestamp": "2026-07-03T10:00:00Z"
  }
}

// 日志事件
{
  "type": "log.entry",
  "data": {
    "task_id": "task-xxx",
    "level": "info",
    "message": "Tool call completed",
    "timestamp": "2026-07-03T10:00:00Z"
  }
}
```

---

## 5. 技术选型

### 5.1 技术栈

| 组件 | 技术选型 | 理由 |
|-----|---------|------|
| **后端语言** | Go | 高性能、并发好、部署简单 |
| **Web 框架** | gin + gRPC | REST + 内部通信 |
| **前端框架** | React + TypeScript | 生态成熟 |
| **UI 组件** | shadcn/ui + Tailwind | 快速开发、可定制 |
| **数据库** | PostgreSQL 16+ | 成熟、JSONB 支持 |
| **缓存/队列** | Redis | 高性能、原生队列支持 |
| **日志存储** | ClickHouse | 时序数据、高性能聚合 |
| **监控** | Prometheus + Grafana | 标准方案 |
| **追踪** | OpenTelemetry + Jaeger | 分布式追踪标准 |
| **部署** | Docker + Compose (初期) / K8s (后期) | 容器化 |

---

### 5.2 LLM 集成

#### 抽象接口
```go
type LLMProvider interface {
    // 完成补全
    Complete(ctx context.Context, req *CompletionRequest) (*CompletionResponse, error)

    // 流式补全
    CompleteStream(ctx context.Context, req *CompletionRequest) (<-chan CompletionChunk, error)

    // 获取模型信息
    GetModelInfo(ctx context.Context, model string) (*ModelInfo, error)
}

type CompletionRequest struct {
    Model       string
    Messages    []Message
    MaxTokens   int
    Temperature float64
    Tools       []Tool
    Metadata    map[string]interface{}
}

type CompletionResponse struct {
    Content    string
    ToolCalls  []ToolCall
    Usage      TokenUsage
    Model      string
    FinishReason string
}
```

#### 支持的 Provider
| Provider | 状态 | 说明 |
|---------|------|------|
| Anthropic | ✓ | Claude 系列 |
| OpenAI | ✓ | GPT 系列 |
| 本地模型 | Phase 2 | Ollama / vLLM |

---

## 6. 部署架构

### 6.1 单机部署 (MVP)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: agent_manager
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    volumes:
      - redis_data:/data

  clickhouse:
    image: clickhouse/clickhouse-server
    volumes:
      - clickhouse_data:/var/lib/clickhouse

  control:
    build: ./services/control
    depends_on:
      - postgres
      - redis
    ports:
      - "8001:8000"

  scheduler:
    build: ./services/scheduler
    depends_on:
      - postgres
      - redis
    ports:
      - "8002:8000"

  agent_run:
    build: ./services/agent_run
    depends_on:
      - postgres
      - redis
    ports:
      - "8003:8000"

  api_gateway:
    build: ./gateway
    depends_on:
      - control
      - scheduler
      - agent_run
    ports:
      - "8080:8080"

  web:
    build: ./web
    ports:
      - "3000:80"
```

---

### 6.2 分布式部署 (生产)

```
┌─────────────────────────────────────────────────────────────────┐
│                        负载均衡                                  │
│                    (Nginx / ALB / SLB)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │ Node 1  │          │ Node 2  │          │ Node 3  │
   │         │          │         │          │         │
   │ Gateway │          │ Gateway │          │ Gateway │
   │ Control │          │ Control │          │ Control │
   │Scheduler│          │Scheduler│          │Scheduler│
   │AgentRun │          │AgentRun │          │AgentRun │
   └────┬────┘          └────┬────┘          └────┬────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼──────┐       ┌─────▼─────┐       ┌──────▼─────┐
   │PostgreSQL │       │   Redis   │       │ ClickHouse │
   │  (Master) │       │  Cluster  │       │   Cluster  │
   └────┬──────┘       └───────────┘       └────────────┘
        │
   ┌────▼──────┐
   │PostgreSQL │
   │ (Replica) │
   └───────────┘
```

---

## 7. 安全设计

### 7.1 认证流程

```
┌────────┐       ┌────────┐       ┌────────┐       ┌────────┐
│ Client │──────▶│ Gateway │──────▶│  Auth  │──────▶│Postgres│
└────────┘       └────────┘       └────────┘       └────────┘
    │                                   │
    │ 登录请求                           │ 验证密码
    │                                   │ 生成 JWT
    │◀──────────────────────────────────│ 返回 Token
    │ Token
    │
    │ 后续请求带 Token
    ├────────────────────────────────────▶│ 验证 Token
    │                                     │ 解析用户信息
    │◀────────────────────────────────────│ 放行/拒绝
```

### 7.2 权限模型

```go
// 角色定义
type Role string

const (
    RoleAdmin    Role = "admin"
    RoleOperator Role = "operator"
    RoleUser     Role = "user"
    RoleViewer   Role = "viewer"
)

// 权限定义
type Permission string

const (
    // Agent 权限
    PermAgentRead   Permission = "agent:read"
    PermAgentWrite  Permission = "agent:write"
    PermAgentDelete Permission = "agent:delete"

    // 任务权限
    PermTaskSubmit  Permission = "task:submit"
    PermTaskCancel  Permission = "task:cancel"
    PermTaskRead    Permission = "task:read"

    // 指标权限
    PermMetricsRead Permission = "metrics:read"

    // 用户权限
    PermUserManage  Permission = "user:manage"
)

// 角色权限映射
var RolePermissions = map[Role][]Permission{
    RoleAdmin: {
        PermAgentRead, PermAgentWrite, PermAgentDelete,
        PermTaskSubmit, PermTaskCancel, PermTaskRead,
        PermMetricsRead,
        PermUserManage,
    },
    RoleOperator: {
        PermAgentRead, PermAgentWrite,
        PermTaskSubmit, PermTaskCancel, PermTaskRead,
        PermMetricsRead,
    },
    RoleUser: {
        PermAgentRead,
        PermTaskSubmit, PermTaskRead,
        PermMetricsRead,
    },
    RoleViewer: {
        PermAgentRead,
        PermTaskRead,
        PermMetricsRead,
    },
}

// 检查权限
func HasPermission(user *User, perm Permission) bool {
    perms, ok := RolePermissions[user.Role]
    if !ok {
        return false
    }
    for _, p := range perms {
        if p == perm {
            return true
        }
    }
    return false
}
```

---

### 7.3 密钥管理

```go
// 敏感配置加密存储
type SecretService interface {
    // 存储密钥 (加密)
    StoreSecret(ctx context.Context, name, value string, scope []string) error

    // 获取密钥 (解密)
    GetSecret(ctx context.Context, name string) (string, error)

    // 删除密钥
    DeleteSecret(ctx context.Context, name string) error
}

// Agent 定义中引用
type AgentConfig struct {
    LLM LLMConfig `json:"llm"`
}

type LLMConfig struct {
    Provider string     `json:"provider"`
    Model    string     `json:"model"`
    APIKey   string     `json:"api_key,omitempty"` // 可选，支持引用
}

// 支持引用密钥
// api_key: "${secret:anthropic-api-key}"
```

---

## 8. 监控与可观测性

### 8.1 监控指标

| 指标 | 类型 | 标签 | 说明 |
|-----|------|------|------|
| `agent_tasks_total` | Counter | agent, status | 任务总数 |
| `agent_tasks_duration` | Histogram | agent, priority | 任务耗时 |
| `agent_tokens_consumed` | Counter | agent, model | Token 消耗 |
| `agent_queue_length` | Gauge | priority | 队列长度 |
| `agent_active_instances` | Gauge | agent | 活跃实例数 |
| `agent_llm_errors` | Counter | provider, error_type | LLM 错误 |

---

### 8.2 日志规范

```go
// 结构化日志
logger.Info("Task started",
    zap.String("task_id", taskID),
    zap.String("agent_id", agentID),
    zap.String("priority", priority),
)

// 关键事件
logger.Error("Task failed",
    zap.String("task_id", taskID),
    zap.Error(err),
    zap.String("error_type", "llm_timeout"),
)
```

---

### 8.3 分布式追踪

```go
import "go.opentelemetry.io/otel"

// 创建 Span
tracer := otel.Tracer("agent-run")
ctx, span := tracer.Start(ctx, "execute_task")
defer span.End()

span.SetAttributes(
    attribute.String("task_id", taskID),
    attribute.String("agent_id", agentID),
)

// 嵌套 Span
func callLLM(ctx context.Context) {
    _, llmSpan := tracer.Start(ctx, "llm_call")
    defer llmSpan.End()

    // ... 调用 LLM
}
```

---

## 附录

### A. 配置示例

```yaml
# config/config.yaml
server:
  port: 8080
  timeout: 30s

database:
  host: localhost
  port: 5432
  name: agent_manager
  user: postgres
  password: ${POSTGRES_PASSWORD}

redis:
  addr: localhost:6379
  password: ${REDIS_PASSWORD}
  db: 0

clickhouse:
  host: localhost
  port: 9000
  database: agent_logs

llm:
  anthropic:
    api_key: ${ANTHROPIC_API_KEY}
    base_url: https://api.anthropic.com
  openai:
    api_key: ${OPENAI_API_KEY}
    base_url: https://api.openai.com

logging:
  level: info
  format: json
```

---

### B. 参考文档

- [产品需求文档 (PRD.md)](./PRD.md)
- [架构图](https://www.figma.com/board/jDX9se4tz1zc1f8NtrpXgM)

---

**文档版本历史**

| 版本 | 日期 | 作者 | 变更说明 |
|-----|------|------|---------|
| 1.0 | 2026-07-03 | - | 初始版本，从原 PRD 拆分重构 |

---

*本文档描述技术设计，产品需求详见 [PRD.md](./PRD.md)*
