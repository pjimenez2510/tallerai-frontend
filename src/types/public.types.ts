import type { WorkOrderStatus, WorkOrderPriority } from './work-order.types';

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

export interface PublicVehicleWorkOrder {
  id: string;
  orderNumber: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  description: string;
  mechanicName: string | null;
  mileageIn: number | null;
  tasksCount: number;
  partsCount: number;
  totalParts: number;
  totalLabor: number;
  total: number;
  createdAt: string;
  completedDate: string | null;
}

export interface PublicVehicleHistory {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  clientName: string;
  tenantName: string;
  workOrders: PublicVehicleWorkOrder[];
}
