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

  async getBusiness() {
    const response = await apiClient.get<TenantSettings & { settings: BusinessSettings }>('/settings');
    const defaults: BusinessSettings = { currency: 'USD', taxRate: 12, paymentTerms: null, workingHours: null };
    return { ...response, data: response.data.settings ?? defaults };
  },

  updateBusiness(data: UpdateBusinessSettingsRequest) {
    return apiClient.patch<BusinessSettings>('/settings/business', data);
  },
};
