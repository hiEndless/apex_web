import { apiClient } from './client';

export type KlineItem = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export async function fetchDashboardKlines(params: {
  exchange: string;
  symbol: string;
  interval: string;
  skipAuth?: boolean;
}) {
  // 中文说明：后端 dashboard klines 接口在 /api 前缀下挂载，且无需 JWT 验证。
  const { exchange, symbol, interval, skipAuth = true } = params;
  const safeSymbol = encodeURIComponent(symbol);
  return apiClient.get<KlineItem[]>(`/api/dashboard/klines/${exchange}/${safeSymbol}/${interval}`, { skipAuth });
}

