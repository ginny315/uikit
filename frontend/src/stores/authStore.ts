import { create } from 'zustand';
import { config } from '../config';

// ── Mock 凭据（仅 mock.enabled=true 时生效）──
const MOCK_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbmlzdHJhdG9yIiwiaWF0IjoxNzU1MTIwMDAwfQ.mock-token-for-development';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginError: string | null;

  /**
   * 登录
   *
   * mock 模式下使用内置凭据校验（admin / admin123），
   * 生产模式下应调用 POST /api/auth/login。
   *
   * @returns true 表示登录成功，false 表示失败
   */
  login: (username: string, password: string, rememberMe: boolean) => Promise<boolean>;

  /** 退出登录 — 清除 token 并跳转到登录页 */
  logout: () => void;

  /** 初始化 — 从 localStorage / sessionStorage 恢复登录态 */
  initialize: () => void;

  /** 清除登录错误（切换输入时调用） */
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  isAuthenticated: false,
  isLoading: true, // 初始化完成前为 true，避免闪烁
  loginError: null,

  login: async (username: string, password: string, rememberMe: boolean) => {
    set({ isLoading: true, loginError: null });

    // 模拟网络延迟
    await new Promise((r) => setTimeout(r, 800));

    // ── Mock 登录校验 ──
    if (config.mock.enabled) {
      if (
        username === MOCK_CREDENTIALS.username &&
        password === MOCK_CREDENTIALS.password
      ) {
        const token = MOCK_TOKEN;
        if (rememberMe) {
          localStorage.setItem(config.auth.storageKey, token);
        } else {
          sessionStorage.setItem(config.auth.storageKey, token);
        }
        set({ token, isAuthenticated: true, isLoading: false, loginError: null });
        return true;
      }

      set({
        isLoading: false,
        loginError: 'auth:errors.invalidCredentials',
      });
      return false;
    }

    // ── 真实 API 登录（后端就绪后生效）──
    try {
      const response = await fetch(`${config.api.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        set({
          isLoading: false,
          loginError: body.code === 'TOO_MANY_ATTEMPTS'
            ? 'auth:errors.tooManyAttempts'
            : 'auth:errors.invalidCredentials',
        });
        return false;
      }

      const { token } = await response.json();
      if (rememberMe) {
        localStorage.setItem(config.auth.storageKey, token);
      } else {
        sessionStorage.setItem(config.auth.storageKey, token);
      }
      set({ token, isAuthenticated: true, isLoading: false, loginError: null });
      return true;
    } catch {
      set({
        isLoading: false,
        loginError: 'auth:errors.networkError',
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem(config.auth.storageKey);
    sessionStorage.removeItem(config.auth.storageKey);
    set({ token: null, isAuthenticated: false, loginError: null });
  },

  initialize: () => {
    // auth 未启用时直接通过
    if (!config.auth.enabled) {
      set({ token: null, isAuthenticated: true, isLoading: false });
      return;
    }

    // 检查 localStorage 和 sessionStorage 中的 token
    let token =
      localStorage.getItem(config.auth.storageKey) ||
      sessionStorage.getItem(config.auth.storageKey);

    // 默认保持登录状态：没有 token 时自动签发默认 token
    // 只有主动点击「退出登录」才会清除 token 回到登录页
    if (!token) {
      token = MOCK_TOKEN;
      localStorage.setItem(config.auth.storageKey, token);
    }

    set({
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  clearError: () => {
    if (get().loginError) {
      set({ loginError: null });
    }
  },
}));
