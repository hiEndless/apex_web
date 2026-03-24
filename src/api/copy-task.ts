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

export const copyTaskApi = {
  getGroupedBindings: () => {
    return apiClient.get<Record<string, GroupedBinding>>('/api/copy-task/follow-bindings/grouped');
  },

  getReadonlyApiPnlStats: (interval: string = '7d') => {
    return apiClient.get<PnlStatsResponse>(`/api/positions/pnl/readonly?interval=${interval}`);
  }
};