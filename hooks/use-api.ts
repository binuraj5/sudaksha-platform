'use client';

import { useCallback, useMemo } from 'react';

interface ApiClient {
  get: (url: string, options?: RequestInit) => Promise<Response>;
  post: (url: string, body?: unknown, options?: RequestInit) => Promise<Response>;
  put: (url: string, body?: unknown, options?: RequestInit) => Promise<Response>;
  patch: (url: string, body?: unknown, options?: RequestInit) => Promise<Response>;
  delete: (url: string, options?: RequestInit) => Promise<Response>;
}

export function useApi(): { api: ApiClient } {
  const request = useCallback(async (url: string, options?: RequestInit): Promise<Response> => {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    return res;
  }, []);

  const api: ApiClient = useMemo(() => ({
    get: (url, options) => request(url, { method: 'GET', ...options }),
    post: (url, body, options) =>
      request(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...options }),
    put: (url, body, options) =>
      request(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, ...options }),
    patch: (url, body, options) =>
      request(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, ...options }),
    delete: (url, options) => request(url, { method: 'DELETE', ...options }),
  }), [request]);

  return { api };
}
