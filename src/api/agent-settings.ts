import { API_BASE_URL, ApiError, getHeaders, handleResponse } from './client';
import type {
  AgentModelConfigCreateIn,
  AgentModelConfigItem,
  ModelProviderItem,
} from '@/features/agent-settings/types';

type HttpMethod = 'GET' | 'POST';

interface RequestOptions {
  timeoutMs?: number;
  retries?: number;
  skipAuth?: boolean;
}

type CacheEntry<T> = {
  ts: number;
  promise: Promise<T>;
};

const requestCache = new Map<string, CacheEntry<any>>();
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRIES = 3;
const CACHE_TTL_MS = 10_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withJitter(ms: number) {
  const jitter = Math.floor(Math.random() * 100);
  return ms + jitter;
}

function isRetryableStatus(status: number) {
  return status === 408 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function isRetryableError(err: unknown) {
  if (err instanceof ApiError) {
    return isRetryableStatus(err.status);
  }
  return true;
}

/**
 * 带超时、指数退避重试与请求去重缓存的 API 请求封装。
 * - 缓存用于避免页面挂载/切换时重复拉取同一资源
 * - 失败重试采用指数退避 + 抖动，降低瞬时网络抖动对用户体验的影响
 */
async function requestWithRetry<T>(
  cacheKey: string,
  method: HttpMethod,
  url: string,
  body: any | undefined,
  options: RequestOptions = {}
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;

  const now = Date.now();
  const cached = requestCache.get(cacheKey);
  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return cached.promise;
  }

  const promise = (async () => {
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < retries; attempt += 1) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const res = await fetch(`${API_BASE_URL}${url}`, {
          method,
          headers: getHeaders(options.skipAuth),
          body: body ? JSON.stringify(body) : undefined,
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        return await handleResponse<T>(res);
      } catch (err) {
        clearTimeout(timer);
        lastErr = err;
        if (attempt === retries - 1 || !isRetryableError(err)) {
          throw err;
        }
        const backoffMs = withJitter(300 * Math.pow(2, attempt));
        await sleep(backoffMs);
      }
    }
    throw lastErr;
  })();

  requestCache.set(cacheKey, { ts: now, promise });
  return promise;
}

async function tryRequestFallback<T>(
  cacheKey: string,
  method: HttpMethod,
  primaryUrl: string,
  fallbackUrl: string,
  body: any | undefined,
  options: RequestOptions = {}
): Promise<T> {
  try {
    return await requestWithRetry<T>(`${cacheKey}:primary`, method, primaryUrl, body, options);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return await requestWithRetry<T>(`${cacheKey}:fallback`, method, fallbackUrl, body, options);
    }
    throw err;
  }
}

export const agentSettingsApi = {
  listAgentModelConfigs: (options?: RequestOptions) =>
    requestWithRetry<AgentModelConfigItem[]>(
      'agent_model_configs:list',
      'GET',
      '/api/settings/agent_model_configs',
      undefined,
      options
    ),

  createAgentModelConfig: (data: AgentModelConfigCreateIn, options?: RequestOptions) =>
    requestWithRetry<AgentModelConfigItem>(
      `agent_model_configs:create:${data.agent_name}`,
      'POST',
      '/api/settings/agent_model_configs',
      data,
      options
    ),

  listModelProviders: (options?: RequestOptions) =>
    requestWithRetry<ModelProviderItem[]>(
      'model_providers:list',
      'GET',
      '/api/settings/model_providers',
      undefined,
      options
    ),
};

