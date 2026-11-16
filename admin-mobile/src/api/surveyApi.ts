import { apiClient } from './client';
import {
  BuildingItem,
  BusinessItem,
  SurveyDashboardStats,
  SurveyorProfile,
  FloorItem,
  UnitItem,
  ProductServiceItem,
  FootfallItem,
} from '../types/survey';

export interface DuplicateCheckResponse {
  isDuplicateSuspected: boolean;
  matchCount: number;
  nearbyBuildings: Array<BuildingItem & { distanceMeters: number; nameMatch: boolean }>;
}

export interface MapMarkerItem {
  id: string;
  code: string;
  name: string;
  kannadaName?: string;
  latitude: number;
  longitude: number;
  buildingType: string;
  commercialSubtype?: string;
  address: string;
  area?: string;
  condition?: string;
  unitsCount: number;
  totalFloors: number;
}

export const surveyApi = {
  // --- Building APIs ---
  getBuildings: async (params?: {
    q?: string;
    type?: string;
    area?: string;
    minLat?: number;
    maxLat?: number;
    minLng?: number;
    maxLng?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ items: BuildingItem[]; total: number }> => {
    return apiClient.get('/buildings', params);
  },

  getBuildingById: async (id: string): Promise<BuildingItem> => {
    return apiClient.get(`/buildings/${id}`);
  },

  createBuilding: async (data: Partial<BuildingItem>): Promise<BuildingItem> => {
    return apiClient.post('/buildings', data);
  },

  updateBuilding: async (id: string, data: Partial<BuildingItem>): Promise<BuildingItem> => {
    return apiClient.put(`/buildings/${id}`, data);
  },

  deleteBuilding: async (id: string): Promise<{ deleted: boolean; id: string }> => {
    return apiClient.delete(`/buildings/${id}`);
  },

  checkDuplicateBuilding: async (data: {
    latitude: number;
    longitude: number;
    name?: string;
    radiusMeters?: number;
  }): Promise<DuplicateCheckResponse> => {
    return apiClient.post('/buildings/check-duplicate', data);
  },

  getBuildingMarkers: async (type?: string, query?: string): Promise<MapMarkerItem[]> => {
    return apiClient.get('/buildings/map/markers', { type, q: query });
  },

  addFloor: async (buildingId: string, data: Partial<FloorItem>): Promise<FloorItem> => {
    return apiClient.post(`/buildings/${buildingId}/floors`, data);
  },

  addUnit: async (buildingId: string, floorId: string, data: Partial<UnitItem>): Promise<UnitItem> => {
    return apiClient.post(`/buildings/${buildingId}/floors/${floorId}/units`, data);
  },

  addBuildingPhoto: async (buildingId: string, photo: { url: string; photoType?: string; caption?: string; isPrimary?: boolean }): Promise<any> => {
    return apiClient.post(`/buildings/${buildingId}/photos`, photo);
  },

  // --- Business APIs ---
  getBusinesses: async (params?: {
    buildingId?: string;
    categoryId?: string;
    subcategory?: string;
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: BusinessItem[]; total: number }> => {
    return apiClient.get('/businesses', params);
  },

  getBusinessById: async (id: string): Promise<BusinessItem> => {
    return apiClient.get(`/businesses/${id}`);
  },

  createBusiness: async (data: Partial<BusinessItem>): Promise<BusinessItem> => {
    return apiClient.post('/businesses', data);
  },

  updateBusiness: async (id: string, data: Partial<BusinessItem>): Promise<BusinessItem> => {
    return apiClient.put(`/businesses/${id}`, data);
  },

  deleteBusiness: async (id: string): Promise<{ deleted: boolean; id: string }> => {
    return apiClient.delete(`/businesses/${id}`);
  },

  addProduct: async (businessId: string, data: Partial<ProductServiceItem>): Promise<ProductServiceItem> => {
    return apiClient.post(`/businesses/${businessId}/products`, data);
  },

  addFootfall: async (businessId: string, data: Partial<FootfallItem>): Promise<FootfallItem> => {
    return apiClient.post(`/businesses/${businessId}/footfall`, data);
  },

  // --- Gamification & Sync APIs ---
  getDashboardStats: async (): Promise<SurveyDashboardStats> => {
    return apiClient.get('/survey/dashboard-stats');
  },

  getSurveyorProfile: async (): Promise<SurveyorProfile> => {
    return apiClient.get('/survey/profile');
  },

  bulkSyncSurveys: async (payload: {
    buildings: any[];
    businesses: any[];
  }): Promise<{
    success: boolean;
    syncedBuildingsCount: number;
    syncedBusinessesCount: number;
    syncedBuildings: Array<{ clientDraftId: string; serverId: string; code?: string; name?: string }>;
    syncedBusinesses: Array<{ clientDraftId: string; serverId: string; name?: string; buildingId?: string }>;
    idMapping: Record<string, string>;
    errors: any[];
  }> => {
    return apiClient.post('/survey/bulk-sync', payload);
  },
};
