import { apiClient } from './client';
import {
  LocationItem,
  DuplicateCandidate,
  DataFreshnessStats,
  DashboardOverview,
  PlaceStatus,
} from '../types';

export interface PlaceQueryParams {
  category?: string;
  subcategory?: string;
  area?: string;
  tags?: string;
  verification?: string;
  needsVerification?: boolean;
  status?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export const placesApi = {
  getPlaces: async (
    params: PlaceQueryParams = {}
  ): Promise<{ items: LocationItem[]; total: number; limit: number; offset: number }> => {
    return apiClient.get('/admin/places', params);
  },

  getPlaceById: async (id: string): Promise<LocationItem> => {
    return apiClient.get<LocationItem>(`/admin/places/${id}`);
  },

  createPlace: async (data: Partial<LocationItem>): Promise<LocationItem> => {
    return apiClient.post<LocationItem>('/admin/places', data);
  },

  updatePlace: async (id: string, data: Partial<LocationItem>): Promise<LocationItem> => {
    return apiClient.put<LocationItem>(`/admin/places/${id}`, data);
  },

  updatePlaceStatus: async (id: string, status: PlaceStatus): Promise<LocationItem> => {
    return apiClient.patch<LocationItem>(`/admin/places/${id}/status`, { status });
  },

  archivePlace: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/places/${id}`);
  },

  checkDuplicate: async (params: {
    name: string;
    category?: string;
    area?: string;
    excludeId?: string;
  }): Promise<{ hasDuplicates: boolean; duplicates: DuplicateCandidate[] }> => {
    return apiClient.get('/admin/places/check-duplicate', params);
  },

  duplicatePlace: async (id: string): Promise<LocationItem> => {
    return apiClient.post<LocationItem>(`/admin/places/${id}/duplicate`);
  },

  getFreshnessStats: async (): Promise<DataFreshnessStats> => {
    return apiClient.get<DataFreshnessStats>('/admin/places/freshness');
  },

  getDashboardOverview: async (): Promise<DashboardOverview> => {
    return apiClient.get<DashboardOverview>('/admin/overview');
  },
};
