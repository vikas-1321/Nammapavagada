import {
  AdminUser,
  Category,
  LocationItem,
  BusRoute,
  BusStop,
  RouteStop,
  BusTiming,
  Hospital,
  EducationalInstitution,
  Theatre,
  HistoryEra,
  HistoricalPlace,
  PhotoItem,
  PhotoRequest,
  AuditLogItem,
  DashboardOverview,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class AdminApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('npweb_admin_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('npweb_admin_token', token);
    } else {
      localStorage.removeItem('npweb_admin_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = new Headers(options.headers || {});

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Accept', 'application/json');

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      this.setToken(null);
      window.dispatchEvent(new Event('npweb_admin_unauthorized'));
      throw new Error('Your session has expired. Please log in again.');
    }

    const json = await response.json();
    if (!response.ok || !json.success) {
      const errMsg = json.error?.message || `Request failed with status ${response.status}`;
      throw new Error(errMsg);
    }

    return json.data as T;
  }

  // --- Auth ---
  public async login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const res = await this.request<{ token: string; user: AdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  public async getMe(): Promise<AdminUser> {
    return this.request<AdminUser>('/auth/me');
  }

  public async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // --- Overview ---
  public async getOverview(): Promise<DashboardOverview> {
    return this.request<DashboardOverview>('/admin/overview');
  }

  // --- Categories ---
  public async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  public async createCategory(data: Partial<Category>): Promise<Category> {
    return this.request<Category>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Locations ---
  public async getLocations(params?: { category?: string; q?: string; status?: string; limit?: number }): Promise<{ items: LocationItem[]; total: number }> {
    const qp = new URLSearchParams();
    if (params?.category && params.category !== 'ALL') qp.append('category', params.category);
    if (params?.q) qp.append('q', params.q);
    if (params?.status) qp.append('status', params.status);
    if (params?.limit) qp.append('limit', String(params.limit));
    return this.request<{ items: LocationItem[]; total: number }>(`/admin/locations?${qp.toString()}`);
  }

  public async getLocation(id: string): Promise<LocationItem> {
    return this.request<LocationItem>(`/admin/locations/${id}`);
  }

  public async createLocation(data: Partial<LocationItem>): Promise<LocationItem> {
    return this.request<LocationItem>('/admin/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateLocation(id: string, data: Partial<LocationItem>): Promise<LocationItem> {
    return this.request<LocationItem>(`/admin/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async setLocationStatus(id: string, status: string): Promise<LocationItem> {
    return this.request<LocationItem>(`/admin/locations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  public async deleteLocation(id: string): Promise<void> {
    return this.request<void>(`/admin/locations/${id}`, { method: 'DELETE' });
  }

  // --- Buses ---
  public async getBusRoutes(params?: { status?: string; q?: string }): Promise<{ items: BusRoute[]; total: number }> {
    const qp = new URLSearchParams();
    if (params?.status) qp.append('status', params.status);
    if (params?.q) qp.append('q', params.q);
    return this.request<{ items: BusRoute[]; total: number }>(`/admin/buses/routes?${qp.toString()}`);
  }

  public async getBusRoute(id: string): Promise<BusRoute> {
    return this.request<BusRoute>(`/buses/routes/${id}`);
  }

  public async createBusRoute(data: Partial<BusRoute>): Promise<BusRoute> {
    return this.request<BusRoute>('/admin/buses/routes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateBusRoute(id: string, data: Partial<BusRoute>): Promise<BusRoute> {
    return this.request<BusRoute>(`/admin/buses/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async deleteBusRoute(id: string): Promise<void> {
    return this.request<void>(`/admin/buses/routes/${id}`, {
      method: 'DELETE',
    });
  }

  public async getBusStops(q?: string): Promise<BusStop[]> {
    const qp = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.request<BusStop[]>(`/buses/stops${qp}`);
  }

  public async createBusStop(data: Partial<BusStop>): Promise<BusStop> {
    return this.request<BusStop>('/admin/buses/stops', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateBusStop(stopId: string, data: Partial<BusStop>): Promise<BusStop> {
    return this.request<BusStop>(`/admin/buses/stops/${stopId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async addStopToRoute(routeId: string, stopId: string, sequence?: number, isMajor?: boolean, arrivalEstimateMinutes?: number): Promise<RouteStop> {
    return this.request<RouteStop>(`/admin/buses/routes/${routeId}/stops`, {
      method: 'POST',
      body: JSON.stringify({ stopId, sequence, isMajorStop: isMajor, arrivalEstimateMinutes }),
    });
  }

  public async removeStopFromRoute(routeId: string, stopId: string): Promise<BusRoute> {
    return this.request<BusRoute>(`/admin/buses/routes/${routeId}/stops/${stopId}`, {
      method: 'DELETE',
    });
  }

  public async updateRouteStop(routeId: string, stopId: string, data: { isMajorStop?: boolean; sequence?: number; arrivalEstimateMinutes?: number }): Promise<BusRoute> {
    return this.request<BusRoute>(`/admin/buses/routes/${routeId}/stops/${stopId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async reorderRouteStops(routeId: string, stopIds: string[]): Promise<BusRoute> {
    return this.request<BusRoute>(`/admin/buses/routes/${routeId}/reorder-stops`, {
      method: 'PUT',
      body: JSON.stringify({ stopIds }),
    });
  }

  public async addBusTiming(routeId: string, data: Partial<BusTiming>): Promise<BusTiming> {
    return this.request<BusTiming>(`/admin/buses/routes/${routeId}/timings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async deleteBusTiming(timingId: number): Promise<void> {
    return this.request<void>(`/admin/buses/timings/${timingId}`, { method: 'DELETE' });
  }

  // --- Hospitals ---
  public async getHospitals(q?: string): Promise<Hospital[]> {
    const qp = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.request<Hospital[]>(`/admin/hospitals${qp}`);
  }

  public async createHospital(data: Partial<Hospital>): Promise<Hospital> {
    return this.request<Hospital>('/admin/hospitals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateHospital(id: string, data: Partial<Hospital>): Promise<Hospital> {
    return this.request<Hospital>(`/admin/hospitals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Education ---
  public async getSchools(q?: string): Promise<EducationalInstitution[]> {
    const qp = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.request<EducationalInstitution[]>(`/admin/schools${qp}`);
  }

  public async getColleges(q?: string): Promise<EducationalInstitution[]> {
    const qp = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.request<EducationalInstitution[]>(`/admin/colleges${qp}`);
  }

  public async createInstitution(data: Partial<EducationalInstitution>): Promise<EducationalInstitution> {
    return this.request<EducationalInstitution>('/admin/education', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateInstitution(id: string, data: Partial<EducationalInstitution>): Promise<EducationalInstitution> {
    return this.request<EducationalInstitution>(`/admin/education/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Theatres ---
  public async getTheatres(q?: string): Promise<Theatre[]> {
    const qp = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.request<Theatre[]>(`/admin/theatres${qp}`);
  }

  public async createTheatre(data: Partial<Theatre>): Promise<Theatre> {
    return this.request<Theatre>('/admin/theatres', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateTheatre(id: string, data: Partial<Theatre>): Promise<Theatre> {
    return this.request<Theatre>(`/admin/theatres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- History ---
  public async getHistoryEras(): Promise<HistoryEra[]> {
    return this.request<HistoryEra[]>('/admin/history/eras');
  }

  public async createHistoryEra(data: Partial<HistoryEra>): Promise<HistoryEra> {
    return this.request<HistoryEra>('/admin/history/eras', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateHistoryEra(id: string, data: Partial<HistoryEra>): Promise<HistoryEra> {
    return this.request<HistoryEra>(`/admin/history/eras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async getHistoricalPlaces(): Promise<HistoricalPlace[]> {
    return this.request<HistoricalPlace[]>('/history/places');
  }

  public async createHistoricalPlace(data: Partial<HistoricalPlace>): Promise<HistoricalPlace> {
    return this.request<HistoricalPlace>('/admin/history/places', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Photos & S3 Media ---
  public async getPhotos(entityType: string, entityId: string): Promise<PhotoItem[]> {
    return this.request<PhotoItem[]>(`/photos/${entityType}/${entityId}`);
  }

  public async uploadPhoto(formData: FormData): Promise<PhotoItem> {
    return this.request<PhotoItem>('/admin/photos/upload', {
      method: 'POST',
      body: formData,
    });
  }

  public async setPrimaryPhoto(photoId: number): Promise<PhotoItem> {
    return this.request<PhotoItem>(`/admin/photos/${photoId}/primary`, {
      method: 'PUT',
    });
  }

  public async updatePhoto(photoId: number, data: Partial<PhotoItem>): Promise<PhotoItem> {
    return this.request<PhotoItem>(`/admin/photos/${photoId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async deletePhoto(photoId: number): Promise<void> {
    return this.request<void>(`/admin/photos/${photoId}`, {
      method: 'DELETE',
    });
  }

  public async getPhotoRequests(): Promise<PhotoRequest[]> {
    return this.request<PhotoRequest[]>('/admin/photos/requests');
  }

  // --- Search ---
  public async search(query: string): Promise<any> {
    return this.request(`/search?q=${encodeURIComponent(query)}`);
  }

  // --- Audit Logs ---
  public async getAuditLogs(params?: { entityType?: string; entityId?: string; limit?: number; offset?: number }): Promise<{ items: AuditLogItem[]; total: number }> {
    const qp = new URLSearchParams();
    if (params?.entityType) qp.append('entityType', params.entityType);
    if (params?.entityId) qp.append('entityId', params.entityId);
    if (params?.limit) qp.append('limit', String(params.limit));
    if (params?.offset) qp.append('offset', String(params.offset));
    return this.request<{ items: AuditLogItem[]; total: number }>(`/admin/audit-logs?${qp.toString()}`);
  }

  // --- Admin Users ---
  public async getAdminUsers(): Promise<AdminUser[]> {
    return this.request<AdminUser[]>('/admin/users');
  }

  public async createAdminUser(data: { email: string; password: string; fullName: string; role: string }): Promise<AdminUser> {
    return this.request<AdminUser>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async toggleUserStatus(userId: number): Promise<AdminUser> {
    return this.request<AdminUser>(`/admin/users/${userId}/toggle-status`, {
      method: 'PATCH',
    });
  }

  // --- Health & Infrastructure Status ---
  public async getHealth(): Promise<{ status: string; database: string; s3Storage: string; region: string; bucket: string; environment: string }> {
    return this.request('/health');
  }
}

export const adminApi = new AdminApiClient();
