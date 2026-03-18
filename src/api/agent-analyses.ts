import { apiClient } from './client';

export type AgentAnalysisSummary = {
  agent_name: string;
  model_version?: string | null;
  risk_action?: string | null;
  mark_price?: string | null;
  market_accuracy?: string | null;
  decision_quality?: string | null;
  created_at: string;
};

export type EventAnalysesResponse = {
  event_id: string;
  event_pk: number;
  event_type: string;
  event_at: number;
  agents: AgentAnalysisSummary[];
};

export type BatchEventAnalysesItem = {
  event_id: string;
  found: boolean;
  event_pk?: number | null;
  agents: AgentAnalysisSummary[];
};

export async function fetchEventAnalyses(params: {
  tradeId: string;
  eventId: string;
  latestPerAgent?: boolean;
}) {
  // 中文说明：前端提交 trade_id + 事件业务 event_id，后端会自动映射到 trade_events.id 再查询 agent_analyses。
  const { tradeId, eventId, latestPerAgent = true } = params;
  const q = new URLSearchParams();
  q.set('latest_per_agent', latestPerAgent ? 'true' : 'false');
  q.set('include', 'full');
  const suffix = q.toString() ? `?${q.toString()}` : '';
  return apiClient.get<EventAnalysesResponse>(
    `/api/dashboard/trades/${encodeURIComponent(tradeId)}/events/${encodeURIComponent(eventId)}/analyses${suffix}`
  );
}

export async function fetchBatchEventAnalyses(params: {
  tradeId: string;
  eventIds: string[];
  latestPerAgent?: boolean;
}) {
  // 中文说明：用于“同一根 K 线下多个事件点”的一次性拉取，避免按钮切换时频繁请求。
  const { tradeId, eventIds, latestPerAgent = true } = params;
  return apiClient.post<BatchEventAnalysesItem[]>(
    `/api/dashboard/trades/${encodeURIComponent(tradeId)}/events/analyses:batch`,
    {
      event_ids: eventIds,
      latest_per_agent: latestPerAgent,
      include: 'full'
    }
  );
}

