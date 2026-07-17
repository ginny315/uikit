import type { Task, TaskTimelineEvent } from '../types';

/**
 * 共享 Task mock 数据。
 * TaskListPage、TaskDetailPage 和 AgentDetailPage（按 agentId 过滤）共用此数据源，
 * 保证从 Agent 详情跳转到任务详情时 ID 一致。
 * Session 9 迁移到 MSW 后替换。
 *
 * 注意：agentId / agentName 必须与 mocks/agents.ts 中的记录对应。
 */
export const MOCK_TASKS: Task[] = [
  // ── 排队中 ──
  { id: 'task_9d55c', agentId: '1', agentName: 'code-reviewer', status: 'queued', priority: 2, input: '审查 PR #235', createdAt: '2026-07-15 10:33:00' },
  { id: 'task_b4e91', agentId: '3', agentName: 'test-generator', status: 'queued', priority: 3, input: '为 payment 模块新增的退款接口生成单元测试', createdAt: '2026-07-15 10:31:40' },
  { id: 'task_c7f02', agentId: '2', agentName: 'security-scanner', status: 'queued', priority: 1, input: '紧急扫描 CVE-2026-31337 是否影响生产依赖', createdAt: '2026-07-15 10:30:22' },
  { id: 'task_d1a58', agentId: '6', agentName: 'doc-writer', status: 'queued', priority: 4, input: '为 v0.9.0 发布生成变更日志草稿', createdAt: '2026-07-15 10:28:05' },

  // ── 运行中 ──
  { id: 'task_e8b33', agentId: '7', agentName: 'incident-responder', status: 'running', priority: 1, input: '处理告警 ALT-4471：api-gateway P99 延迟超过 2s', tokensUsed: 8200, createdAt: '2026-07-15 10:27:10', startedAt: '2026-07-15 10:27:12' },
  { id: 'task_f2c76', agentId: '13', agentName: 'log-analyzer', status: 'running', priority: 2, input: '分析过去 1 小时 auth-service 的 5xx 日志模式', tokensUsed: 3100, createdAt: '2026-07-15 10:25:48', startedAt: '2026-07-15 10:25:50' },
  { id: 'task_a3d19', agentId: '3', agentName: 'test-generator', status: 'running', priority: 3, input: '为 user-service 的 gRPC 接口补充集成测试', tokensUsed: 5400, createdAt: '2026-07-15 10:24:31', startedAt: '2026-07-15 10:24:35' },

  // ── 成功 ──
  { id: 'task_7a3f2', agentId: '1', agentName: 'code-reviewer', status: 'succeeded', priority: 3, input: '审查 PR #234 — 新增用户认证模块', output: '发现 3 个问题', duration: 12700, tokensUsed: 1420, createdAt: '2026-07-15 10:32:15', completedAt: '2026-07-15 10:32:28' },
  { id: 'task_g5e44', agentId: '4', agentName: 'slack-notifier', status: 'succeeded', priority: 4, input: '发送每日构建报告到 #eng-builds 频道', output: '消息已发送，3 人已读', duration: 1800, tokensUsed: 210, createdAt: '2026-07-15 10:20:00', startedAt: '2026-07-15 10:20:01', completedAt: '2026-07-15 10:20:03' },
  { id: 'task_h9f57', agentId: '2', agentName: 'security-scanner', status: 'succeeded', priority: 2, input: '扫描 frontend 仓库的 npm 依赖漏洞', output: '发现 2 个中危漏洞，已生成修复建议', duration: 45300, tokensUsed: 6800, createdAt: '2026-07-15 10:12:30', startedAt: '2026-07-15 10:12:33', completedAt: '2026-07-15 10:13:18' },
  { id: 'task_j2g80', agentId: '23', agentName: 'config-validator', status: 'succeeded', priority: 3, input: '校验 staging 环境的 Helm values 变更', output: '校验通过，无最佳实践违规', duration: 9200, tokensUsed: 1150, createdAt: '2026-07-15 10:08:14', startedAt: '2026-07-15 10:08:16', completedAt: '2026-07-15 10:08:25' },
  { id: 'task_k6h13', agentId: '10', agentName: 'email-assistant', status: 'succeeded', priority: 4, input: '分类今晨收到的 47 封客服邮件', output: '已分类：投诉 5 / 咨询 32 / 垃圾 10', duration: 28600, tokensUsed: 4300, createdAt: '2026-07-15 09:55:00', startedAt: '2026-07-15 09:55:02', completedAt: '2026-07-15 09:55:31' },
  { id: 'task_m8j35', agentId: '20', agentName: 'cost-optimizer', status: 'succeeded', priority: 3, input: '分析昨日 LLM 调用成本 Top 10 Agent', output: '建议 3 个 Agent 降级到 Haiku，预计日省 $42', duration: 18900, tokensUsed: 2700, createdAt: '2026-07-15 09:41:26', startedAt: '2026-07-15 09:41:30', completedAt: '2026-07-15 09:41:49' },
  { id: 'task_2a81b', agentId: '1', agentName: 'code-reviewer', status: 'succeeded', priority: 3, input: '审查 PR #233 — 修复登录页样式问题', output: '已通过', duration: 8900, tokensUsed: 980, createdAt: '2026-07-15 09:15:00', completedAt: '2026-07-15 09:15:09' },
  { id: 'task_n1k68', agentId: '24', agentName: 'alert-correlator', status: 'succeeded', priority: 2, input: '关联 09:00-09:10 期间的 12 条告警', output: '识别为同一根因：redis 主从切换抖动', duration: 6400, tokensUsed: 1900, createdAt: '2026-07-15 09:11:03', startedAt: '2026-07-15 09:11:05', completedAt: '2026-07-15 09:11:11' },
  { id: 'task_p4m92', agentId: '15', agentName: 'dependency-updater', status: 'succeeded', priority: 4, input: '检查 backend 仓库过期依赖并创建升级 PR', output: '已创建 PR #236：升级 6 个依赖', duration: 52100, tokensUsed: 3600, createdAt: '2026-07-15 08:52:47', startedAt: '2026-07-15 08:52:50', completedAt: '2026-07-15 08:53:42' },
  { id: 'task_q7n25', agentId: '18', agentName: 'api-doc-generator', status: 'succeeded', priority: 4, input: '从 proto 注解重新生成 Scheduler 服务 API 文档', output: '文档已更新至 Notion', duration: 15800, tokensUsed: 2200, createdAt: '2026-07-15 08:30:11', startedAt: '2026-07-15 08:30:15', completedAt: '2026-07-15 08:30:31' },
  { id: 'task_r5p38', agentId: '13', agentName: 'log-analyzer', status: 'succeeded', priority: 2, input: '排查 08:00 前后 scheduler 的任务堆积原因', output: '定位为 Redis 连接池耗尽，已生成报告', duration: 33400, tokensUsed: 5100, createdAt: '2026-07-15 08:15:29', startedAt: '2026-07-15 08:15:33', completedAt: '2026-07-15 08:16:06' },
  { id: 'task_1d77e', agentId: '1', agentName: 'code-reviewer', status: 'succeeded', priority: 2, input: '审查 PR #231 — 更新依赖版本', output: '有少量建议', duration: 15400, tokensUsed: 2100, createdAt: '2026-07-14 16:20:00', completedAt: '2026-07-14 16:20:15' },
  { id: 'task_s9q41', agentId: '16', agentName: 'schema-migrator', status: 'succeeded', priority: 2, input: '为 tasks 表新增 cancelled_at 字段生成迁移脚本', output: '迁移脚本已生成并通过 dry-run 验证', duration: 21700, tokensUsed: 2900, createdAt: '2026-07-14 15:44:52', startedAt: '2026-07-14 15:44:55', completedAt: '2026-07-14 15:45:17' },
  { id: 'task_t3r64', agentId: '21', agentName: 'sentiment-tracker', status: 'succeeded', priority: 4, input: '汇总本周用户反馈情感趋势', output: '正向 68% / 中性 24% / 负向 8%，负向集中在计费问题', duration: 40200, tokensUsed: 7400, createdAt: '2026-07-14 14:02:38', startedAt: '2026-07-14 14:02:41', completedAt: '2026-07-14 14:03:21' },
  { id: 'task_u6s87', agentId: '12', agentName: 'onboarding-buddy', status: 'succeeded', priority: 4, input: '回答新员工关于报销流程的 FAQ', output: '已回复并附上流程文档链接', duration: 4100, tokensUsed: 620, createdAt: '2026-07-14 11:30:15', startedAt: '2026-07-14 11:30:16', completedAt: '2026-07-14 11:30:20' },
  { id: 'task_v2t10', agentId: '22', agentName: 'backup-verifier', status: 'succeeded', priority: 3, input: '验证昨日 PostgreSQL 全量备份完整性', output: '校验和一致，恢复演练通过', duration: 96500, tokensUsed: 1300, createdAt: '2026-07-14 06:00:00', startedAt: '2026-07-14 06:00:02', completedAt: '2026-07-14 06:01:38' },

  // ── 失败 ──
  { id: 'task_6c33f', agentId: '1', agentName: 'code-reviewer', status: 'failed', priority: 4, input: '审查 PR #232 (紧急) — 安全漏洞热修复', duration: 2300, tokensUsed: 340, errorMessage: '仓库不可达', createdAt: '2026-07-15 08:45:00', startedAt: '2026-07-15 08:45:00', completedAt: '2026-07-15 08:45:02' },
  { id: 'task_w8u23', agentId: '8', agentName: 'release-bot', status: 'failed', priority: 1, input: '发布 v0.9.0 到生产环境', duration: 184000, tokensUsed: 9800, errorMessage: '部署后健康检查失败：api-gateway 就绪探针连续 5 次超时，已自动回滚', createdAt: '2026-07-15 09:30:00', startedAt: '2026-07-15 09:30:04', completedAt: '2026-07-15 09:33:04' },
  { id: 'task_x1v46', agentId: '17', agentName: 'compliance-checker', status: 'failed', priority: 2, input: '执行 SOC2 季度合规检查', duration: 67200, tokensUsed: 12400, errorMessage: 'Token 配额不足：任务执行中触达 Agent 每日配额上限', createdAt: '2026-07-15 07:12:33', startedAt: '2026-07-15 07:12:36', completedAt: '2026-07-15 07:13:43' },
  { id: 'task_y5w69', agentId: '2', agentName: 'security-scanner', status: 'failed', priority: 3, input: '扫描 legacy-api 仓库安全漏洞', duration: 8700, tokensUsed: 450, errorMessage: 'Trivy 工具调用失败：镜像仓库认证过期', createdAt: '2026-07-14 17:20:41', startedAt: '2026-07-14 17:20:44', completedAt: '2026-07-14 17:20:53' },
  { id: 'task_z9x82', agentId: '7', agentName: 'incident-responder', status: 'failed', priority: 1, input: '处理告警 ALT-4468：数据库主节点 CPU 饱和', duration: 45000, tokensUsed: 7100, errorMessage: 'LLM 调用超时（3 次重试均失败）', createdAt: '2026-07-14 13:05:17', startedAt: '2026-07-14 13:05:19', completedAt: '2026-07-14 13:06:04' },

  // ── 已取消 ──
  { id: 'task_ab105', agentId: '3', agentName: 'test-generator', status: 'cancelled', priority: 3, input: '为已废弃的 v1 API 生成回归测试', tokensUsed: 800, createdAt: '2026-07-15 09:02:11', startedAt: '2026-07-15 09:02:14', completedAt: '2026-07-15 09:03:40' },
  { id: 'task_bc228', agentId: '6', agentName: 'doc-writer', status: 'cancelled', priority: 4, input: '生成 Q2 架构演进文档初稿', createdAt: '2026-07-14 16:40:55', completedAt: '2026-07-14 16:52:08' },
  { id: 'task_cd351', agentId: '11', agentName: 'legal-reviewer', status: 'cancelled', priority: 2, input: '审核供应商合同 #SUP-2026-088', tokensUsed: 2600, createdAt: '2026-07-14 10:18:30', startedAt: '2026-07-14 10:18:33', completedAt: '2026-07-14 10:25:12' },
];

