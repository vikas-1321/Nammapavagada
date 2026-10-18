import { apiClient } from './client';
import { BusRoute, BusStop, BusTiming, RouteStop } from '../types';

export const busApi = {
  getBusRoutes: async (params?: { operator?: string }): Promise<{ items: BusRoute[]; total: number }> => {
    return apiClient.get('/buses/routes', params);
  },

  getBusStops: async (params?: { q?: string }): Promise<BusStop[]> => {
    return apiClient.get<BusStop[]>('/buses/stops', params);
  },

  getBusRouteById: async (id: string): Promise<BusRoute> => {
    return apiClient.get<BusRoute>(`/buses/routes/${id}`);
  },

  createBusRoute: async (data: Partial<BusRoute>): Promise<BusRoute> => {
    return apiClient.post<BusRoute>('/admin/buses/routes', data);
  },

  updateBusRoute: async (id: string, data: Partial<BusRoute>): Promise<BusRoute> => {
    return apiClient.put<BusRoute>(`/admin/buses/routes/${id}`, data);
  },

  deleteBusRoute: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/buses/routes/${id}`);
  },

  addStopToRoute: async (
    routeId: string,
    data: { stopId: string; sequence?: number; isMajorStop?: boolean; arrivalEstimateMinutes?: number }
  ): Promise<RouteStop> => {
    return apiClient.post<RouteStop>(`/admin/buses/routes/${routeId}/stops`, data);
  },

  removeStopFromRoute: async (routeId: string, stopId: string): Promise<BusRoute> => {
    return apiClient.delete<BusRoute>(`/admin/buses/routes/${routeId}/stops/${stopId}`);
  },

  reorderRouteStops: async (routeId: string, stopIdsInOrder: string[]): Promise<BusRoute> => {
    return apiClient.put<BusRoute>(`/admin/buses/routes/${routeId}/reorder-stops`, {
      stopIds: stopIdsInOrder,
    });
  },

  addBusTiming: async (routeId: string, data: Partial<BusTiming>): Promise<BusTiming> => {
    return apiClient.post<BusTiming>(`/admin/buses/routes/${routeId}/timings`, data);
  },

  deleteBusTiming: async (timingId: number): Promise<void> => {
    await apiClient.delete(`/admin/buses/timings/${timingId}`);
  },
};
