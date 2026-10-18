import { apiClient } from './client';
import { PhotoItem } from '../types';

export const photosApi = {
  getPhotos: async (entityType: string, entityId: string): Promise<PhotoItem[]> => {
    return apiClient.get<PhotoItem[]>(`/photos/${entityType}/${entityId}`);
  },

  uploadPhoto: async (
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
  ): Promise<PhotoItem> => {
    return apiClient.uploadPhoto(fileUri, meta);
  },

  setPrimaryPhoto: async (photoId: number): Promise<PhotoItem> => {
    return apiClient.put<PhotoItem>(`/admin/photos/${photoId}/primary`);
  },

  updatePhoto: async (photoId: number, data: Partial<PhotoItem>): Promise<PhotoItem> => {
    return apiClient.put<PhotoItem>(`/admin/photos/${photoId}`, data);
  },

  deletePhoto: async (photoId: number): Promise<void> => {
    await apiClient.delete(`/admin/photos/${photoId}`);
  },
};
