import { apiClient } from './client';

export type CurrentPosition = {
  instId?: string;
  margin?: string;
  markPx?: string;
  mgnMode?: string;
  upl?: string;
  lever?: string;
  cTime?: string;
  avgPx?: string;
  uplRatio?: string;
  pos?: string;
  posSide?: string;
};

export type CurrentTradersPositionItem = {
  api_id: number;
  api_name: string;
  platform: string;
  ok: boolean;
  error: string;
  positions: CurrentPosition[];
};

export type CurrentTradersPositionsResponse = {
  studio_id: number;
  inst_type: string;
  total: number;
  success_count: number;
  failed_count: number;
  items: CurrentTradersPositionItem[];
};

export type CloseAllPositionRequest = {
  follower_api_id: number;
  inst_id: string;
  mgn_mode: string;
  pos_side: string;
};

export interface StudioTotalPnlResponse {
  studio_id: number;
  interval: string;
  timezone: string;
  range: {
    start_at: string;
    end_at: string;
  };
  summary: {
    readonly_api_count: number;
    total_pnl: string;
  };
}

export interface StudioPnlRankingItem {
  rank: number;
  api_id: number;
  api_name: string;
  total_pnl: string;
  cum_pnl: string;
}

export interface StudioPnlRankingResponse {
  studio_id: number;
  interval: string;
  timezone: string;
  range: {
    start_at: string;
    end_at: string;
  };
  items: StudioPnlRankingItem[];
}

export interface StudioTradeCountRankingItem {
  rank: number;
  api_id: number;
  api_name: string;
  total_trade_count: number;
  cum_trade_count: number;
}

export interface StudioTradeCountRankingResponse {
  studio_id: number;
  interval: string;
  timezone: string;
  range: {
    start_at: string;
    end_at: string;
  };
  items: StudioTradeCountRankingItem[];
}

export const positionsApi = {
  /**
   * 获取当前工作室下所有交易API（非只读）的实时持仓
   */
  getCurrentTradersPositions: async (instType = 'SWAP') => {
    return apiClient.get<CurrentTradersPositionsResponse>(
      `/api/positions/current-traders?instType=${instType}`
    );
  },

  /**
   * 按指定品种与方向执行仓位全平
   */
  closeAllPosition: async (payload: CloseAllPositionRequest) => {
    return apiClient.post<void>('/api/positions/close-all', payload);
  },

  getStudioTotalPnl: async (days: number = 7) => {
    return apiClient.get<StudioTotalPnlResponse>(`/api/positions/pnl/readonly/studio-total?days=${days}`);
  },

  getStudioPnlRanking: async (days: number = 1) => {
    return apiClient.get<StudioPnlRankingResponse>(`/api/positions/pnl/readonly/studio-ranking?days=${days}`);
  },

  getStudioTradeCountRanking: async (days: number = 1) => {
    return apiClient.get<StudioTradeCountRankingResponse>(`/api/positions/pnl/readonly/studio-trade-count-ranking?days=${days}`);
  },
};
