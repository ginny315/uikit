import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { config } from '../config';
import type { QueryKey } from './useApi';

/**
 * 根据 config.realtime 为 React Query 提供 refetchInterval。
 * polling 模式返回间隔 ms；websocket 模式暂返回 false（预留 wsUrl）。
 */
export function useRealtimeInterval(): number | false {
  if (config.realtime.method === 'polling') {
    return config.realtime.pollingInterval;
  }
  return false;
}

/**
 * WebSocket 模式预留：连接 wsUrl 并在收到消息时 invalidate 指定 queryKey。
 * 后端就绪后在此实现；当前 polling 模式不执行任何操作。
 */
export function useRealtimeInvalidation(queryKeys: QueryKey[]): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (config.realtime.method !== 'websocket') return;

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(config.realtime.wsUrl);
      ws.onmessage = () => {
        queryKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      };
    } catch {
      // WebSocket 不可用时静默降级
    }

    return () => {
      ws?.close();
    };
  }, [queryClient, queryKeys]);
}
