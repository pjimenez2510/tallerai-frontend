export interface MechanicTask {
  id: string;
  description: string;
  isCompleted: boolean;
  laborCost: number;
  sortOrder: number;
}

export interface MechanicWorkOrder {
  id: string;
  orderNumber: string;
  vehiclePlate: string;
  vehicleDescription: string;
  clientName: string;
  description: string;
  priority: 'baja' | 'normal' | 'alta' | 'urgente';
  status: string;
  tasks: MechanicTask[];
  createdAt: string;
}

export interface MechanicSummary {
  assignedCount: number;
  completedToday: number;
  pendingTasksCount: number;
}
