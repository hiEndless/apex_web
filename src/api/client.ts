export const API_BASE_URL = process.env.NEXT_PUBLIC_MY_API_BASE_URL || 'http://localhost:9931';

export interface BaseResponse<T> {
  code: number;
  message: string;
  data: T;
}

export class ApiError extends Error {
  status: number;
  code?: number;
  data?: any;

  constructor(message: string, status: number, code?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export const getHeaders = (skipAuth = false) => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jwt') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token && !skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = response.statusText;
    let errorData: any = null;
    try {
      errorData = await response.json();
      // FastAPI typically returns {"detail": "message"}
      if (errorData && typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (errorData && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      } else {
        errorMessage = JSON.stringify(errorData);
      }
    } catch (e) {
      // If JSON parsing fails, fallback to text
      const text = await response.text().catch(() => null);
      if (text) errorMessage = text;
    }
    throw new ApiError(errorMessage, response.status, errorData?.code, errorData);
  }
  
  // 204 No Content has no body
  if (response.status === 204) {
    return null as T;
  }
  
  const resData = (await response.json()) as BaseResponse<T>;
  
  // Check for business error code (0 is success)
  if (resData.code !== 0) {
    throw new ApiError(resData.message || 'Unknown Error', response.status, resData.code, resData.data);
  }

  return resData.data;
}

interface RequestOptions {
  headers?: HeadersInit;
  skipAuth?: boolean;
}

export const apiClient = {
  get: async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: { ...getHeaders(options.skipAuth), ...options.headers },
    });
    return handleResponse<T>(response);
  },

  post: async <T>(url: string, body: any, options: RequestOptions = {}): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: { ...getHeaders(options.skipAuth), ...options.headers },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(url: string, body: any, options: RequestOptions = {}): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: { ...getHeaders(options.skipAuth), ...options.headers },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: { ...getHeaders(options.skipAuth), ...options.headers },
    });
    return handleResponse<T>(response);
  },
};
