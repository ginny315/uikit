/**
 * Webhook API Service
 */
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';
import type { Webhook, WebhookEvent } from '../types';

export function fetchWebhooks(): Promise<Webhook[]> {
  return apiGet<Webhook[]>('/api/v1/webhooks');
}

export function createWebhook(data: { url: string; events: WebhookEvent[]; secret?: string }): Promise<Webhook> {
  return apiPost<Webhook>('/api/v1/webhooks', data);
}

export function updateWebhook(id: string, data: Partial<Webhook>): Promise<Webhook> {
  return apiPut<Webhook>(`/api/v1/webhooks/${id}`, data);
}

export function deleteWebhook(id: string): Promise<void> {
  return apiDelete<void>(`/api/v1/webhooks/${id}`);
}

export function testWebhook(id: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`/api/v1/webhooks/${id}/test`);
}
