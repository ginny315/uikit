/**
 * 中心化 Mock 数据库
 *
 * Session 9: 所有 mock 数据统一从此文件导出，MSW handlers 直接引用。
 */

import type {
  Agent,
  Task,
  TaskTimelineEvent,
  LogEntry,
  WorkflowSummary,
  WorkflowDetail,
  User,
  ApiKey,
  Webhook,
} from '../types';

// ═══════════════════════════════════════════════════════════════
// Agents
// ═══════════════════════════════════════════════════════════════
export const dbAgents: Agent[] = [
  { id: '1', name: 'code-reviewer', description: '自动审查 PR 代码，检查代码规范与潜在 Bug', status: 'running', llmProvider: 'Anthropic', llmModel: 'Claude Opus 4.5', tools: ['github', 'gitlab'], dailyTokenQuota: 500000, todayTokens: 142000, todayTasks: 47, createdAt: '2026-07-01', updatedAt: '2026-07-15' },
  { id: '2', name: 'security-scanner', description: '扫描项目依赖与代码安全漏洞，生成修复建议', status: 'running', llmProvider: 'Anthropic', llmModel: 'Claude Sonnet 4.5', tools: ['snyk', 'trivy'], dailyTokenQuota: 300000, todayTokens: 89000, todayTasks: 23, createdAt: '2026-07-02', updatedAt: '2026-07-15' },
  { id: '3', name: 'test-generator', description: '基于代码变更自动生成单元测试与集成测试', status: 'running', llmProvider: 'OpenAI', llmModel: 'GPT-4o', tools: ['jest', 'pytest'], dailyTokenQuota: 400000, todayTokens: 256000, todayTasks: 89, createdAt: '2026-07-03', updatedAt: '2026-07-14' },
  { id: '4', name: 'slack-notifier', description: '监听系统事件并发送 Slack 通知', status: 'running', llmProvider: 'OpenAI', llmModel: 'GPT-4o-mini', tools: ['slack'], dailyTokenQuota: 50000, todayTokens: 12000, todayTasks: 156, createdAt: '2026-07-05', updatedAt: '2026-07-15' },
  { id: '5', name: 'data-analyzer', description: '分析数据库查询性能并给出优化建议', status: 'stopped', llmProvider: 'Anthropic', llmModel: 'Claude Opus 4.5', tools: ['postgres', 'clickhouse'], dailyTokenQuota: 600000, todayTokens: 0, todayTasks: 0, createdAt: '2026-07-06', updatedAt: '2026-07-10' },
  { id: '6', name: 'doc-writer', description: '基于代码自动生成 API 文档与变更日志', status: 'running', llmProvider: 'OpenAI', llmModel: 'GPT-4o', tools: ['github', 'notion'], dailyTokenQuota: 200000, todayTokens: 98000, todayTasks: 34, createdAt: '2026-07-08', updatedAt: '2026-07-15' },
  { id: '7', name: 'incident-responder', description: '自动响应监控告警，执行预定义修复流程', status: 'running', llmProvider: 'Anthropic', llmModel: 'Claude Sonnet 4.5', tools: ['pagerduty', 'slack', 'kubectl'], dailyTokenQuota: 800000, todayTokens: 310000, todayTasks: 12, createdAt: '2026-07-09', updatedAt: '2026-07-15' },
  { id: '8', name: 'release-bot', description: '自动化发布流程：构建、测试、部署、回滚', status: 'error', llmProvider: 'Anthropic', llmModel: 'Claude Opus 4.5', tools: ['docker', 'kubectl', 'github'], dailyTokenQuota: 500000, todayTokens: 450000, todayTasks: 6, createdAt: '2026-07-10', updatedAt: '2026-07-15' },
  { id: '9', name: 'sql-translator', description: '自然语言转 SQL，支持多方言', status: 'stopped', llmProvider: 'OpenAI', llmModel: 'GPT-4o-mini', tools: ['postgres', 'mysql'], dailyTokenQuota: 100000, todayTokens: 0, todayTasks: 0, createdAt: '2026-07-12', updatedAt: '2026-07-12' },
  { id: '10', name: 'email-assistant', description: '智能分类与回复邮件', status: 'running', llmProvider: 'OpenAI', llmModel: 'GPT-4o', tools: ['gmail', 'outlook'], dailyTokenQuota: 150000, todayTokens: 67000, todayTasks: 201, createdAt: '2026-07-13', updatedAt: '2026-07-15' },
  { id: '11', name: 'legal-reviewer', description: '审核合同条款，标记风险项并给出修改建议', status: 'running', llmProvider: 'Anthropic', llmModel: 'Claude Opus 4.5', tools: ['notion'], dailyTokenQuota: 700000, todayTokens: 520000, todayTasks: 8, createdAt: '2026-07-14', updatedAt: '2026-07-15' },
  { id: '12', name: 'onboarding-buddy', description: '新员工入职引导与 FAQ 问答', status: 'running', llmProvider: 'OpenAI', llmModel: 'GPT-4o-mini', tools: ['slack', 'notion'], dailyTokenQuota: 80000, todayTokens: 34000, todayTasks: 67, createdAt: '2026-07-14', updatedAt: '2026-07-15' },
  { id: '13', name: 'log-analyzer', description: '实时分析日志流，检测异常模式并告警', status: 'running', llmProvider: 'Anthropic', llmModel: 'Claude Sonnet 4.5', tools: ['clickhouse', 'slack'], dailyTokenQuota: 350000, todayTokens: 189000, todayTasks: 340, createdAt: '2026-07-01', updatedAt: '2026-07-15' },
  { id: '14', name: 'performance-profiler', description: '分析服务性能瓶颈，生成优化建议报告', status: 'stopped', llmProvider: 'OpenAI', llmModel: 'GPT-4o', tools: ['postgres', 'redis'], dailyTokenQuota: 250000, todayTokens: 0, todayTasks: 0, createdAt: '2026-07-03', updatedAt: '2026-07-08' },
  { id: '15', name: 'dependency-updater', description: '自动检测并更新项目依赖，创建 PR', status: 'running', llmProvider: 'Anthropic', llmModel: 'Claude Haiku 4.5', tools: ['github', 'gitlab'], dailyTokenQuota: 120000, todayTokens: 45000, todayTasks: 18, createdAt: '2026-07-04', updatedAt: '2026-07-15' },
  { id: '16', name: 'schema-migrator', description: '数据库 Schema 变更助手，生成迁移脚本并验证', status: 'running', llmProvider: 'OpenAI', llmModel: 'GPT-4o', tools: ['postgres', 'mysql', 'clickhouse'], dailyTokenQuota: 180000, todayTokens: 72000, todayTasks: 5, createdAt: '2026-07-05', updatedAt: '2026-07-14' },
  { id: '17', name: 'compliance-checker', description: '检查代码和基础设施是否符合 SOC2 合规要求', status: 'error', llmProvider: 'Anthropic', llmModel: 'Claude Opus 4.5', tools: ['github', 'kubectl', 'notion'], dailyTokenQuota: 400000, todayTokens: 380000, todayTasks: 3, createdAt: '2026-07-06', updatedAt: '2026-07-15' },
  { id: '18', name: 'api-doc-generator', description: '从代码注解和流量自动生成 OpenAPI 文档', status: 'running', llmProvider: 'OpenAI', llmModel: 'GPT-4o-mini', tools: ['github', 'notion'], dailyTokenQuota: 90000, todayTokens: 31000, todayTasks: 45, createdAt: '2026-07-07', updatedAt: '2026-07-15' },
  { id: '19', name: 'incident-postmortem', description: '故障后自动生成复盘报告，包含时间线和改进建议', status: 'stopped', llmProvider: 'Anthropic', llmModel: 'Claude Opus 4.5', tools: ['pagerduty', 'slack', 'notion'], dailyTokenQuota: 300000, todayTokens: 0, todayTasks: 0, createdAt: '2026-07-08', updatedAt: '2026-07-08' },
  { id: '20', name: 'cost-optimizer', description: '分析 LLM 调用成本，推荐模型降级和缓存策略', status: 'running', llmProvider: 'OpenAI', llmModel: 'GPT-4o-mini', tools: ['postgres', 'clickhouse'], dailyTokenQuota: 60000, todayTokens: 28000, todayTasks: 12, createdAt: '2026-07-09', updatedAt: '2026-07-15' },
  { id: '21', name: 'sentiment-tracker', description: '监控用户反馈渠道的情感倾向变化', status: 'running', llmProvider: 'Anthropic', llmModel: 'Claude Haiku 4.5', tools: ['slack', 'gmail'], dailyTokenQuota: 100000, todayTokens: 56000, todayTasks: 230, createdAt: '2026-07-10', updatedAt: '2026-07-15' },
  { id: '22', name: 'backup-verifier', description: '定期验证备份完整性并生成验证报告', status: 'running', llmProvider: 'OpenAI', llmModel: 'GPT-4o-mini', tools: ['docker', 'postgres'], dailyTokenQuota: 40000, todayTokens: 15000, todayTasks: 4, createdAt: '2026-07-11', updatedAt: '2026-07-15' },
  { id: '23', name: 'config-validator', description: '验证 K8s 配置和 Helm Chart 的语法与最佳实践', status: 'running', llmProvider: 'Anthropic', llmModel: 'Claude Sonnet 4.5', tools: ['kubectl', 'github'], dailyTokenQuota: 200000, todayTokens: 88000, todayTasks: 76, createdAt: '2026-07-12', updatedAt: '2026-07-15' },
  { id: '24', name: 'alert-correlator', description: '关联多个告警源，识别根因并抑制重复告警', status: 'running', llmProvider: 'Anthropic', llmModel: 'Claude Haiku 4.5', tools: ['pagerduty', 'slack', 'clickhouse'], dailyTokenQuota: 160000, todayTokens: 94000, todayTasks: 145, createdAt: '2026-07-13', updatedAt: '2026-07-15' },
  { id: '25', name: 'i18n-helper', description: '自动化翻译和国际化文件管理', status: 'stopped', llmProvider: 'OpenAI', llmModel: 'GPT-4o-mini', tools: ['github', 'notion'], dailyTokenQuota: 75000, todayTokens: 0, todayTasks: 0, createdAt: '2026-07-14', updatedAt: '2026-07-14' },
];

