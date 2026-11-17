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
  floorsCount?: number;
  businessesCount?: number;
  verificationStatus?: string;
  primaryPhotoUrl?: string;
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
    try {
      return await apiClient.get('/buildings', params);
    } catch {
      return { items: [], total: 0 };
    }
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

  deleteBuilding: async (id: string, archive: boolean = true): Promise<{ deleted?: boolean; archived?: boolean; id: string; businessesPreserved?: number }> => {
    return apiClient.delete(`/buildings/${id}?archive=${archive}`);
  },

  checkDuplicateBuilding: async (data: {
    latitude: number;
    longitude: number;
    name?: string;
    radiusMeters?: number;
  }): Promise<DuplicateCheckResponse> => {
    try {
      return await apiClient.post('/buildings/check-duplicate', data);
    } catch {
      return { isDuplicateSuspected: false, matchCount: 0, nearbyBuildings: [] };
    }
  },

  getBuildingMarkers: async (type?: string, query?: string): Promise<MapMarkerItem[]> => {
    try {
      const res = await apiClient.get<MapMarkerItem[]>('/buildings/map/markers', { type, q: query });
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
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
    try {
      return await apiClient.get('/businesses', params);
    } catch {
      return { items: [], total: 0 };
    }
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

  deleteBusiness: async (id: string, archive: boolean = true): Promise<{ deleted?: boolean; archived?: boolean; id: string }> => {
    return apiClient.delete(`/businesses/${id}?archive=${archive}`);
  },

  addProduct: async (businessId: string, data: Partial<ProductServiceItem>): Promise<ProductServiceItem> => {
    return apiClient.post(`/businesses/${businessId}/products`, data);
  },

  addFootfall: async (businessId: string, data: Partial<FootfallItem>): Promise<FootfallItem> => {
    return apiClient.post(`/businesses/${businessId}/footfall`, data);
  },

  // --- Gamification & Sync APIs ---
  getDashboardStats: async (): Promise<SurveyDashboardStats> => {
    try {
      return await apiClient.get('/survey/dashboard-stats');
    } catch {
      return {
        totalBuildings: 0,
        totalShops: 0,
        commercialBuildings: 0,
        mixedBuildings: 0,
        residentialBuildings: 0,
        pendingVerification: 0,
        dailyChallenges: [],
        allAvailableBadges: [],
      };
    }
  },

  getSurveyorProfile: async (): Promise<SurveyorProfile> => {
    try {
      return await apiClient.get('/survey/profile');
    } catch {
      return {
        id: 0,
        adminId: 0,
        displayName: 'Field Surveyor',
        totalPoints: 0,
        levelNumber: 1,
        levelTitle: 'Novice Scout',
        nextLevelTarget: 200,
        levelProgressPct: 0,
        buildingsMappedCount: 0,
        shopsRegisteredCount: 0,
        photosUploadedCount: 0,
        surveysCompletedCount: 0,
        verificationsCompletedCount: 0,
        badges: [],
      };
    }
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
