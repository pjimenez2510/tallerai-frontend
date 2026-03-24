import type { ApiError, ApiResponse } from '@/types/api.types';
import type { RefreshResponse } from '@/types/auth.types';
import { useAuthStore } from '@/stores/auth.store';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  skipAuth?: boolean;
};

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      logout();
      return false;
    }

    const json = (await response.json()) as ApiResponse<RefreshResponse>;
    setTokens(json.data.accessToken, json.data.refreshToken);
    return true;
  } catch {
    logout();
    return false;
  }
}

async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { body, headers, skipAuth, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (!skipAuth) {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      requestHeaders['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  let response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // If 401 and we have a refresh token, try refreshing
  if (response.status === 401 && !skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const refreshed = await (refreshPromise ?? Promise.resolve(false));

    if (refreshed) {
      // Retry with new token
      const { accessToken } = useAuthStore.getState();
      requestHeaders['Authorization'] = `Bearer ${accessToken}`;

      response = await fetch(`${API_URL}${path}`, {
        ...rest,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    }
  }

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

  post<T>(
    path: string,
    body: unknown,
    options?: { headers?: HeadersInit; skipAuth?: boolean },
  ): Promise<ApiResponse<T>> {
    return apiRequest<T>(path, {
      method: 'POST',
      body,
      headers: options?.headers,
      skipAuth: options?.skipAuth,
    });
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
