import { apiClient } from './client';
import { AdminUser, AuthResponse } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    apiClient.setToken(res.token);
    return res;
  },

  getMe: async (): Promise<AdminUser> => {
    return apiClient.get<AdminUser>('/auth/me');
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.setToken(null);
    }
  },
};
