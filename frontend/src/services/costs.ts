/**
 * Cost API Service
 */
import { apiGet, apiPut } from '../lib/api';

export interface CostSummary {
  todayCost: number;
  weekCost: number;
  monthCost: number;
  todayTokens: number;
  avgCostPerTask: number;
  projectedMonth: number;
}

export interface CostBreakdownItem {
  id: string;
  name: string;
  cost: number;
  tokens: number;
  tasks: number;
}

export interface DailyTrendItem {
  date: string;
  cost: number;
}

export interface QuotaEntry {
  id: string;
  name: string;
  dailyLimit: number;
  used: number;
}

export interface CostReport {
  summary: CostSummary;
  breakdown: CostBreakdownItem[];
  dailyTrend: DailyTrendItem[];
  quotas: QuotaEntry[];
}

export function fetchCostReport(groupBy?: 'agent' | 'user'): Promise<CostReport> {
  const sp = new URLSearchParams();
  if (groupBy) sp.set('groupBy', groupBy);
  const qs = sp.toString();
  return apiGet<CostReport>(`/api/v1/costs/report${qs ? `?${qs}` : ''}`);
}

export function updateQuota(agentId: string, data: { dailyLimit: number }): Promise<{ success: boolean }> {
  return apiPut<{ success: boolean }>(`/api/v1/costs/quotas/${agentId}`, data);
}

export function updateAlerts(data: { enabled: boolean; threshold: number; email: string }): Promise<{ success: boolean }> {
  return apiPut<{ success: boolean }>('/api/v1/costs/alerts', data);
}
