import { apiClient } from './client';
import type { DashboardMetrics, ProductivityMetrics } from '@/types/dashboard.types';

export const dashboardApi = {
  getMetrics() {
    return apiClient.get<DashboardMetrics>('/dashboard/metrics');
  },

  getProductivity() {
    return apiClient.get<ProductivityMetrics>('/dashboard/productivity');
  },
};
