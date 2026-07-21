/**
 * Dashboard API Service
 */
import { apiGet } from '../lib/api';
import type { SystemHealthCardProps } from '../components/shared/SystemHealthCard/SystemHealthCard';
import type { Task } from '../types';
import { fetchTasks } from './tasks';

export interface DashboardMetrics {
  totalAgents: number;
  activeAgents: number;
  todayTasks: number;
  successRate: number;
  todayTokens: number;
  dailyQuota: number;
  estimatedCost: number;
  queueHigh: number;
  queueMedium: number;
  queueLow: number;
}

export interface QueueStatus {
  high: number;
  medium: number;
  low: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeInstances: number;
}

export function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  return apiGet<DashboardMetrics>('/api/v1/metrics/dashboard');
}

export function fetchQueueStatus(): Promise<QueueStatus> {
  return apiGet<QueueStatus>('/api/v1/metrics/queue');
}

export function fetchSystemHealth(): Promise<SystemHealth> {
  return apiGet<SystemHealth>('/api/v1/metrics/health');
}

export function fetchServiceHealth(): Promise<SystemHealthCardProps[]> {
  return apiGet<SystemHealthCardProps[]>('/api/v1/metrics/services');
}

export function fetchRecentTasks(limit = 5): Promise<Task[]> {
  return fetchTasks({ page: 1, pageSize: limit, sort: 'createdAt', order: 'desc' }).then(
    (res) => res.data,
  );
}
