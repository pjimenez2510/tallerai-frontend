export interface WorkOrderStatusCount {
  status: string;
  count: number;
}

export interface DashboardMetrics {
  totalActiveWorkOrders: number;
  totalClients: number;
  inventoryValue: number;
  monthlyRevenue: number;
  workOrdersByStatus: WorkOrderStatusCount[];
}
