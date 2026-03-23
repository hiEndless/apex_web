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
  is_team_manager: boolean;
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

/** GET /api/auth/studios 单项 */
export interface StudioListItem {
  studio_id: number;
  studio_code: string;
  studio_name: string;
  role: string | null;
  is_current: boolean;
}

/** POST /api/auth/switch-studio 成功体（与登录类似，不含 is_super_admin） */
export interface SwitchStudioResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
  session_id: number;
  user_id: number;
  username: string;
  studio_id: number;
  studio_code: string;
  studio_name: string;
  is_team_manager: boolean;
}

const AUTH_OPTIONS = { skipAuth: true as const };

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResult>('/api/auth/login', payload, AUTH_OPTIONS),

  register: (payload: RegisterPayload) =>
    apiClient.post<RegisterResult>('/api/auth/register', payload, AUTH_OPTIONS),

  refresh: (payload: { refresh_token: string }) =>
    apiClient.post<LoginResult>('/api/auth/refresh', payload, AUTH_OPTIONS),

  listStudios: () => apiClient.get<StudioListItem[]>('/api/auth/studios'),

  switchStudio: (payload: { studio_code: string }) =>
    apiClient.post<SwitchStudioResult>('/api/auth/switch-studio', payload),

  updateStudioName: async (studioName: string) => {
    return apiClient.post('/api/auth/studio/update-name', {
      studio_name: studioName
    });
  },

  changePassword: async (data: Record<string, any>) => {
    return apiClient.post('/api/auth/change-password', data);
  }
};