/**
 * 手写时间线 — 覆盖有代表性的场景（含 PRD 用户故事中的「重试后成功」）。
 * 其余任务由 getTaskTimeline() 按任务字段推导。
 */
const HANDCRAFTED_TIMELINES: Record<string, TaskTimelineEvent[]> = {
  // 成功 + 工具调用 + 一次重试（对应 PRD §用户故事：查看任务时间线）
  task_7a3f2: [
    { timestamp: '2026-07-15 10:32:15', type: 'enqueued', detail: '任务进入 Medium 队列' },
    { timestamp: '2026-07-15 10:32:16', type: 'assigned', detail: '分配给 code-reviewer (instance-2)' },
    { timestamp: '2026-07-15 10:32:17', type: 'tool_call', detail: 'github: 拉取 PR #234 diff（42 个文件）', duration: 1200 },
    { timestamp: '2026-07-15 10:32:18', type: 'llm_call', detail: 'Claude Opus 4.5 调用失败（网络超时）', duration: 3000 },
    { timestamp: '2026-07-15 10:32:21', type: 'retry', detail: '进入重试队列（第 1 次重试）' },
    { timestamp: '2026-07-15 10:32:22', type: 'llm_call', detail: 'Claude Opus 4.5 重试成功，输入 3.2K tokens', duration: 5800 },
    { timestamp: '2026-07-15 10:32:28', type: 'completed', detail: '审查完成：发现 3 个问题（1 个安全隐患、2 个规范问题）' },
  ],
  // 失败：工具调用出错
  task_6c33f: [
    { timestamp: '2026-07-15 08:45:00', type: 'enqueued', detail: '任务进入 Low 队列' },
    { timestamp: '2026-07-15 08:45:00', type: 'assigned', detail: '分配给 code-reviewer (instance-1)' },
    { timestamp: '2026-07-15 08:45:01', type: 'tool_call', detail: 'github: 拉取仓库失败 — connection refused', duration: 1800 },
    { timestamp: '2026-07-15 08:45:02', type: 'failed', detail: '仓库不可达，任务终止' },
  ],
  // 失败：发布回滚（多步骤工具调用）
  task_w8u23: [
    { timestamp: '2026-07-15 09:30:00', type: 'enqueued', detail: '任务进入 Critical 队列' },
    { timestamp: '2026-07-15 09:30:04', type: 'assigned', detail: '分配给 release-bot (instance-1)' },
    { timestamp: '2026-07-15 09:30:05', type: 'tool_call', detail: 'docker: 构建镜像 v0.9.0', duration: 68000 },
    { timestamp: '2026-07-15 09:31:13', type: 'tool_call', detail: 'kubectl: 滚动更新 deployment/api-gateway', duration: 24000 },
    { timestamp: '2026-07-15 09:31:37', type: 'llm_call', detail: '分析就绪探针失败日志', duration: 12000 },
    { timestamp: '2026-07-15 09:31:49', type: 'tool_call', detail: 'kubectl: 自动回滚至 v0.8.3', duration: 75000 },
    { timestamp: '2026-07-15 09:33:04', type: 'failed', detail: '健康检查失败，发布已回滚' },
  ],
  // 运行中：告警处理进行时
  task_e8b33: [
    { timestamp: '2026-07-15 10:27:10', type: 'enqueued', detail: '任务进入 Critical 队列' },
    { timestamp: '2026-07-15 10:27:12', type: 'assigned', detail: '分配给 incident-responder (instance-3)' },
    { timestamp: '2026-07-15 10:27:13', type: 'tool_call', detail: 'pagerduty: 认领告警 ALT-4471', duration: 900 },
    { timestamp: '2026-07-15 10:27:14', type: 'llm_call', detail: '分析 api-gateway 延迟指标与 trace 采样' },
  ],
  // 已取消：运行中被人工取消
  task_ab105: [
    { timestamp: '2026-07-15 09:02:11', type: 'enqueued', detail: '任务进入 Medium 队列' },
    { timestamp: '2026-07-15 09:02:14', type: 'assigned', detail: '分配给 test-generator (instance-1)' },
    { timestamp: '2026-07-15 09:02:15', type: 'llm_call', detail: '生成测试用例中…', duration: 85000 },
    { timestamp: '2026-07-15 09:03:40', type: 'cancelled', detail: '用户手动取消：v1 API 已废弃，无需回归测试' },
  ],
};

