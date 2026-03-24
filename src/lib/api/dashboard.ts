import { apiClient } from './client';
import type { DashboardMetrics } from '@/types/dashboard.types';

export const dashboardApi = {
  getMetrics() {
    return apiClient.get<DashboardMetrics>('/dashboard/metrics');
  },
};
