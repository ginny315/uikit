/**
 * 常量定义 — 从 DESIGN_SPEC.md 提取的固定值
 */

// ── 布局 ──
export const SIDEBAR_WIDTH = 240;
export const TOPBAR_HEIGHT = 64;
export const CONTENT_MAX_WIDTH = 1440;

// ── 任务优先级 ──
export const PRIORITY = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
} as const;

export const PRIORITY_LABELS: Record<number, string> = {
  1: 'Critical',
  2: 'High',
  3: 'Medium',
  4: 'Low',
};

// ── 任务/Agent 状态 ──
export const AGENT_STATUS = ['running', 'stopped', 'error'] as const;
export const TASK_STATUS = ['queued', 'running', 'succeeded', 'failed', 'cancelled'] as const;

export type AgentStatus = (typeof AGENT_STATUS)[number];
export type TaskStatus = (typeof TASK_STATUS)[number];
