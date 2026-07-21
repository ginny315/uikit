import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';

/**
 * React Query 标准封装
 *
 * 所有数据获取统一走这里，方便：
 *   - 统一错误处理（notification 层）
 *   - 统一 queryKey 前缀
 *
 * Mock 延迟由 MSW handlers 负责，此处不再叠加。
 */

const defaultStaleTime = 30_000; // 30s

export type QueryKey = readonly unknown[];

/**
 * 通用查询 hook
 */
export function useApiQuery<TData>(
  key: QueryKey,
  fetcher: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TData, Error>({
    queryKey: key,
    queryFn: fetcher,
    staleTime: defaultStaleTime,
    retry: 1,
    ...options,
  });
}

/**
 * 通用 mutation hook
 */
export function useApiMutation<TData, TVariables>(
  key: QueryKey,
  mutator: (vars: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: mutator,
    onSuccess: () => {
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
    list: (params?: Record<string, unknown>) => ['workflows', 'list', params] as const,
    detail: (id: string) => ['workflows', 'detail', id] as const,
  },
  metrics: {
    all: ['metrics'] as const,
    dashboard: ['metrics', 'dashboard'] as const,
    queue: ['metrics', 'queue'] as const,
    health: ['metrics', 'health'] as const,
    services: ['metrics', 'services'] as const,
  },
  logs: {
    all: ['logs'] as const,
    search: (params?: Record<string, unknown>) => ['logs', 'search', params] as const,
  },
  costs: {
    all: ['costs'] as const,
    report: (params?: Record<string, unknown>) => ['costs', 'report', params] as const,
  },
  users: {
    all: ['users'] as const,
    list: () => ['users', 'list'] as const,
  },
  apiKeys: {
    all: ['apiKeys'] as const,
    list: () => ['apiKeys', 'list'] as const,
  },
  audit: {
    all: ['audit'] as const,
    list: () => ['audit', 'list'] as const,
  },
  webhooks: {
    all: ['webhooks'] as const,
    list: () => ['webhooks', 'list'] as const,
  },
} as const;
