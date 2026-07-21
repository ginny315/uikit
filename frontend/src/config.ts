/**
 * 环境控制开关
 *
 * 所有需要切换环境行为的代码都从这里读取，一行改开关，零重构联调。
 *
 * 模式组合：
 *   本地开发 Phase 1    →  auth.enabled=false, mock.enabled=true
 *   后端就绪联调          →  auth.enabled=true,  mock.enabled=false
 *   本地开发 + 登录测试   →  auth.enabled=true,  mock.enabled=true
 */

export const config = {
  // ── 认证 ──
  auth: {
    /** 是否启用认证。false 时 AuthGuard 直通，API 请求不带 token */
    enabled: false,
    /** token 在 localStorage 中的 key */
    storageKey: 'agentsys-token',
    /** 登录页路径 */
    loginPath: '/login',
  },

  // ── API ──
  api: {
    baseUrl: 'http://localhost:8080',
    timeout: 10000,
  },

  // ── Mock ──
  mock: {
    /** 是否使用 MSW 拦截请求 */
    enabled: true,
    /** 模拟网络延迟 (ms) */
    delay: 300,
    /** 模拟错误概率 (0-1)，用于测试 ErrorBoundary */
    errorRate: 0,
  },

  // ── 实时数据 ──
  realtime: {
    /** polling | websocket */
    method: 'polling' as 'polling' | 'websocket',
    /** 轮询间隔 (ms)，仅在 polling 模式下生效 */
    pollingInterval: 3000,
    /** WebSocket 地址，仅在 websocket 模式下生效 */
    wsUrl: 'ws://localhost:8080/ws',
  },
} as const;
