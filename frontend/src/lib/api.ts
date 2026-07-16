import { config } from '../config';
import type { ApiError } from '../types';

/**
 * API 错误分类
 *
 * 对应 PRD §6.3 规定的 4 种错误场景，每种有独立的 UI 处理：
 *   - ValidationError → 表单字段高亮
 *   - QuotaError      → 配额提示 + 升级入口
 *   - NetworkError    → 友好提示 + 重试按钮
 *   - UnknownError    → 通用错误（含 Agent 执行失败）
 */
export class ApiRequestError extends Error {
  status: number;
  code: string;
  details?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    code: string,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isValidationError() { return this.status === 400; }
  get isAuthError() { return this.status === 401; }
  get isQuotaError() { return this.status === 429 && this.code === 'QUOTA_EXCEEDED'; }
  get isNetworkError() { return this.status === 0; }
  get isServerError() { return this.status >= 500; }
}

/**
 * fetch 封装
 *
 * - auth.enabled=true 时自动附加 Authorization header
 * - 统一错误分类为 ApiRequestError
 * - 超时控制
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${config.api.baseUrl}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.auth.enabled) {
    const token = localStorage.getItem(config.auth.storageKey);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let apiError: ApiError;
      try {
        apiError = await response.json();
      } catch {
        apiError = { code: 'UNKNOWN', message: `HTTP ${response.status}` };
      }
      throw new ApiRequestError(
        apiError.message,
        response.status,
        apiError.code,
        apiError.details,
      );
    }

    // 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiRequestError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiRequestError('Request timeout', 0, 'TIMEOUT');
    }

    throw new ApiRequestError(
      'Network error',
      0,
      'NETWORK_ERROR',
    );
  }
}

// ── 便捷方法 ──
export function apiGet<T>(path: string): Promise<T> {
  return request<T>('GET', path);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('POST', path, body);
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('PUT', path, body);
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>('DELETE', path);
}

// ── Token 管理 ──
export function getToken(): string | null {
  return localStorage.getItem(config.auth.storageKey);
}

export function setToken(token: string): void {
  localStorage.setItem(config.auth.storageKey, token);
}

export function removeToken(): void {
  localStorage.removeItem(config.auth.storageKey);
}
