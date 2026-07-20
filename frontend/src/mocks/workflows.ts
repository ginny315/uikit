import type { WorkflowSummary, WorkflowDetail } from '../types';

/**
 * 共享 Workflow mock 数据。
 * WorkflowListPage（列表）和 WorkflowEditorPage（编辑器）共用此数据源。
 * Session 9 迁移到 MSW 后替换。
 *
 * 列表视图使用 summaries（轻量），编辑器使用 details（含 nodes + edges）。
 */

// ── 工作流摘要（列表页用）──
export const MOCK_WORKFLOW_SUMMARIES: WorkflowSummary[] = [
  {
    id: 'wf_pr_review',
    name: 'PR Review Pipeline',
    description: 'PR 提交后自动进行代码审查和安全扫描，结果通知到 Slack',
    status: 'active',
    stepCount: 3,
    createdAt: '2026-07-10',
    updatedAt: '2026-07-20',
  },
  {
    id: 'wf_incident',
    name: 'Incident Response',
    description: '告警触发后自动分诊、分析日志并通知相关团队',
    status: 'active',
    stepCount: 3,
    createdAt: '2026-07-12',
    updatedAt: '2026-07-19',
  },
  {
    id: 'wf_daily_report',
    name: 'Daily Report Generator',
    description: '每日定时分析数据、生成报告并通过邮件发送',
    status: 'paused',
    stepCount: 3,
    createdAt: '2026-07-08',
    updatedAt: '2026-07-18',
  },
  {
    id: 'wf_release',
    name: 'Release Checklist',
    description: '发布前自动运行测试、安全扫描，通过后执行发布',
    status: 'draft',
    stepCount: 2,
    createdAt: '2026-07-18',
    updatedAt: '2026-07-18',
  },
];

