import { apiClient } from './client';
import {
  ExchangeAccount,
  ExchangeAccountCreate,
  ExchangeAccountUpdate,
  ModelProvider,
  ModelProviderCreate,
  ModelProviderUpdate,
  SystemPreference,
} from '@/features/settings/types';

export const settingsApi = {
  getExchangeAccounts: () => {
    return apiClient.get<ExchangeAccount[]>('/api/settings/exchange_accounts');
  },

  createExchangeAccount: (data: ExchangeAccountCreate) => {
    return apiClient.post<ExchangeAccount>('/api/settings/exchange_accounts', data);
  },

  updateExchangeAccount: (id: string, data: ExchangeAccountUpdate) => {
    return apiClient.patch<ExchangeAccount>(`/api/settings/exchange_accounts/${id}`, data);
  },

  deleteExchangeAccount: (id: string) => {
    return apiClient.delete<void>(`/api/settings/exchange_accounts/${id}`);
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
