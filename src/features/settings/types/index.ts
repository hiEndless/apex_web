export interface ExchangeAccount {
  id: string;
  exchange: string;
  api_key_masked: string | null;
  api_label: string | null;
  is_read_only: boolean;
  is_active: boolean;
  has_api_secret: boolean;
  has_api_passphrase: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExchangeAccountCreate {
  exchange: string;
  api_key?: string;
  api_secret?: string;
  api_passphrase?: string;
  api_label?: string;
  is_read_only?: boolean;
  is_active?: boolean;
}

export interface ExchangeAccountUpdate {
  is_active?: boolean;
  api_label?: string;
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
