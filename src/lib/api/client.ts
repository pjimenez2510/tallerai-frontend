import type { ApiError, ApiResponse } from '@/types/api.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json: unknown = await response.json();

  if (!response.ok) {
    throw json as ApiError;
  }

  return json as ApiResponse<T>;
}

export const apiClient = {
  get<T>(path: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return apiRequest<T>(path, { method: 'GET', headers });
  },

  post<T>(path: string, body: unknown, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return apiRequest<T>(path, { method: 'POST', body, headers });
  },

  patch<T>(path: string, body: unknown, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return apiRequest<T>(path, { method: 'PATCH', body, headers });
  },

  put<T>(path: string, body: unknown, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return apiRequest<T>(path, { method: 'PUT', body, headers });
  },

  delete<T>(path: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return apiRequest<T>(path, { method: 'DELETE', headers });
  },
};
