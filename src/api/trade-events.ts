import { apiClient } from './client';

export type TradeEventApiItem = {
  event_id: string;
  event_type: string;
  event_at: number;
  symbol?: string | null;
  exchange?: string | null;
  direction?: string;
  mark_price?: string | null;
  market_context?: unknown;
  market_structure?: unknown;
  event_data?: unknown;
  indicators_snapshot?: unknown;
  is_verified?: boolean;
  verification_at?: number | null;
  verification_mark_price?: string | null;
  event_importance?: number;
  event_summary?: string | null;
};

export async function fetchTradeEvents(params: {
  tradeId: string;
  since?: number;
  until?: number;
  limit?: number;
  key?: string;
}) {
  // 中文说明：trade events 接口需要 JWT 鉴权，用于读取“当前用户 + 指定 trade_id”的事件列表。
  const { tradeId, since, until, limit, key } = params;
  const q = new URLSearchParams();
  if (typeof since === 'number') q.set('since', String(since));
  if (typeof until === 'number') q.set('until', String(until));
  if (typeof limit === 'number') q.set('limit', String(limit));
  if (typeof key === 'string' && key.trim()) q.set('key', key.trim());
  const suffix = q.toString() ? `?${q.toString()}` : '';

  return apiClient.get<TradeEventApiItem[] | unknown>(
    `/api/dashboard/trades/${encodeURIComponent(tradeId)}/events${suffix}`
  );
}
