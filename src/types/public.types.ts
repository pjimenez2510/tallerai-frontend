import type { WorkOrderStatus } from './work-order.types';

export interface PublicWorkOrderStatus {
  orderNumber: string;
  status: WorkOrderStatus;
  tenantName: string;
  vehiclePlate: string;
  vehicleDescription: string;
  description: string;
  clientName: string;
  createdAt: string;
  estimatedDate: string | null;
  completedDate: string | null;
  deliveredDate: string | null;
}
