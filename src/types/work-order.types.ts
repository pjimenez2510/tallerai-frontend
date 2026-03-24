export type WorkOrderStatus =
  | 'recepcion'
  | 'diagnostico'
  | 'aprobado'
  | 'en_progreso'
  | 'completado'
  | 'entregado'
  | 'cancelado';

export type WorkOrderPriority = 'baja' | 'normal' | 'alta' | 'urgente';

export interface WorkOrderTask {
  id: string;
  description: string;
  isCompleted: boolean;
  laborHours: number;
  laborCost: number;
  sortOrder: number;
}

export interface WorkOrderPart {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface AddTaskRequest {
  description: string;
  laborHours?: number;
  laborCost?: number;
}

export interface UpdateTaskRequest {
  isCompleted?: boolean;
  description?: string;
  laborHours?: number;
  laborCost?: number;
}

export interface AddPartRequest {
  productId: string;
  quantity: number;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleDescription: string;
  assignedTo: string | null;
  mechanicName: string | null;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  description: string;
  diagnosis: string | null;
  internalNotes: string | null;
  mileageIn: number | null;
  estimatedDate: string | null;
  completedDate: string | null;
  deliveredDate: string | null;
  totalParts: number;
  totalLabor: number;
  total: number;
  tasks: WorkOrderTask[];
  parts: WorkOrderPart[];
  clientSignature: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkOrderRequest {
  clientId: string;
  vehicleId: string;
  description: string;
  priority?: WorkOrderPriority;
  mileageIn?: number;
  assignedTo?: string;
  estimatedDate?: string;
}

export interface UpdateWorkOrderRequest {
  status?: WorkOrderStatus;
  priority?: WorkOrderPriority;
  description?: string;
  diagnosis?: string;
  internalNotes?: string;
  assignedTo?: string | null;
  estimatedDate?: string | null;
  clientSignature?: string | null;
}
