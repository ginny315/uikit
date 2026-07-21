/**
 * Log API Service
 */
import { apiGet } from '../lib/api';
import type { LogEntry, PaginatedResponse } from '../types';

export interface LogSearchParams {
  search?: string;
  level?: string;
  source?: string;
  timeRange?: string;
  page?: number;
  pageSize?: number;
}

export function searchLogs(params?: LogSearchParams): Promise<PaginatedResponse<LogEntry>> {
  const sp = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') sp.set(k, String(v)); });
  }
  const qs = sp.toString();
  return apiGet<PaginatedResponse<LogEntry>>(`/api/v1/logs${qs ? `?${qs}` : ''}`);
}
