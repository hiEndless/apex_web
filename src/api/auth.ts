import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
}

export interface MeResponse {
  user: User;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export interface LoginSessionResponse {
  login_id: string;
}

export interface ExchangeResponse {
  access_token: string;
  refresh_token: string;
}

export interface CreateLoginSessionRequest {
  code_verifier: string;
  state: string;
  redirect_uri: string;
}

export interface ExchangeRequest {
  code: string;
  login_id: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export const authApi = {
  createLoginSession: (data: CreateLoginSessionRequest) => {
    return apiClient.post<LoginSessionResponse>('/api/auth/login-session', data);
  },

  exchange: (data: ExchangeRequest) => {
    return apiClient.post<ExchangeResponse>('/api/auth/exchange', data);
  },

  refresh: (data: RefreshRequest) => {
    return apiClient.post<RefreshResponse>('/api/auth/refresh', data, { skipAuth: true });
  },

  me: (token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return apiClient.get<MeResponse>('/api/me', { headers });
  },

  logout: () => {
    return apiClient.post<{ ok: boolean }>('/api/auth/logout', {});
  },
};