const PRIORITY_QUEUE_NAMES: Record<number, string> = {
  1: 'Critical',
  2: 'High',
  3: 'Medium',
  4: 'Low',
};

/**
 * 获取任务时间线：优先返回手写场景，否则按任务字段推导一条合理的时间线。
 */
export function getTaskTimeline(task: Task): TaskTimelineEvent[] {
  const handcrafted = HANDCRAFTED_TIMELINES[task.id];
  if (handcrafted) return handcrafted;

  const events: TaskTimelineEvent[] = [
    { timestamp: task.createdAt, type: 'enqueued', detail: `任务进入 ${PRIORITY_QUEUE_NAMES[task.priority]} 队列` },
  ];

  if (task.status === 'queued') return events;

  events.push({
    timestamp: task.startedAt ?? task.createdAt,
    type: 'assigned',
    detail: `分配给 ${task.agentName}`,
  });
  events.push({
    timestamp: task.startedAt ?? task.createdAt,
    type: 'llm_call',
    detail: task.status === 'running' ? 'LLM 调用执行中…' : 'LLM 调用完成',
    duration: task.status === 'running' ? undefined : task.duration,
  });

  if (task.status === 'succeeded') {
    events.push({ timestamp: task.completedAt ?? task.createdAt, type: 'completed', detail: task.output ?? '任务执行成功' });
  } else if (task.status === 'failed') {
    events.push({ timestamp: task.completedAt ?? task.createdAt, type: 'failed', detail: task.errorMessage ?? '任务执行失败' });
  } else if (task.status === 'cancelled') {
    events.push({ timestamp: task.completedAt ?? task.createdAt, type: 'cancelled', detail: '任务已被取消' });
  }

  return events;
}
