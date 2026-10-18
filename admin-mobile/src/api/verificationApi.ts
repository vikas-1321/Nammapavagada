import { apiClient } from './client';
import { LocationItem, VerificationStatus, VerificationSource } from '../types';

export const verificationApi = {
  verifyLocation: async (
    locationId: string,
    data: {
      status?: VerificationStatus;
      source?: VerificationSource | string;
      verifiedBy?: string;
      notes?: string;
    }
  ): Promise<LocationItem> => {
    return apiClient.post<LocationItem>(`/admin/places/${locationId}/verify`, data);
  },
};
