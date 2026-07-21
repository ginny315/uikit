/**
 * Workflow API Service
 */
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';
import type { WorkflowSummary, WorkflowDetail } from '../types';

export function fetchWorkflows(params?: { search?: string; status?: string }): Promise<WorkflowSummary[]> {
  const sp = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') sp.set(k, String(v)); });
  }
  const qs = sp.toString();
  return apiGet<WorkflowSummary[]>(`/api/v1/workflows${qs ? `?${qs}` : ''}`);
}

export function fetchWorkflow(id: string): Promise<WorkflowDetail> {
  return apiGet<WorkflowDetail>(`/api/v1/workflows/${id}`);
}

export function createWorkflow(data: Partial<WorkflowSummary>): Promise<WorkflowSummary> {
  return apiPost<WorkflowSummary>('/api/v1/workflows', data);
}

export function updateWorkflow(id: string, data: Partial<WorkflowDetail>): Promise<WorkflowDetail> {
  return apiPut<WorkflowDetail>(`/api/v1/workflows/${id}`, data);
}

export function deleteWorkflow(id: string): Promise<void> {
  return apiDelete<void>(`/api/v1/workflows/${id}`);
}
