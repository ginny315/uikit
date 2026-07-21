/**
 * Access (Users + API Keys + Audit) Service
 */
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';
import type { User, ApiKey } from '../types';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  detail: string;
  ip: string;
}

// ── Users ──
export function fetchUsers(): Promise<User[]> {
  return apiGet<User[]>('/api/v1/users');
}

export function updateUserRole(userId: string, role: string): Promise<User> {
  return apiPut<User>(`/api/v1/users/${userId}/role`, { role });
}

export function removeUser(userId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/users/${userId}`);
}

export function inviteUser(email: string, role: string): Promise<User> {
  return apiPost<User>('/api/v1/users/invite', { email, role });
}

// ── API Keys ──
export function fetchApiKeys(): Promise<ApiKey[]> {
  return apiGet<ApiKey[]>('/api/v1/api-keys');
}

export function createApiKey(name: string): Promise<ApiKey & { rawKey: string }> {
  return apiPost<ApiKey & { rawKey: string }>('/api/v1/api-keys', { name });
}

export function revokeApiKey(id: string): Promise<void> {
  return apiDelete<void>(`/api/v1/api-keys/${id}`);
}

// ── Audit Logs ──
export function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  return apiGet<AuditLogEntry[]>('/api/v1/audit-logs');
}
