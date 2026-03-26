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

export interface WorkOrderSupplement {
  id: string;
  orderNumber: string;
  status: WorkOrderStatus;
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
  damageMap: Record<string, unknown> | null;
  damageNotes: string | null;
  parentId: string | null;
  supplements: WorkOrderSupplement[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplementRequest {
  description: string;
  priority?: WorkOrderPriority;
}

export interface VehicleTimelineEntry {
  id: string;
  orderNumber: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  description: string;
  mechanicName: string | null;
  mileageIn: number | null;
  totalParts: number;
  totalLabor: number;
  total: number;
  tasksCount: number;
  partsCount: number;
  createdAt: string;
  completedDate: string | null;
}

export interface WorkOrderAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  description: string | null;
  createdAt: string;
}

export interface AddAttachmentRequest {
  filename: string;
  mimeType: string;
  data: string;
  description?: string;
}

export interface CreateWorkOrderRequest {
  clientId: string;
  vehicleId: string;
  description: string;
  priority?: WorkOrderPriority;
  mileageIn?: number;
  assignedTo?: string;
  estimatedDate?: string;
  parentId?: string;
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
  damageMap?: Record<string, unknown> | null;
  damageNotes?: string | null;
}

export interface QuoteTask {
  id: string;
  description: string;
  laborCost: number;
}

export interface QuotePart {
  id: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface QuoteResponse {
  orderNumber: string;
  date: string;
  tenantName: string;
  tenantRuc: string;
  tenantPhone: string | null;
  tenantAddress: string | null;
  clientName: string;
  clientDocument: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string | null;
  mileageIn: number | null;
  description: string;
  tasks: QuoteTask[];
  parts: QuotePart[];
  subtotalParts: number;
  subtotalLabor: number;
  subtotal: number;
  iva: number;
  total: number;
}
