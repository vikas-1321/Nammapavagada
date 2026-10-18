import { apiClient } from './client';

export interface BackendCategory {
  id: string;
  name: string;
  shortCode: string;
  badgeColorClass: string;
  borderClass: string;
  description: string;
  isFutureModule: boolean;
  displayOrder: number;
  status: string;
  locationsCount?: number;
}

export const categoriesApi = {
  getCategories: async (): Promise<BackendCategory[]> => {
    return apiClient.get<BackendCategory[]>('/categories');
  },

  getCategory: async (id: string): Promise<BackendCategory> => {
    return apiClient.get<BackendCategory>(`/categories/${id}`);
  },
};
