import { apiClient } from './client';

export type GroupedBinding = {
  trader_api_id: number;
  trader_api_name: string;
  trader_studio_id: number;
  followers: {
    follower_api_id: number;
    follower_api_name: string;
    follower_studio_id: number;
    ratio: number;
  }[];
};

export interface PnlStatsItem {
  api_id: number;
  api_name: string;
  studio_id: number;
  user_id: number;
  summary: {
    total_pnl: string;
  };
  daily_curve: Array<{
    date: string;
    day_pnl: string;
    cum_pnl: string;
  }>;
}

export interface PnlStatsResponse {
  interval: string;
  timezone: string;
  range: {
    start_at: string;
    end_at: string;
  };
  items: PnlStatsItem[];
}

export interface TimelineLogItem {
  id: number;
  event_ts: number;
  created_at: string;
  trader_api_id: number;
  trader_api_name: string;
  inst_id: string;
  action: string;
  side: string;
  pos_side: string;
  quantity: string;
  leverage: string;
  price: string;
}

export const copyTaskApi = {
  getGroupedBindings: () => {
    return apiClient.get<Record<string, GroupedBinding>>('/api/copy-task/follow-bindings/grouped');
  },

  getReadonlyApiPnlStats: (interval: string = '7d') => {
    return apiClient.get<PnlStatsResponse>(`/api/positions/pnl/readonly?interval=${interval}`);
  },

  getTraderTimeline: (params?: { start_at?: string; end_at?: string; order?: 'asc' | 'desc'; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.start_at) searchParams.append('start_at', params.start_at);
    if (params?.end_at) searchParams.append('end_at', params.end_at);
    if (params?.order) searchParams.append('order', params.order);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString();
    return apiClient.get<TimelineLogItem[]>(`/api/copy-task/logs/trader-timeline${query ? `?${query}` : ''}`);
  }
};