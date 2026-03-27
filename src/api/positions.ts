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
};
