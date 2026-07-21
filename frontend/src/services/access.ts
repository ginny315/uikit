/**
 * Access (Users + API Keys) Service
 */
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';
import type { User, ApiKey } from '../types';

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
