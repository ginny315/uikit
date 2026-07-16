import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { config } from '../config';

/**
 * React Query 标准封装
 *
 * 所有数据获取统一走这里，方便：
 *   - 追加 mock delay（开发模式）
 *   - 统一错误处理（notification 层）
 *   - 统一 queryKey 前缀
 */

const defaultStaleTime = 30_000; // 30s

/**
 * 通用查询 hook
 */
export function useApiQuery<TData>(
  key: string[],
  fetcher: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TData, Error>({
    queryKey: key,
    queryFn: async () => {
      const data = await fetcher();
      // Mock 延迟（仅开发模式）
      if (config.mock.enabled && config.mock.delay > 0) {
        await new Promise((r) => setTimeout(r, config.mock.delay));
      }
      return data;
    },
    staleTime: defaultStaleTime,
    retry: 1,
    ...options,
  });
}

/**
 * 通用 mutation hook
 */
export function useApiMutation<TData, TVariables>(
  key: string[],
  mutator: (vars: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: mutator,
    onSuccess: () => {
      // 成功后 invalidate 相关查询
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

// queryKey 工厂 — 统一管理，避免散落字符串
export const queryKeys = {
  agents: {
    all: ['agents'] as const,
    list: (params?: Record<string, unknown>) => ['agents', 'list', params] as const,
    detail: (id: string) => ['agents', 'detail', id] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    list: (params?: Record<string, unknown>) => ['tasks', 'list', params] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
    timeline: (id: string) => ['tasks', 'timeline', id] as const,
  },
  workflows: {
    all: ['workflows'] as const,
    list: () => ['workflows', 'list'] as const,
    detail: (id: string) => ['workflows', 'detail', id] as const,
  },
  metrics: {
    dashboard: ['metrics', 'dashboard'] as const,
    queue: ['metrics', 'queue'] as const,
    health: ['metrics', 'health'] as const,
  },
  logs: {
    search: (params?: Record<string, unknown>) => ['logs', 'search', params] as const,
  },
  costs: {
    report: (params?: Record<string, unknown>) => ['costs', 'report', params] as const,
  },
  users: {
    list: () => ['users', 'list'] as const,
  },
  webhooks: {
    list: () => ['webhooks', 'list'] as const,
  },
} as const;
