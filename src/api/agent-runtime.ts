'use client';

import { apiClient } from './client';

export type AgentStatus = {
  status_source: string;
  alive: boolean;
  enabled: boolean;
  ready: boolean;
  reasons: string[];
  config_ready: boolean;
  config_reasons: string[];
  config_required_agents: string[];
  last_ts?: number | null;
  modules: Record<string, any>;
};

export const agentRuntimeApi = {
  getStatus: () => apiClient.get<AgentStatus>('/api/agent/status'),
  setEnabled: (enabled: boolean) => apiClient.post<{ enabled: boolean }>('/api/agent/enabled', { enabled })
};
