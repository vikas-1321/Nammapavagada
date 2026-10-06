/**
 * Namma Pavagada - Centralized API Client
 * Interfaces with the backend REST API with failover to cached/local data
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private baseUrl: string = API_BASE_URL;

  public async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T | null> {
    try {
      let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            queryParams.append(k, String(v));
          }
        });
        const qs = queryParams.toString();
        if (qs) url += `?${qs}`;
      }

      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        console.warn(`[ApiClient] GET ${endpoint} responded with status ${res.status}`);
        return null;
      }

      const json: ApiResponse<T> = await res.json();
      return json.success && json.data !== undefined ? json.data : null;
    } catch (err) {
      console.warn(`[ApiClient] Network request failed for ${endpoint}:`, err);
      return null;
    }
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }
}

export const apiClient = new ApiClient();
