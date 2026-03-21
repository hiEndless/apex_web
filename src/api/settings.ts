import { apiClient } from './client';
import {
  ExchangeAccount,
  ExchangeAccountCreate,
  ModelProvider,
  ModelProviderCreate,
  ModelProviderUpdate,
  SystemPreference,
} from '@/features/settings/types';

const EXCHANGE_ACCOUNTS_BASE = '/api/settings/exchange-accounts';

export const settingsApi = {
  /** 合并交易员(只读)与跟单 API 列表；团队管理员可传 includeTeamStudios 聚合名下工作室只读 API */
  getExchangeAccounts: async (options?: { includeTeamStudios?: boolean }) => {
    const qs =
      options?.includeTeamStudios === true ? '?include_team_studios=true' : '';
    const [trader, follower] = await Promise.all([
      apiClient.get<ExchangeAccount[]>(`${EXCHANGE_ACCOUNTS_BASE}/trader${qs}`),
      apiClient.get<ExchangeAccount[]>(`${EXCHANGE_ACCOUNTS_BASE}/follower`),
    ]);
    const merged = [...trader, ...follower];
    merged.sort((a, b) => b.id - a.id);
    return merged;
  },

  createExchangeAccount: (data: ExchangeAccountCreate) => {
    return apiClient.post<ExchangeAccount>(EXCHANGE_ACCOUNTS_BASE, {
      ...data,
      flag: data.flag ?? 0,
    });
  },

  deleteExchangeAccount: (id: number) => {
    return apiClient.delete<{ id: number }>(`${EXCHANGE_ACCOUNTS_BASE}/${id}`);
  },

  getModelProviders: () => {
    return apiClient.get<ModelProvider[]>('/api/settings/model_providers');
  },

  createModelProvider: (data: ModelProviderCreate) => {
    return apiClient.post<ModelProvider>('/api/settings/model_providers', data);
  },

  updateModelProvider: (id: string, data: ModelProviderUpdate) => {
    return apiClient.patch<ModelProvider>(`/api/settings/model_providers/${id}`, data);
  },

  deleteModelProvider: (id: string) => {
    return apiClient.delete<void>(`/api/settings/model_providers/${id}`);
  },

  listSystemPreferences: () => {
    return apiClient.get<SystemPreference[]>('/api/settings/system_preferences');
  },

  upsertSystemPreference: (data: { key: string; value: any }) => {
    return apiClient.post<SystemPreference>('/api/settings/system_preferences', data);
  },
};