// ── 工作流详情（编辑器用）──
// 注意: position.y 值保证从上到下的视觉顺序，dagre auto-layout 运行后会被覆盖。
// 运行时 import { ReactFlow } from '@xyflow/react' 会为节点注入 measured、internals 等字段。
export const MOCK_WORKFLOW_DETAILS: Record<string, WorkflowDetail> = {
  // 顺序链式: Start → code-reviewer → security-scanner → slack-notifier → End
  wf_pr_review: {
    id: 'wf_pr_review',
    name: 'PR Review Pipeline',
    description: 'PR 提交后自动进行代码审查和安全扫描，结果通知到 Slack',
    status: 'active',
    stepCount: 3,
    createdAt: '2026-07-10',
    updatedAt: '2026-07-20',
    nodes: [
      { id: 'start', type: 'start', position: { x: 350, y: 0 }, data: { label: '开始' } },
      { id: 'step_1', type: 'agent', position: { x: 350, y: 120 }, data: { agentId: '1', agentName: 'code-reviewer', label: 'Code Review', inputTemplate: '{{workflow.input}}' } },
      { id: 'step_2', type: 'agent', position: { x: 350, y: 260 }, data: { agentId: '2', agentName: 'security-scanner', label: 'Security Scan', inputTemplate: '{{prev.output}}' } },
      { id: 'step_3', type: 'agent', position: { x: 350, y: 400 }, data: { agentId: '4', agentName: 'slack-notifier', label: 'Notify Slack', inputTemplate: '审查结果：\n{{prev.output}}' } },
      { id: 'end', type: 'end', position: { x: 350, y: 540 }, data: { label: '结束' } },
    ],
    edges: [
      { id: 'e_start_1', source: 'start', target: 'step_1' },
      { id: 'e_1_2', source: 'step_1', target: 'step_2' },
      { id: 'e_2_3', source: 'step_2', target: 'step_3' },
      { id: 'e_3_end', source: 'step_3', target: 'end' },
    ],
  },

  // 含并行分支: Start → incident-responder → (slack-notifier ∥ log-analyzer) → End
  wf_incident: {
    id: 'wf_incident',
    name: 'Incident Response',
    description: '告警触发后自动分诊、分析日志并通知相关团队',
    status: 'active',
    stepCount: 3,
    createdAt: '2026-07-12',
    updatedAt: '2026-07-19',
    nodes: [
      { id: 'start', type: 'start', position: { x: 350, y: 0 }, data: { label: '开始' } },
      { id: 'step_1', type: 'agent', position: { x: 350, y: 120 }, data: { agentId: '7', agentName: 'incident-responder', label: 'Incident Triage', inputTemplate: '{{workflow.input}}' } },
      { id: 'step_2', type: 'agent', position: { x: 150, y: 280 }, data: { agentId: '4', agentName: 'slack-notifier', label: 'Notify Team', inputTemplate: '告警详情：{{prev.output}}' } },
      { id: 'step_3', type: 'agent', position: { x: 550, y: 280 }, data: { agentId: '13', agentName: 'log-analyzer', label: 'Analyze Logs', inputTemplate: '分析时间段：{{prev.output.time_range}}' } },
      { id: 'end', type: 'end', position: { x: 350, y: 440 }, data: { label: '结束' } },
    ],
    edges: [
      { id: 'e_start_1', source: 'start', target: 'step_1' },
      { id: 'e_1_2', source: 'step_1', target: 'step_2' },
      { id: 'e_1_3', source: 'step_1', target: 'step_3' },
      { id: 'e_2_end', source: 'step_2', target: 'end' },
      { id: 'e_3_end', source: 'step_3', target: 'end' },
    ],
  },

  // 顺序链式 (paused): Start → data-analyzer → doc-writer → email-assistant → End
  wf_daily_report: {
    id: 'wf_daily_report',
    name: 'Daily Report Generator',
    description: '每日定时分析数据、生成报告并通过邮件发送',
    status: 'paused',
    stepCount: 3,
    createdAt: '2026-07-08',
    updatedAt: '2026-07-18',
    nodes: [
      { id: 'start', type: 'start', position: { x: 350, y: 0 }, data: { label: '开始' } },
      { id: 'step_1', type: 'agent', position: { x: 350, y: 120 }, data: { agentId: '5', agentName: 'data-analyzer', label: 'Analyze Data', inputTemplate: '{{workflow.input}}' } },
      { id: 'step_2', type: 'agent', position: { x: 350, y: 260 }, data: { agentId: '6', agentName: 'doc-writer', label: 'Generate Report', inputTemplate: '分析数据：{{prev.output}}' } },
      { id: 'step_3', type: 'agent', position: { x: 350, y: 400 }, data: { agentId: '10', agentName: 'email-assistant', label: 'Send Email', inputTemplate: '发送报告：{{prev.output}}' } },
      { id: 'end', type: 'end', position: { x: 350, y: 540 }, data: { label: '结束' } },
    ],
    edges: [
      { id: 'e_start_1', source: 'start', target: 'step_1' },
      { id: 'e_1_2', source: 'step_1', target: 'step_2' },
      { id: 'e_2_3', source: 'step_2', target: 'step_3' },
      { id: 'e_3_end', source: 'step_3', target: 'end' },
    ],
  },

  // 简单草稿: Start → test-generator → release-bot → End
  wf_release: {
    id: 'wf_release',
    name: 'Release Checklist',
    description: '发布前自动运行测试、安全扫描，通过后执行发布',
    status: 'draft',
    stepCount: 2,
    createdAt: '2026-07-18',
    updatedAt: '2026-07-18',
    nodes: [
      { id: 'start', type: 'start', position: { x: 350, y: 0 }, data: { label: '开始' } },
      { id: 'step_1', type: 'agent', position: { x: 350, y: 120 }, data: { agentId: '3', agentName: 'test-generator', label: 'Run Tests', inputTemplate: '{{workflow.input}}' } },
      { id: 'step_2', type: 'agent', position: { x: 350, y: 260 }, data: { agentId: '8', agentName: 'release-bot', label: 'Deploy Release', inputTemplate: '测试已通过，开始发布：{{prev.output}}' } },
      { id: 'end', type: 'end', position: { x: 350, y: 400 }, data: { label: '结束' } },
    ],
    edges: [
      { id: 'e_start_1', source: 'start', target: 'step_1' },
      { id: 'e_1_2', source: 'step_1', target: 'step_2' },
      { id: 'e_2_end', source: 'step_2', target: 'end' },
    ],
  },
};

/** 按 ID 获取工作流详情，undefined = 不存在 */
export function getWorkflowDetail(id: string): WorkflowDetail | undefined {
  return MOCK_WORKFLOW_DETAILS[id];
}
