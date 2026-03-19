import {
  AUTH_REFRESH_TOKEN_STORAGE_KEY,
  AUTH_TOKEN_STORAGE_KEY,
} from '@/constants/auth-token';

import {
  clearAuthToken,
  persistAuthToken,
  persistRefreshToken,
  persistSessionDisplay,
} from '@/lib/auth-session';

export const API_BASE_URL = process.env.NEXT_PUBLIC_MY_API_BASE_URL || 'http://localhost:8888';

export { AUTH_TOKEN_STORAGE_KEY };

export interface BaseResponse<T> {
  code: number;
  message: string;
  data: T;
}

export class ApiError extends Error {
  status: number;
  code?: number;
  data?: any;

  constructor(message: string, status: number, code?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

function normalizeRequestError(err: unknown): Error {
  if (err instanceof ApiError) return err;
  if (err instanceof TypeError) {
    const message = err.message || '';
    if (message.includes('Failed to fetch')) {
      return new ApiError(
        '网络请求失败，请检查后端服务是否可用，或确认浏览器跨域/插件拦截配置。',
        0,
      );
    }
  }
  if (err instanceof Error) return err;
  return new Error('Unknown request error');
}

export const getHeaders = (skipAuth = false) => {
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token && !skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = response.statusText;
    let errorData: any = null;
    try {
      errorData = await response.json();
      // FastAPI typically returns {"detail": "message"}
      if (errorData && typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (errorData && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      } else {
        errorMessage = JSON.stringify(errorData);
      }
    } catch (e) {
      // If JSON parsing fails, fallback to text
      const text = await response.text().catch(() => null);
      if (text) errorMessage = text;
    }
    throw new ApiError(errorMessage, response.status, errorData?.code, errorData);
  }
  
  // 204 No Content has no body
  if (response.status === 204) {
    return null as T;
  }
  
  const resData = (await response.json()) as BaseResponse<T>;
  
  // Check for business error code (0 is success)
  if (resData.code !== 0) {
    throw new ApiError(resData.message || 'Unknown Error', response.status, resData.code, resData.data);
  }

  return resData.data;
}

interface RequestOptions {
  headers?: HeadersInit;
  skipAuth?: boolean;
}

export const apiClient = {
  get: async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
    return requestWithAutoRefresh<T>('GET', url, undefined, options);
  },

  post: async <T>(url: string, body: any, options: RequestOptions = {}): Promise<T> => {
    return requestWithAutoRefresh<T>('POST', url, body, options);
  },

  patch: async <T>(url: string, body: any, options: RequestOptions = {}): Promise<T> => {
    return requestWithAutoRefresh<T>('PATCH', url, body, options);
  },

  put: async <T>(url: string, body: any, options: RequestOptions = {}): Promise<T> => {
    return requestWithAutoRefresh<T>('PUT', url, body, options);
  },

  delete: async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
    return requestWithAutoRefresh<T>('DELETE', url, undefined, options);
  },
};

/** 访问令牌失效类业务码：应尝试 refresh 后重试一次 */
export const AUTH_EXPIRE_RETRY_CODES = new Set<number>([2002, 2003, 2004, 2005]);

/** 距 access JWT 过期不足该毫秒数时，发业务请求前先刷新 */
const PROACTIVE_REFRESH_LEAD_MS = 120_000;

function decodeJwtExpMs(accessToken: string): number | null {
  try {
    const parts = accessToken.split('.');
    if (parts.length < 2) return null;
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (payloadB64.length % 4)) % 4);
    const json = window.atob(payloadB64 + padding);
    const payload = JSON.parse(json);
    const expSec = Number(payload?.exp);
    return Number.isFinite(expSec) ? expSec * 1000 : null;
  } catch {
    return null;
  }
}

/** 当前 localStorage 中 access token 的过期时刻（ms），无法解析则 null */
export function getAccessTokenExpiryMs(): number | null {
  if (typeof window === 'undefined') return null;
  const accessToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (!accessToken) return null;
  return decodeJwtExpMs(accessToken);
}

let refreshInFlight: Promise<boolean> | null = null;

function getCurrentLocalePrefix(): string {
  if (typeof window === 'undefined') return '';
  const segments = window.location.pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first === 'zh' || first === 'en') return `/${first}`;
  return '';
}

function redirectToSignIn() {
  if (typeof window === 'undefined') return;
  const prefix = getCurrentLocalePrefix();
  window.location.replace(`${prefix}/auth/sign-in`);
}

async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { ...getHeaders(true) },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await handleResponse<any>(response);
    if (!data?.access_token || !data?.refresh_token) return false;
    persistAuthToken(data.access_token);
    persistRefreshToken(data.refresh_token);
    if (typeof data.username === 'string') {
      persistSessionDisplay({
        username: data.username,
        studio_name: data.studio_name ?? null,
      });
    }
    return true;
  } catch {
    return false;
  }
}

async function ensureRefreshed(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = refreshAccessToken().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function requestWithAutoRefresh<T>(
  method: string,
  url: string,
  body: any,
  options: RequestOptions,
  retry = true,
): Promise<T> {
  const skipAuth = options.skipAuth ?? false;

  if (!skipAuth && typeof window !== 'undefined') {
    const expMs = getAccessTokenExpiryMs();
    if (expMs != null && expMs - Date.now() < PROACTIVE_REFRESH_LEAD_MS) {
      await ensureRefreshed();
    }
  }

  const headers = { ...getHeaders(skipAuth), ...options.headers };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };
  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);
    return handleResponse<T>(response);
  } catch (rawErr) {
    const err = normalizeRequestError(rawErr);
    if (!retry || skipAuth) throw err;
    if (!(err instanceof ApiError)) throw err;
    if (!AUTH_EXPIRE_RETRY_CODES.has(err.code ?? -1)) throw err;
    const ok = await ensureRefreshed();
    if (!ok) {
      clearAuthToken();
      redirectToSignIn();
      throw err;
    }
    // refresh 后重试一次
    return requestWithAutoRefresh<T>(method, url, body, options, false);
  }
}
