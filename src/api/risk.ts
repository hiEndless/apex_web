import { apiClient } from './client';

export async function fetchGlobalRiskState(params: { exchange: string }) {
  // 中文说明：全局风控状态属于账户敏感信息，需要 JWT 鉴权；后端会校验该交易所是否为当前用户的活跃账户。
  const { exchange } = params;
  return apiClient.get<unknown>(`/api/dashboard/risk/global/${encodeURIComponent(exchange)}`);
}

export async function fetchExecutionRiskState(params: {
  exchange: string;
  symbol: string;
  tradeId: string;
}) {
  // 中文说明：仓位风控状态属于账户敏感信息，需要 JWT 鉴权；后端会校验该交易所是否为当前用户的活跃账户。
  const { exchange, symbol, tradeId } = params;
  return apiClient.get<unknown>(
    `/api/dashboard/risk/execution/${encodeURIComponent(exchange)}/${encodeURIComponent(
      symbol
    )}/${encodeURIComponent(tradeId)}`
  );
}

export async function fetchTimeSemantics(params: { exchange: string; symbol: string; tradeId: string }) {
  // 中文说明：时间耐受因子属于账户敏感信息，需要 JWT 鉴权；后端会校验该交易所是否为当前用户的活跃账户。
  const { exchange, symbol, tradeId } = params;
  return apiClient.get<unknown>(
    `/api/dashboard/risk/time_semantics/${encodeURIComponent(exchange)}/${encodeURIComponent(
      symbol
    )}/${encodeURIComponent(tradeId)}`
  );
}
