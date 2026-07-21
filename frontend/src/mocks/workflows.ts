/**
 * Workflow mock 数据 — 向后兼容重导出。
 * Session 9: 数据源统一至 data.ts，旧引用保持不变。
 */
export { dbWorkflowSummaries as MOCK_WORKFLOW_SUMMARIES, dbWorkflowDetails } from './data';

import { dbWorkflowDetails as details } from './data';
import type { WorkflowDetail } from '../types';

/** @deprecated 用 fetchWorkflow(id) 替代 */
export function getWorkflowDetail(id: string): WorkflowDetail | undefined {
  return details[id];
}
