'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports';
import type { WorkOrderReportParams } from '@/types/report.types';

export function useWorkOrdersReport(params?: WorkOrderReportParams) {
  return useQuery({
    queryKey: ['reports', 'work-orders', params],
    queryFn: async () => {
      const response = await reportsApi.workOrders(params);
      return response.data;
    },
  });
}

export function useInventoryReport() {
  return useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: async () => {
      const response = await reportsApi.inventory();
      return response.data;
    },
  });
}

export function useClientsReport() {
  return useQuery({
    queryKey: ['reports', 'clients'],
    queryFn: async () => {
      const response = await reportsApi.clients();
      return response.data;
    },
  });
}
