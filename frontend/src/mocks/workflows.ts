/** @deprecated 请使用 services/* + MSW，此文件仅为向后兼容保留 */
export {
  dbWorkflowSummaries as MOCK_WORKFLOW_SUMMARIES,
  dbWorkflowDetails,
} from './data';

import { dbWorkflowDetails } from './data';

/** @deprecated 使用 fetchWorkflow(id) service 代替 */
export function getWorkflowDetail(id: string) {
  return dbWorkflowDetails[id] ?? null;
}
