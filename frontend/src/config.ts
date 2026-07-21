/**
 * 环境控制开关
 *
 * 所有需要切换环境行为的代码都从这里读取，一行改开关，零重构联调。
 * 环境变量通过 .env.development / .env.production 注入（VITE_ 前缀）。
 *
 * 模式组合：
 *   本地开发 Phase 1    →  auth.enabled=false, mock.enabled=true
 *   后端就绪联调          →  auth.enabled=true,  mock.enabled=false
 *   本地开发 + 登录测试   →  auth.enabled=true,  mock.enabled=true
 */

function envBool(key: string, fallback: boolean): boolean {
  const v = import.meta.env[key];
  if (v === undefined || v === '') return fallback;
  return v === 'true' || v === '1';
}

function envNumber(key: string, fallback: number): number {
  const v = import.meta.env[key];
  if (v === undefined || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  // ── 认证 ──
  auth: {
    /** 是否启用认证。false 时 AuthGuard 直通，API 请求不带 token */
    enabled: envBool('VITE_AUTH_ENABLED', false),
    /** token 在 localStorage 中的 key */
    storageKey: 'agentsys-token',
    /** 登录页路径 */
    loginPath: '/login',
  },

  // ── API ──
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
    timeout: envNumber('VITE_API_TIMEOUT', 10000),
  },

  // ── Mock ──
  mock: {
    /** 是否使用 MSW 拦截请求 */
    enabled: envBool('VITE_MOCK_ENABLED', true),
    /** 模拟网络延迟 (ms) */
    delay: envNumber('VITE_MOCK_DELAY', 300),
    /** 模拟错误概率 (0-1)，用于测试 ErrorBoundary */
    errorRate: envNumber('VITE_MOCK_ERROR_RATE', 0),
  },

  // ── 实时数据 ──
  realtime: {
    /** polling | websocket */
    method: (import.meta.env.VITE_REALTIME_METHOD ?? 'polling') as 'polling' | 'websocket',
    /** 轮询间隔 (ms)，仅在 polling 模式下生效 */
    pollingInterval: envNumber('VITE_POLLING_INTERVAL', 3000),
    /** WebSocket 地址，仅在 websocket 模式下生效 */
    wsUrl: import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/ws',
  },
} as const;
