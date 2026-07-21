/**
 * Task API Service
 */
import { apiGet, apiPost } from '../lib/api';
import type { Task, TaskTimelineEvent, PaginatedResponse } from '../types';

export interface TaskListParams {
  search?: string;
  status?: string;
  priority?: number;
  agentId?: string;
  sort?: string;
  order?: string;
  page?: number;
  pageSize?: number;
}

export function fetchTasks(params?: TaskListParams): Promise<PaginatedResponse<Task>> {
  const sp = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') sp.set(k, String(v)); });
  }
  const qs = sp.toString();
  return apiGet<PaginatedResponse<Task>>(`/api/v1/tasks${qs ? `?${qs}` : ''}`);
}

export function fetchTask(id: string): Promise<Task> {
  return apiGet<Task>(`/api/v1/tasks/${id}`);
}

export function fetchTaskTimeline(id: string): Promise<TaskTimelineEvent[]> {
  return apiGet<TaskTimelineEvent[]>(`/api/v1/tasks/${id}/timeline`);
}

export function createTask(data: { agentId: string; priority?: number; input: string }): Promise<Task> {
  return apiPost<Task>('/api/v1/tasks', data);
}

export function cancelTask(id: string): Promise<Task> {
  return apiPost<Task>(`/api/v1/tasks/${id}/cancel`);
}

export function retryTask(id: string): Promise<Task> {
  return apiPost<Task>(`/api/v1/tasks/${id}/retry`);
}
