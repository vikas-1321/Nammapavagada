/**
 * Namma Pavagada - Centralized API Client
 * Interfaces exclusively with the backend REST API
 * Single Source of Truth for all dynamic place and service information
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://3-6-201-177.sslip.io/api' || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  public status: number;
  public code: string;
  public isNetworkError: boolean;

  constructor(message: string, status: number = 500, code: string = 'API_ERROR', isNetworkError: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.isNetworkError = isNetworkError;
  }
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface RequestOptions {
  forceRefresh?: boolean;
  ttlMs?: number;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string = API_BASE_URL;
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTtlMs: number = 30_000; // 30 seconds TTL for near-real-time updates
  private inflightRequests: Map<string, Promise<unknown>> = new Map();
  private revalidateListeners: Set<() => void> = new Set();

  constructor() {
    // Setup near-real-time tab focus and visibility change revalidation
    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.invalidateCache();
          this.notifyRevalidate();
        }
      });

      window.addEventListener('focus', () => {
        this.invalidateCache();
        this.notifyRevalidate();
      });
    }
  }

  /**
   * Subscribe to global revalidation events (e.g. tab focus, network recovery)
   */
  public onRevalidate(callback: () => void): () => void {
    this.revalidateListeners.add(callback);
    return () => {
      this.revalidateListeners.delete(callback);
    };
  }

  private notifyRevalidate(): void {
    this.revalidateListeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('[ApiClient] Revalidation callback error:', err);
      }
    });
  }

  /**
   * Construct absolute URL with serialized query parameters
   */
  public buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): string {
    let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    if (params) {
      const qp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          qp.append(k, String(v));
        }
      });
      const qs = qp.toString();
      if (qs) url += `?${qs}`;
    }
    return url;
  }

  /**
   * Primary GET request method.
   * Throws ApiError on network or HTTP failures. Never silently returns fake data.
   */
  public async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const ttl = options.ttlMs ?? this.defaultTtlMs;
    const now = Date.now();

    // Check memory cache if not force refreshing
    if (!options.forceRefresh && ttl > 0) {
      const cached = this.cache.get(url);
      if (cached && now - cached.timestamp < ttl) {
        return cached.data as T;
      }
    }

    // Request deduplication for simultaneous in-flight identical calls
    if (this.inflightRequests.has(url)) {
      return this.inflightRequests.get(url) as Promise<T>;
    }

    const fetchPromise = (async () => {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            ...(options.headers || {}),
          },
        });

        if (!res.ok) {
          let errorMsg = `Server returned HTTP ${res.status}`;
          let errorCode = 'HTTP_ERROR';
          try {
            const errJson: ApiResponse<unknown> = await res.json();
            if (errJson.error?.message) {
              errorMsg = errJson.error.message;
            }
            if (errJson.error?.code) {
              errorCode = errJson.error.code;
            }
          } catch {
            // response was not JSON
          }
          throw new ApiError(errorMsg, res.status, errorCode, false);
        }

        const json: ApiResponse<T> = await res.json();
        if (!json.success && json.error) {
          throw new ApiError(
            json.error.message || 'API request indicated failure',
            res.status,
            json.error.code || 'API_FAILURE',
            false
          );
        }

        const result = (json.data !== undefined ? json.data : json) as T;

        // Store in cache
        if (ttl > 0) {
          this.cache.set(url, { data: result, timestamp: Date.now() });
        }

        return result;
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          throw err;
        }
        const errorText = err instanceof Error ? err.message : String(err);
        throw new ApiError(`Network connection failure: ${errorText}`, 0, 'NETWORK_ERROR', true);
      } finally {
        this.inflightRequests.delete(url);
      }
    })();

    this.inflightRequests.set(url, fetchPromise);
    return fetchPromise as Promise<T>;
  }

  /**
   * Primary POST request method.
   * Throws ApiError on network or HTTP failures.
   */
  public async post<T>(
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(options.headers || {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        let errorMsg = `Server returned HTTP ${res.status}`;
        let errorCode = 'HTTP_ERROR';
        try {
          const errJson: ApiResponse<unknown> = await res.json();
          if (errJson.error?.message) {
            errorMsg = errJson.error.message;
          }
          if (errJson.error?.code) {
            errorCode = errJson.error.code;
          }
        } catch {
          // non-JSON response
        }
        throw new ApiError(errorMsg, res.status, errorCode, false);
      }

      const json: ApiResponse<T> = await res.json();
      if (!json.success && json.error) {
        throw new ApiError(
          json.error.message || 'API request indicated failure',
          res.status,
          json.error.code || 'API_FAILURE',
          false
        );
      }

      return (json.data !== undefined ? json.data : json) as T;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      const errorText = err instanceof Error ? err.message : String(err);
      throw new ApiError(`Network connection failure: ${errorText}`, 0, 'NETWORK_ERROR', true);
    }
  }

  /**
   * Invalidate entire in-memory cache or specific URL prefix
   */
  public invalidateCache(prefix?: string): void {
    if (!prefix) {
      this.cache.clear();
      return;
    }
    const target = `${this.baseUrl}${prefix.startsWith('/') ? prefix : `/${prefix}`}`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(target)) {
        this.cache.delete(key);
      }
    }
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }
}

export const apiClient = new ApiClient();
