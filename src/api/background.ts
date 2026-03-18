import { apiClient } from './client';
import type { KlineReading, MarketInterval, MarketStory } from '@/features/market-analysis/types';

export async function fetchDashboardBackgroundKline(params: {
  exchange: string;
  symbol: string;
  interval: MarketInterval | 'all';
  skipAuth?: boolean;
}) {
  // 中文说明：后端 background_read 接口在 /api 前缀下挂载，且无需 JWT 验证。
  const { exchange, symbol, interval, skipAuth = true } = params;
  const safeSymbol = encodeURIComponent(symbol);
  return apiClient.get<KlineReading | Partial<Record<MarketInterval, KlineReading>>>(
    `/api/dashboard/background/kline/${exchange}/${safeSymbol}/${interval}`,
    { skipAuth }
  );
}

export async function fetchDashboardMarketStructure(params: {
  exchange: string;
  symbol: string;
  skipAuth?: boolean;
}) {
  // 中文说明：读取市场结构叙事（market_structure），后端在 /api 前缀下挂载，且无需 JWT 验证。
  const { exchange, symbol, skipAuth = true } = params;
  const safeSymbol = encodeURIComponent(symbol);
  return apiClient.get<MarketStory | null>(`/api/dashboard/background/market_structure/${exchange}/${safeSymbol}`, {
    skipAuth
  });
}
