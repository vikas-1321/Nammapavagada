import { Platform } from 'react-native';

// Default host: Live AWS EC2 Secure HTTPS SSL Domain (accessible on all networks & Android OS)
export const DEFAULT_HOST = 'https://3-6-201-177.sslip.io/api';

class ApiClient {
  private baseUrl: string = DEFAULT_HOST;
  private token: string | null = null;
  private onUnauthorizedCallback: (() => void) | null = null;

  public setBaseUrl(url: string) {
    this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setToken(token: string | null) {
    this.token = token;
  }

  public getToken(): string | null {
    return this.token;
  }

  public onUnauthorized(callback: () => void) {
    this.onUnauthorizedCallback = callback;
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = new Headers(options.headers || {});

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Accept', 'application/json');

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        this.token = null;
        if (this.onUnauthorizedCallback) {
          this.onUnauthorizedCallback();
        }
        throw new Error('Your session has expired or is unauthorized. Please sign in again.');
      }

      if (response.status === 204) {
        return {} as T;
      }

      const json = await response.json().catch(() => null);

      if (!response.ok || (json && json.success === false)) {
        const errorMsg =
          json?.error?.message ||
          json?.message ||
          `Request failed with status ${response.status} (${response.statusText})`;
        throw new Error(errorMsg);
      }

      return (json && json.data !== undefined ? json.data : json) as T;
    } catch (err: any) {
      if (err.message && err.message.includes('Network request failed')) {
        throw new Error(
          `Unable to connect to server at ${this.baseUrl}. Please verify backend is running and reachable.`
        );
      }
      throw err;
    }
  }

  public get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const qp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          qp.append(k, String(v));
        }
      });
      const qs = qp.toString();
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  public post<T = any>(endpoint: string, data?: any): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data || {}),
    });
  }

  public put<T = any>(endpoint: string, data?: any): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data || {}),
    });
  }

  public patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data || {}),
    });
  }

  public delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  public async uploadPhoto(
    fileUri: string,
    meta: {
      entityType: string;
      entityId: string;
      caption?: string;
      altText?: string;
      isPrimary?: boolean;
      photoType?: string;
      fileName?: string;
      mimeType?: string;
    }
  ): Promise<any> {
    const formData = new FormData();
    const filename = meta.fileName || fileUri.split('/').pop() || 'photo.jpg';
    const type = meta.mimeType || 'image/jpeg';

    // React Native FormData file object contract
    formData.append('file', {
      uri: fileUri,
      name: filename,
      type,
    } as any);

    formData.append('entityType', meta.entityType);
    formData.append('entityId', meta.entityId);
    if (meta.caption) formData.append('caption', meta.caption);
    if (meta.altText) formData.append('altText', meta.altText);
    if (meta.isPrimary !== undefined) formData.append('isPrimary', String(meta.isPrimary));
    if (meta.photoType) formData.append('photoType', meta.photoType);

    return this.request('/admin/photos/upload', {
      method: 'POST',
      body: formData,
    });
  }
}

export const apiClient = new ApiClient();
