import { apiClient } from './client';

export interface LoginPayload {
  account: string;
  password: string;
}

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
  session_id: number;
  user_id: number;
  username: string;
  studio_id: number | null;
  studio_code: string | null;
  studio_name: string | null;
  is_super_admin: boolean;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email?: string;
  studio_name: string;
  invite_code: string;
}

export interface RegisterResult {
  user_id: number;
  username: string;
  studio_id: number;
  studio_code: string;
}

const AUTH_OPTIONS = { skipAuth: true as const };

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResult>('/api/auth/login', payload, AUTH_OPTIONS),

  register: (payload: RegisterPayload) =>
    apiClient.post<RegisterResult>('/api/auth/register', payload, AUTH_OPTIONS),

  refresh: (payload: { refresh_token: string }) =>
    apiClient.post<LoginResult>('/api/auth/refresh', payload, AUTH_OPTIONS),
};
