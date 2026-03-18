import { apiClient } from './client';

export type BackendPositionItem = {
  symbol: string;
  position_side: string;
  size: string;
  notional: string;
  pnl_ratio: string;
  open_time: string;
  trade_id: string;
  initialMargin: string;
  leverage: string;
  markPrice: string;
  entryPrice: string;
};

export type BackendExchangePositionsResponse = {
  positions: BackendPositionItem[];
  exchange: string;
};

export async function fetchExchangePositions(params: { exchange: string; symbol?: string }) {
  // 中文说明：positions 接口需要 JWT 鉴权，用于读取“当前用户 + 当前激活账户”的仓位快照。
  const { exchange, symbol } = params;
  const q = symbol ? `?symbol=${encodeURIComponent(symbol)}` : '';
  return apiClient.get<BackendExchangePositionsResponse>(`/api/dashboard/positions/${encodeURIComponent(exchange)}${q}`);
}
