import { apiClient } from './client';
import type {
  WorkOrderReport,
  WorkOrderReportParams,
  InventoryReport,
  ClientReport,
} from '@/types/report.types';

export const reportsApi = {
  workOrders(params?: WorkOrderReportParams) {
    const query = new URLSearchParams();
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    const qs = query.toString();
    return apiClient.get<WorkOrderReport>(`/reports/work-orders${qs ? `?${qs}` : ''}`);
  },

  inventory() {
    return apiClient.get<InventoryReport>('/reports/inventory');
  },

  clients() {
    return apiClient.get<ClientReport>('/reports/clients');
  },
};
