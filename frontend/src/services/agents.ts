/**
 * Agent API Service
 * Session 9: MSW 拦截层之上的类型化 API 调用。
 */
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';
import type { Agent, PaginatedResponse } from '../types';

export interface AgentListParams {
  search?: string;
  status?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export function fetchAgents(params?: AgentListParams): Promise<PaginatedResponse<Agent>> {
  const sp = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') sp.set(k, String(v)); });
  }
  const qs = sp.toString();
  return apiGet<PaginatedResponse<Agent>>(`/api/v1/agents${qs ? `?${qs}` : ''}`);
}

export function fetchAgent(id: string): Promise<Agent> {
  return apiGet<Agent>(`/api/v1/agents/${id}`);
}

export function createAgent(data: Record<string, unknown>): Promise<Agent> {
  return apiPost<Agent>('/api/v1/agents', data);
}

export function updateAgent(id: string, data: Record<string, unknown>): Promise<Agent> {
  return apiPut<Agent>(`/api/v1/agents/${id}`, data);
}

export function deleteAgent(id: string): Promise<void> {
  return apiDelete<void>(`/api/v1/agents/${id}`);
}
