import { apiClient } from './client';
import type {
  TenantSettings,
  BusinessSettings,
  UpdateTenantSettingsRequest,
  UpdateBusinessSettingsRequest,
} from '@/types/settings.types';

export const settingsApi = {
  get() {
    return apiClient.get<TenantSettings>('/settings');
  },

  update(data: UpdateTenantSettingsRequest) {
    return apiClient.patch<TenantSettings>('/settings', data);
  },

  getBusiness() {
    return apiClient.get<BusinessSettings>('/settings/business');
  },

  updateBusiness(data: UpdateBusinessSettingsRequest) {
    return apiClient.patch<BusinessSettings>('/settings/business', data);
  },
};
