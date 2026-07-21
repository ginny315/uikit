/**
 * Task mock 数据 — 向后兼容重导出。
 * Session 9: 数据源统一至 data.ts，旧引用保持不变。
 */
export { dbTasks as MOCK_TASKS, deriveTimeline as getTaskTimeline } from './data';
