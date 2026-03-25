'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const response = await dashboardApi.getMetrics();
      return response.data;
    },
  });
}

export function useProductivity() {
  return useQuery({
    queryKey: ['dashboard', 'productivity'],
    queryFn: async () => {
      const response = await dashboardApi.getProductivity();
      return response.data;
    },
  });
}
