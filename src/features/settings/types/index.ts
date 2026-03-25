/** 与后端 `exchange_accounts._serialize_api_info` 对齐 */
export interface ExchangeAccount {
  id: number;
  user_id: number;
  studio_id: number;
  api_name: string;
  platform: string;
  flag: number;
  status: number;
  is_readonly: boolean;
  usdt: number;
  uid: string | null;
  created_at: string | null;
  scope_source?: 'current_studio' | 'admin_owned';
}

/** 与后端 `CreateApiRequest` 对齐 */
export interface ExchangeAccountCreate {
  platform: string;
  is_readonly: boolean;
  api_name: string;
  passphrase: string;
  api_key: string;
  secret_key: string;
  flag?: number;
}

export interface ModelProvider {
  id: string;
  provider: string;
  base_url: string;
  is_active: boolean;
  availability_status: 'unknown' | 'ok' | 'unavailable';
  unavailable_reason?: string;
  unavailable_until?: string;
  last_check_at?: string;
  last_error_at?: string;
  has_api_key: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModelProviderCreate {
  provider: string;
  base_url: string;
  api_key?: string;
  is_active?: boolean;
}

export interface ModelProviderUpdate {
  is_active?: boolean;
  api_key?: string;
  base_url?: string;
}

export interface SystemPreference {
  id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
}

export * from '../../notifications/types';