// ═══════════════════════════════════════════════════════════════
// Tasks
// ═══════════════════════════════════════════════════════════════
export const dbTasks: Task[] = [
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

// ═══════════════════════════════════════════════════════════════
// Task Timelines
// ═══════════════════════════════════════════════════════════════
const PRIORITY_QUEUE_NAMES: Record<number, string> = { 1: 'Critical', 2: 'High', 3: 'Medium', 4: 'Low' };

export const dbTimelines: Record<string, TaskTimelineEvent[]> = {
  task_7a3f2: [
    { timestamp: '2026-07-15 10:32:15', type: 'enqueued', detail: '任务进入 Medium 队列' },
    { timestamp: '2026-07-15 10:32:16', type: 'assigned', detail: '分配给 code-reviewer (instance-2)' },
    { timestamp: '2026-07-15 10:32:17', type: 'tool_call', detail: 'github: 拉取 PR #234 diff（42 个文件）', duration: 1200 },
    { timestamp: '2026-07-15 10:32:18', type: 'llm_call', detail: 'Claude Opus 4.5 调用失败（网络超时）', duration: 3000 },
    { timestamp: '2026-07-15 10:32:21', type: 'retry', detail: '进入重试队列（第 1 次重试）' },
    { timestamp: '2026-07-15 10:32:22', type: 'llm_call', detail: 'Claude Opus 4.5 重试成功，输入 3.2K tokens', duration: 5800 },
    { timestamp: '2026-07-15 10:32:28', type: 'completed', detail: '审查完成：发现 3 个问题（1 个安全隐患、2 个规范问题）' },
  ],
  task_6c33f: [
    { timestamp: '2026-07-15 08:45:00', type: 'enqueued', detail: '任务进入 Low 队列' },
    { timestamp: '2026-07-15 08:45:00', type: 'assigned', detail: '分配给 code-reviewer (instance-1)' },
    { timestamp: '2026-07-15 08:45:01', type: 'tool_call', detail: 'github: 拉取仓库失败 — connection refused', duration: 1800 },
    { timestamp: '2026-07-15 08:45:02', type: 'failed', detail: '仓库不可达，任务终止' },
  ],
  task_w8u23: [
    { timestamp: '2026-07-15 09:30:00', type: 'enqueued', detail: '任务进入 Critical 队列' },
    { timestamp: '2026-07-15 09:30:04', type: 'assigned', detail: '分配给 release-bot (instance-1)' },
    { timestamp: '2026-07-15 09:30:05', type: 'tool_call', detail: 'docker: 构建镜像 v0.9.0', duration: 68000 },
    { timestamp: '2026-07-15 09:31:13', type: 'tool_call', detail: 'kubectl: 滚动更新 deployment/api-gateway', duration: 24000 },
    { timestamp: '2026-07-15 09:31:37', type: 'llm_call', detail: '分析就绪探针失败日志', duration: 12000 },
    { timestamp: '2026-07-15 09:31:49', type: 'tool_call', detail: 'kubectl: 自动回滚至 v0.8.3', duration: 75000 },
    { timestamp: '2026-07-15 09:33:04', type: 'failed', detail: '健康检查失败，发布已回滚' },
  ],
  task_e8b33: [
    { timestamp: '2026-07-15 10:27:10', type: 'enqueued', detail: '任务进入 Critical 队列' },
    { timestamp: '2026-07-15 10:27:12', type: 'assigned', detail: '分配给 incident-responder (instance-3)' },
    { timestamp: '2026-07-15 10:27:13', type: 'tool_call', detail: 'pagerduty: 认领告警 ALT-4471', duration: 900 },
    { timestamp: '2026-07-15 10:27:14', type: 'llm_call', detail: '分析 api-gateway 延迟指标与 trace 采样' },
  ],
  task_ab105: [
    { timestamp: '2026-07-15 09:02:11', type: 'enqueued', detail: '任务进入 Medium 队列' },
    { timestamp: '2026-07-15 09:02:14', type: 'assigned', detail: '分配给 test-generator (instance-1)' },
    { timestamp: '2026-07-15 09:02:15', type: 'llm_call', detail: '生成测试用例中…', duration: 85000 },
    { timestamp: '2026-07-15 09:03:40', type: 'cancelled', detail: '用户手动取消：v1 API 已废弃，无需回归测试' },
  ],
};

export function deriveTimeline(task: Task): TaskTimelineEvent[] {
  const handcrafted = dbTimelines[task.id];
  if (handcrafted) return handcrafted;

  const events: TaskTimelineEvent[] = [
    { timestamp: task.createdAt, type: 'enqueued', detail: `任务进入 ${PRIORITY_QUEUE_NAMES[task.priority]} 队列` },
  ];
  if (task.status === 'queued') return events;

  events.push({ timestamp: task.startedAt ?? task.createdAt, type: 'assigned', detail: `分配给 ${task.agentName}` });
  events.push({ timestamp: task.startedAt ?? task.createdAt, type: 'llm_call', detail: task.status === 'running' ? 'LLM 调用执行中…' : 'LLM 调用完成', duration: task.status === 'running' ? undefined : task.duration });

  if (task.status === 'succeeded') {
    events.push({ timestamp: task.completedAt ?? task.createdAt, type: 'completed', detail: task.output ?? '任务执行成功' });
  } else if (task.status === 'failed') {
    events.push({ timestamp: task.completedAt ?? task.createdAt, type: 'failed', detail: task.errorMessage ?? '任务执行失败' });
  } else if (task.status === 'cancelled') {
    events.push({ timestamp: task.completedAt ?? task.createdAt, type: 'cancelled', detail: '任务已被取消' });
  }
  return events;
}

// ═══════════════════════════════════════════════════════════════
// Logs (abbreviated — full list in original mocks/logs.ts)
// ═══════════════════════════════════════════════════════════════
export const dbLogs: LogEntry[] = [
  // ── 今日日志 ──
  { id: 'log_t001', timestamp: '2026-07-20 08:15:22.100', level: 'info', agentId: '1', agentName: 'code-reviewer', taskId: 'task_today01', instanceId: 'code-reviewer-2', traceId: 'trace_today_a1', spanId: 'span_ta01', message: '今日任务：审查 PR #312 — 新增支付模块', fields: { queue: 'high', depth: 1 } },
  { id: 'log_t002', timestamp: '2026-07-20 08:15:25.340', level: 'debug', agentId: '1', agentName: 'code-reviewer', taskId: 'task_today01', instanceId: 'code-reviewer-2', traceId: 'trace_today_a1', spanId: 'span_ta02', message: 'github 拉取 PR #312 diff（18 个文件，+620/-45）', fields: { tool: 'github', durationMs: 800 } },
  { id: 'log_t003', timestamp: '2026-07-20 08:16:01.780', level: 'warn', agentId: '1', agentName: 'code-reviewer', taskId: 'task_today01', instanceId: 'code-reviewer-2', traceId: 'trace_today_a1', spanId: 'span_ta03', message: 'LLM 调用延迟偏高（5800ms），未触发超时', fields: { model: 'Claude Opus 4.5', durationMs: 5800 } },
  { id: 'log_t004', timestamp: '2026-07-20 09:20:44.512', level: 'info', agentId: '8', agentName: 'release-bot', taskId: 'task_today02', instanceId: 'release-bot-1', traceId: 'trace_today_b1', spanId: 'span_tb01', message: 'v0.10.0 发布审批通过，开始部署流程', fields: { queue: 'critical', approver: 'ops-lead@agentsys.dev' } },
  { id: 'log_t005', timestamp: '2026-07-20 09:42:18.903', level: 'error', agentId: '8', agentName: 'release-bot', taskId: 'task_today02', instanceId: 'release-bot-1', traceId: 'trace_today_b1', spanId: 'span_tb02', message: '数据库迁移脚本执行失败：users 表字段冲突', fields: { tool: 'db-migrate', durationMs: 13400, sqlFile: 'V0.10.0__add_payment_method.sql' } },
  // trace_a1b2c3d4: task_7a3f2
  { id: 'log_0001', timestamp: '2026-07-15 10:32:15.102', level: 'info', agentId: '1', agentName: 'code-reviewer', taskId: 'task_7a3f2', instanceId: 'code-reviewer-2', traceId: 'trace_a1b2c3d4', spanId: 'span_1a01', message: '任务入队：审查 PR #234 — 新增用户认证模块', fields: { queue: 'medium', depth: 2 } },
  { id: 'log_0002', timestamp: '2026-07-15 10:32:16.244', level: 'debug', agentId: '1', agentName: 'code-reviewer', taskId: 'task_7a3f2', instanceId: 'code-reviewer-2', traceId: 'trace_a1b2c3d4', spanId: 'span_1a02', message: '调度器分配任务至实例 code-reviewer-2', fields: { schedulerNode: 'scheduler-0' } },
  { id: 'log_0003', timestamp: '2026-07-15 10:32:17.480', level: 'info', agentId: '1', agentName: 'code-reviewer', taskId: 'task_7a3f2', instanceId: 'code-reviewer-2', traceId: 'trace_a1b2c3d4', spanId: 'span_1a03', message: 'github 工具调用完成：拉取 PR #234 diff（42 个文件，+1832/-410）', fields: { tool: 'github', durationMs: 1200 } },
  { id: 'log_0004', timestamp: '2026-07-15 10:32:18.512', level: 'warn', agentId: '1', agentName: 'code-reviewer', taskId: 'task_7a3f2', instanceId: 'code-reviewer-2', traceId: 'trace_a1b2c3d4', spanId: 'span_1a04', message: 'LLM 调用超时（3000ms），准备重试', fields: { model: 'Claude Opus 4.5', timeoutMs: 3000, retryCount: 0 } },
  { id: 'log_0005', timestamp: '2026-07-15 10:32:21.033', level: 'info', agentId: '1', agentName: 'code-reviewer', taskId: 'task_7a3f2', instanceId: 'code-reviewer-2', traceId: 'trace_a1b2c3d4', spanId: 'span_1a05', message: '任务进入重试队列（第 1 次重试，退避 1000ms）', fields: { retryCount: 1, backoffMs: 1000 } },
  { id: 'log_0006', timestamp: '2026-07-15 10:32:22.190', level: 'info', agentId: '1', agentName: 'code-reviewer', taskId: 'task_7a3f2', instanceId: 'code-reviewer-2', traceId: 'trace_a1b2c3d4', spanId: 'span_1a06', message: 'LLM 调用成功', fields: { model: 'Claude Opus 4.5', tokensIn: 3200, tokensOut: 940, durationMs: 5800 } },
  { id: 'log_0007', timestamp: '2026-07-15 10:32:28.077', level: 'info', agentId: '1', agentName: 'code-reviewer', taskId: 'task_7a3f2', instanceId: 'code-reviewer-2', traceId: 'trace_a1b2c3d4', spanId: 'span_1a07', message: '任务完成：发现 3 个问题（1 个安全隐患、2 个规范问题）', fields: { durationMs: 12700, tokensUsed: 1420 } },
  // trace_b2c3d4e5: task_w8u23
  { id: 'log_0010', timestamp: '2026-07-15 09:30:00.315', level: 'info', agentId: '8', agentName: 'release-bot', taskId: 'task_w8u23', instanceId: 'release-bot-1', traceId: 'trace_b2c3d4e5', spanId: 'span_2b01', message: '任务入队：发布 v0.9.0 到生产环境', fields: { queue: 'critical', depth: 0 } },
  { id: 'log_0011', timestamp: '2026-07-15 09:30:05.128', level: 'info', agentId: '8', agentName: 'release-bot', taskId: 'task_w8u23', instanceId: 'release-bot-1', traceId: 'trace_b2c3d4e5', spanId: 'span_2b02', message: 'docker 构建开始：registry.internal/agentsys/api-gateway:v0.9.0', fields: { tool: 'docker' } },
  { id: 'log_0012', timestamp: '2026-07-15 09:31:13.340', level: 'info', agentId: '8', agentName: 'release-bot', taskId: 'task_w8u23', instanceId: 'release-bot-1', traceId: 'trace_b2c3d4e5', spanId: 'span_2b03', message: 'docker 构建完成，镜像已推送', fields: { tool: 'docker', durationMs: 68000, imageSizeMb: 142 } },
  { id: 'log_0013', timestamp: '2026-07-15 09:31:37.882', level: 'warn', agentId: '8', agentName: 'release-bot', taskId: 'task_w8u23', instanceId: 'release-bot-1', traceId: 'trace_b2c3d4e5', spanId: 'span_2b04', message: '就绪探针首次失败：GET /healthz 连接超时', fields: { tool: 'kubectl', probe: 'readiness', attempt: 1 } },
  { id: 'log_0014', timestamp: '2026-07-15 09:31:49.024', level: 'error', agentId: '8', agentName: 'release-bot', taskId: 'task_w8u23', instanceId: 'release-bot-1', traceId: 'trace_b2c3d4e5', spanId: 'span_2b05', message: '就绪探针连续 5 次超时，触发自动回滚', fields: { tool: 'kubectl', probe: 'readiness', attempt: 5 } },
  { id: 'log_0015', timestamp: '2026-07-15 09:33:04.777', level: 'error', agentId: '8', agentName: 'release-bot', taskId: 'task_w8u23', instanceId: 'release-bot-1', traceId: 'trace_b2c3d4e5', spanId: 'span_2b06', message: '任务失败：健康检查未通过，已回滚至 v0.8.3', fields: { durationMs: 184000, rollbackTo: 'v0.8.3' } },
  // trace_c3d4e5f6: task_e8b33
  { id: 'log_0020', timestamp: '2026-07-15 10:27:10.516', level: 'info', agentId: '7', agentName: 'incident-responder', taskId: 'task_e8b33', instanceId: 'incident-responder-3', traceId: 'trace_c3d4e5f6', spanId: 'span_3c01', message: '任务入队：处理告警 ALT-4471（api-gateway P99 延迟超过 2s）', fields: { queue: 'critical', depth: 1 } },
  { id: 'log_0021', timestamp: '2026-07-15 10:27:13.209', level: 'info', agentId: '7', agentName: 'incident-responder', taskId: 'task_e8b33', instanceId: 'incident-responder-3', traceId: 'trace_c3d4e5f6', spanId: 'span_3c02', message: 'pagerduty 工具调用完成：认领告警 ALT-4471', fields: { tool: 'pagerduty', durationMs: 900 } },
  { id: 'log_0022', timestamp: '2026-07-15 10:27:14.653', level: 'debug', agentId: '7', agentName: 'incident-responder', taskId: 'task_e8b33', instanceId: 'incident-responder-3', traceId: 'trace_c3d4e5f6', spanId: 'span_3c03', message: '拉取 api-gateway 最近 15 分钟 P99 延迟指标与 trace 采样', fields: { samples: 200 } },
  { id: 'log_0023', timestamp: '2026-07-15 10:28:02.114', level: 'warn', agentId: '7', agentName: 'incident-responder', taskId: 'task_e8b33', instanceId: 'incident-responder-3', traceId: 'trace_c3d4e5f6', spanId: 'span_3c04', message: '初步定位：Redis 连接池等待时间异常（平均 340ms）', fields: { redisPoolWaitMs: 340 } },
];

// ═══════════════════════════════════════════════════════════════
// Workflows
// ═══════════════════════════════════════════════════════════════
export const dbWorkflowSummaries: WorkflowSummary[] = [
  { id: 'wf_pr_review', name: 'PR Review Pipeline', description: 'PR 提交后自动进行代码审查和安全扫描，结果通知到 Slack', status: 'active', stepCount: 3, createdAt: '2026-07-10', updatedAt: '2026-07-20' },
  { id: 'wf_incident', name: 'Incident Response', description: '告警触发后自动分诊、分析日志并通知相关团队', status: 'active', stepCount: 3, createdAt: '2026-07-12', updatedAt: '2026-07-19' },
  { id: 'wf_daily_report', name: 'Daily Report Generator', description: '每日定时汇总各 Agent 运行报告并发送到指定频道', status: 'draft', stepCount: 4, createdAt: '2026-07-18', updatedAt: '2026-07-18' },
  { id: 'wf_data_pipeline', name: 'Data ETL Pipeline', description: '从多个数据源采集数据、清洗、分析并写入 ClickHouse', status: 'active', stepCount: 4, createdAt: '2026-07-05', updatedAt: '2026-07-20' },
];

export const dbWorkflowDetails: Record<string, WorkflowDetail> = {
  wf_pr_review: {
    id: 'wf_pr_review',
    name: 'PR Review Pipeline',
    description: 'PR 提交后自动进行代码审查和安全扫描，结果通知到 Slack',
    status: 'active',
    stepCount: 3,
    nodes: [
      { id: 'node_start', type: 'start', position: { x: 0, y: 0 }, data: { label: 'PR Opened' } },
      { id: 'node_1', type: 'agent', position: { x: 0, y: 0 }, data: { label: 'code-reviewer', agentId: '1' } },
      { id: 'node_2', type: 'agent', position: { x: 0, y: 0 }, data: { label: 'security-scanner', agentId: '2' } },
      { id: 'node_3', type: 'agent', position: { x: 0, y: 0 }, data: { label: 'slack-notifier', agentId: '4' } },
      { id: 'node_end', type: 'end', position: { x: 0, y: 0 }, data: { label: 'Done' } },
    ],
    edges: [
      { id: 'e_start_1', source: 'node_start', target: 'node_1' },
      { id: 'e_start_2', source: 'node_start', target: 'node_2' },
      { id: 'e_1_3', source: 'node_1', target: 'node_3' },
      { id: 'e_2_3', source: 'node_2', target: 'node_3' },
      { id: 'e_3_end', source: 'node_3', target: 'node_end' },
    ],
    createdAt: '2026-07-10',
    updatedAt: '2026-07-20',
  },
  wf_incident: {
    id: 'wf_incident',
    name: 'Incident Response',
    description: '告警触发后自动分诊、分析日志并通知相关团队',
    status: 'active',
    stepCount: 2,
    nodes: [
      { id: 'node_start', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Alert Fired' } },
      { id: 'node_1', type: 'agent', position: { x: 0, y: 0 }, data: { label: 'incident-responder', agentId: '7' } },
      { id: 'node_2', type: 'agent', position: { x: 0, y: 0 }, data: { label: 'log-analyzer', agentId: '13' } },
      { id: 'node_end', type: 'end', position: { x: 0, y: 0 }, data: { label: 'Resolved' } },
    ],
    edges: [
      { id: 'e_start_1', source: 'node_start', target: 'node_1' },
      { id: 'e_1_2', source: 'node_1', target: 'node_2' },
      { id: 'e_2_end', source: 'node_2', target: 'node_end' },
    ],
    createdAt: '2026-07-12',
    updatedAt: '2026-07-19',
  },
  wf_daily_report: {
    id: 'wf_daily_report',
    name: 'Daily Report Generator',
    description: '每日定时汇总各 Agent 运行报告并发送到指定频道',
    status: 'draft',
    stepCount: 3,
    nodes: [
      { id: 'node_start', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Scheduled 9:00' } },
      { id: 'node_1', type: 'agent', position: { x: 0, y: 0 }, data: { label: 'data-analyzer', agentId: '5' } },
      { id: 'node_2', type: 'agent', position: { x: 0, y: 0 }, data: { label: 'cost-optimizer', agentId: '20' } },
      { id: 'node_3', type: 'agent', position: { x: 0, y: 0 }, data: { label: 'doc-writer', agentId: '6' } },
      { id: 'node_end', type: 'end', position: { x: 0, y: 0 }, data: { label: 'Published' } },
    ],
    edges: [
      { id: 'e_start_1', source: 'node_start', target: 'node_1' },
      { id: 'e_start_2', source: 'node_start', target: 'node_2' },
      { id: 'e_1_3', source: 'node_1', target: 'node_3' },
      { id: 'e_2_3', source: 'node_2', target: 'node_3' },
      { id: 'e_3_end', source: 'node_3', target: 'node_end' },
    ],
    createdAt: '2026-07-18',
    updatedAt: '2026-07-18',
  },
  wf_data_pipeline: {
    id: 'wf_data_pipeline',
    name: 'Data ETL Pipeline',
    description: '从多个数据源采集数据、清洗、分析并写入 ClickHouse',
    status: 'active',
    stepCount: 3,
    nodes: [
      { id: 'node_start', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Triggered' } },
      { id: 'node_1', type: 'agent', position: { x: 0, y: 0 }, data: { label: 'log-analyzer', agentId: '13' } },
      { id: 'node_2', type: 'agent', position: { x: 0, y: 0 }, data: { label: 'data-analyzer', agentId: '5' } },
      { id: 'node_3', type: 'agent', position: { x: 0, y: 0 }, data: { label: 'schema-migrator', agentId: '16' } },
      { id: 'node_end', type: 'end', position: { x: 0, y: 0 }, data: { label: 'Done' } },
    ],
    edges: [
      { id: 'e_start_1', source: 'node_start', target: 'node_1' },
      { id: 'e_1_2', source: 'node_1', target: 'node_2' },
      { id: 'e_2_3', source: 'node_2', target: 'node_3' },
      { id: 'e_3_end', source: 'node_3', target: 'node_end' },
    ],
    createdAt: '2026-07-05',
    updatedAt: '2026-07-20',
  },
};

// ═══════════════════════════════════════════════════════════════
// Users & API Keys (Access Settings)
// ═══════════════════════════════════════════════════════════════
export const dbUsers: User[] = [
  { id: 'u1', name: 'Alice Chen', email: 'alice@example.com', role: 'admin', avatarUrl: '' },
  { id: 'u2', name: 'Bob Zhang', email: 'bob@example.com', role: 'member', avatarUrl: '' },
  { id: 'u3', name: 'Carol Li', email: 'carol@example.com', role: 'member', avatarUrl: '' },
  { id: 'u4', name: 'David Wang', email: 'david@example.com', role: 'viewer', avatarUrl: '' },
  { id: 'u5', name: 'Eve Liu', email: 'eve@example.com', role: 'viewer', avatarUrl: '' },
];

export const dbApiKeys: ApiKey[] = [
  { id: 'key_1', name: 'Production', prefix: 'asy_p_***', createdAt: '2026-07-10T08:00:00Z', lastUsedAt: '2026-07-21T10:32:00Z' },
  { id: 'key_2', name: 'Local Dev', prefix: 'asy_l_***', createdAt: '2026-07-15T14:30:00Z', lastUsedAt: '2026-07-20T18:00:00Z' },
  { id: 'key_3', name: 'CI Pipeline', prefix: 'asy_c_***', createdAt: '2026-06-01T09:00:00Z', lastUsedAt: undefined },
];

// ═══════════════════════════════════════════════════════════════
// Webhooks
// ═══════════════════════════════════════════════════════════════
export const dbWebhooks: Webhook[] = [
  { id: 'wh_1', url: 'https://hooks.slack.com/services/T01/ABC/xyz', events: ['task.completed', 'task.failed'], enabled: true, createdAt: '2026-07-10T08:00:00Z' },
  { id: 'wh_2', url: 'https://api.example.com/agent-events', events: ['agent.started', 'agent.stopped'], enabled: true, secret: 'whsec_abc123', createdAt: '2026-07-15T14:30:00Z' },
  { id: 'wh_3', url: 'https://myapp.com/webhooks/agent-sys', events: ['task.completed', 'task.failed', 'agent.started', 'agent.stopped'], enabled: false, createdAt: '2026-06-20T09:00:00Z' },
];

// ═══════════════════════════════════════════════════════════════
// Dashboard Metrics
// ═══════════════════════════════════════════════════════════════
export const dbDashboardMetrics = {
  totalAgents: 25,
  activeAgents: 19,
  todayTasks: 128,
  successRate: 98.4,
  todayTokens: 850000,
  dailyQuota: 1000000,
  estimatedCost: 12.50,
  queueHigh: 2,
  queueMedium: 8,
  queueLow: 15,
};

export const dbSystemHealth = {
  status: 'healthy' as const,
  uptime: '14d 7h 32m',
  cpuUsage: 42,
  memoryUsage: 68,
  diskUsage: 55,
  activeInstances: 12,
};

export const dbServiceHealth = [
  { name: 'API Gateway', status: 'healthy' as const, uptime: '14d', latency: '2ms' },
  { name: 'Control Service', status: 'healthy' as const, uptime: '14d', latency: '4ms' },
  { name: 'Scheduler', status: 'healthy' as const, uptime: '7d', latency: '1ms' },
  { name: 'Agent Runtime', status: 'healthy' as const, uptime: '14d', latency: '18ms' },
  { name: 'Auth Service', status: 'degraded' as const, uptime: '3d', latency: '45ms' },
  { name: 'Metrics Service', status: 'healthy' as const, uptime: '14d', latency: '8ms' },
  { name: 'Log Service', status: 'healthy' as const, uptime: '14d', latency: '6ms' },
  { name: 'Webhook Service', status: 'healthy' as const, uptime: '14d', latency: '5ms' },
];

export interface ThroughputBucket {
  label: string;
  count: number;
}

export interface LatencyBucket {
  label: string;
  count: number;
  variant: 'fast' | 'mid' | 'slow' | 'tail';
}

export const dbThroughputByRange: Record<string, ThroughputBucket[]> = {
  today: [
    { label: '00:00', count: 45 },
    { label: '03:00', count: 30 },
    { label: '06:00', count: 65 },
    { label: '09:00', count: 88 },
    { label: '12:00', count: 95 },
    { label: '15:00', count: 72 },
    { label: '18:00', count: 58 },
    { label: '21:00', count: 40 },
  ],
  week: [
    { label: 'Mon', count: 820 },
    { label: 'Tue', count: 910 },
    { label: 'Wed', count: 780 },
    { label: 'Thu', count: 950 },
    { label: 'Fri', count: 870 },
    { label: 'Sat', count: 420 },
    { label: 'Sun', count: 380 },
  ],
  month: [
    { label: 'W1', count: 4200 },
    { label: 'W2', count: 5100 },
    { label: 'W3', count: 4800 },
    { label: 'W4', count: 5300 },
  ],
};

export const dbLatencyDistribution: LatencyBucket[] = [
  { label: '<100ms', count: 774, variant: 'fast' },
  { label: '100-500ms', count: 299, variant: 'mid' },
  { label: '500ms-2s', count: 125, variant: 'slow' },
  { label: '>2s', count: 49, variant: 'tail' },
];

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  detail: string;
  ip: string;
}

export const dbAuditLogs: AuditLogEntry[] = [
  { id: 'a1', timestamp: '2026-07-21 10:32:15', user: 'Alice Chen', action: 'task_created', resource: 'task_7a3f2', detail: '提交代码审查任务', ip: '192.168.1.100' },
  { id: 'a2', timestamp: '2026-07-21 09:15:00', user: 'Bob Zhang', action: 'agent_created', resource: 'agent_5', detail: '创建 Agent: doc-writer', ip: '192.168.1.101' },
  { id: 'a3', timestamp: '2026-07-20 18:00:30', user: 'Alice Chen', action: 'api_key_created', resource: 'key_2', detail: '创建 API Key: Local Dev', ip: '192.168.1.100' },
  { id: 'a4', timestamp: '2026-07-20 16:45:00', user: 'Carol Li', action: 'role_changed', resource: 'user_u4', detail: 'David Wang: viewer → member', ip: '192.168.1.102' },
  { id: 'a5', timestamp: '2026-07-19 14:20:00', user: 'Alice Chen', action: 'webhook_created', resource: 'wh_1', detail: '创建 Webhook: Slack 通知', ip: '192.168.1.100' },
  { id: 'a6', timestamp: '2026-07-19 11:00:00', user: 'Bob Zhang', action: 'task_cancelled', resource: 'task_9d55c', detail: '取消长时间运行任务', ip: '192.168.1.101' },
  { id: 'a7', timestamp: '2026-07-18 09:30:00', user: 'Alice Chen', action: 'user_invited', resource: 'user_u5', detail: '邀请 Eve Liu 加入团队', ip: '192.168.1.100' },
  { id: 'a8', timestamp: '2026-07-17 15:10:00', user: 'Carol Li', action: 'api_key_revoked', resource: 'key_old', detail: '吊销旧 CI Key', ip: '192.168.1.102' },
];
