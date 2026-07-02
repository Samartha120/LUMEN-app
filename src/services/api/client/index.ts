import { env } from "@/config/env";

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string>;
  token?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = env.apiUrl) {
    this.baseUrl = baseUrl;
  }

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const { params, token, headers, ...restOptions } = options;

    let url = `${this.baseUrl}${path}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const requestHeaders = new Headers(headers);
    requestHeaders.set("Content-Type", "application/json");
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      headers: requestHeaders,
      ...restOptions,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient();

export const apiclientModule = {
  name: "apiclient",
} as const;
