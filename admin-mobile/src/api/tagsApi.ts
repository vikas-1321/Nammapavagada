import { apiClient } from './client';
import { TagItem, GroupedTags } from '../types';

export const tagsApi = {
  getGroupedTags: async (): Promise<GroupedTags> => {
    return apiClient.get<GroupedTags>('/tags/grouped');
  },

  getTags: async (params?: { category?: string; q?: string; limit?: number }): Promise<TagItem[]> => {
    return apiClient.get<TagItem[]>('/tags', params);
  },

  createTag: async (data: {
    name: string;
    category: string;
    description?: string;
  }): Promise<TagItem> => {
    return apiClient.post<TagItem>('/admin/tags', data);
  },
};
