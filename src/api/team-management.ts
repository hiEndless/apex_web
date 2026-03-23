import { apiClient } from './client';

// types
export type ManagerLevelProfile = {
  team_manager_user_id: number;
  level_id: number | null;
  level_code: string | null;
  level_name: string | null;
  commission_rate: string;
  effective_at: string | null;
};

export type CommissionSummary = {
  team_manager_user_id: number;
  total_commission: string;
  withdrawn_commission: string;
  pending_commission: string;
};

export type TeamPrice = {
  plan_code: string;
  month_price: string;
};

export const teamManagementApi = {
  // 获取团队管理员等级信息
  getManagerLevelProfile: () => {
    return apiClient.get<ManagerLevelProfile>('/api/team-management/manager-level-profile');
  },

  // 获取团队分润汇总
  getCommissionSummary: () => {
    return apiClient.get<CommissionSummary>('/api/settings/memberships/revenue/team-commission-summary');
  },

  // 获取渠道定价
  getTeamOverrides: () => {
    return apiClient.get<TeamPrice[]>('/api/settings/memberships/pricing/team-overrides');
  },

  // 更新渠道定价
  updateTeamOverride: (planCode: string, monthPrice: string) => {
    return apiClient.put(`/api/settings/memberships/pricing/team-overrides/${planCode}`, {
      month_price: monthPrice,
    });
  },
};
