'use client';

import {
  Car,
  User,
  Wrench,
  Calendar,
  Gauge,
  ChevronRight,
  X as XIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUpdateWorkOrder } from '@/hooks/use-work-orders';
import type { WorkOrder, WorkOrderStatus } from '@/types/work-order.types';

const statusConfig: Record<
  WorkOrderStatus,
  { label: string; color: string; bg: string }
> = {
  recepcion: { label: 'Recepción', color: 'text-slate-700', bg: 'bg-slate-100' },
  diagnostico: { label: 'Diagnóstico', color: 'text-blue-700', bg: 'bg-blue-100' },
  aprobado: { label: 'Aprobado', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  en_progreso: { label: 'En Progreso', color: 'text-amber-700', bg: 'bg-amber-100' },
  completado: { label: 'Completado', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  entregado: { label: 'Entregado', color: 'text-green-700', bg: 'bg-green-100' },
  cancelado: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100' },
};

const nextStatus: Partial<Record<WorkOrderStatus, WorkOrderStatus>> = {
  recepcion: 'diagnostico',
  diagnostico: 'aprobado',
  aprobado: 'en_progreso',
  en_progreso: 'completado',
  completado: 'entregado',
};

const nextStatusLabel: Partial<Record<WorkOrderStatus, string>> = {
  recepcion: 'Pasar a Diagnóstico',
  diagnostico: 'Aprobar',
  aprobado: 'Iniciar Trabajo',
  en_progreso: 'Marcar Completado',
  completado: 'Marcar Entregado',
};

interface WorkOrderDetailDialogProps {
  workOrder: WorkOrder | null;
  onClose: () => void;
}

export function WorkOrderDetailDialog({
  workOrder,
  onClose,
}: WorkOrderDetailDialogProps) {
  const updateWorkOrder = useUpdateWorkOrder();

  if (!workOrder) return null;

  const status = statusConfig[workOrder.status];
  const next = nextStatus[workOrder.status];
  const nextLabel = nextStatusLabel[workOrder.status];

  async function handleAdvanceStatus() {
    if (!next || !workOrder) return;
    await updateWorkOrder.mutateAsync({
      id: workOrder.id,
      data: { status: next },
    });
    onClose();
  }

  async function handleCancel() {
    if (!workOrder) return;
    await updateWorkOrder.mutateAsync({
      id: workOrder.id,
      data: { status: 'cancelado' },
    });
    onClose();
  }

  return (
    <Dialog open={!!workOrder} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">
              {workOrder.orderNumber}
            </DialogTitle>
            <Badge className={`${status.bg} ${status.color} hover:${status.bg}`}>
              {status.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Client + Vehicle */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-[var(--color-bg-secondary)] p-3">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-1">
                <User className="h-3.5 w-3.5" />
                Cliente
              </div>
              <p className="text-sm font-medium">{workOrder.clientName}</p>
            </div>
            <div className="rounded-xl bg-[var(--color-bg-secondary)] p-3">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-1">
                <Car className="h-3.5 w-3.5" />
                Vehículo
              </div>
              <p className="text-sm font-medium font-mono">
                {workOrder.vehiclePlate}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {workOrder.vehicleDescription}
              </p>
            </div>
          </div>

          {/* Mechanic + Mileage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-[var(--color-bg-secondary)] p-3">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-1">
                <Wrench className="h-3.5 w-3.5" />
                Mecánico
              </div>
              <p className="text-sm font-medium">
                {workOrder.mechanicName ?? 'Sin asignar'}
              </p>
            </div>
            <div className="rounded-xl bg-[var(--color-bg-secondary)] p-3">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-1">
                <Gauge className="h-3.5 w-3.5" />
                Km ingreso
              </div>
              <p className="text-sm font-medium font-mono">
                {workOrder.mileageIn?.toLocaleString() ?? '—'} km
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Descripción
            </p>
            <p className="text-sm bg-[var(--color-bg-secondary)] rounded-xl p-3">
              {workOrder.description}
            </p>
          </div>

          {/* Diagnosis */}
          {workOrder.diagnosis && (
            <div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Diagnóstico
              </p>
              <p className="text-sm bg-blue-50 text-blue-900 rounded-xl p-3">
                {workOrder.diagnosis}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Creada: {new Date(workOrder.createdAt).toLocaleDateString('es-EC')}
            </div>
            {workOrder.completedDate && (
              <div className="flex items-center gap-1">
                Completada:{' '}
                {new Date(workOrder.completedDate).toLocaleDateString('es-EC')}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
            {next && nextLabel && (
              <Button
                onClick={handleAdvanceStatus}
                className="flex-1 rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
                disabled={updateWorkOrder.isPending}
              >
                {nextLabel}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {!['entregado', 'cancelado'].includes(workOrder.status) && (
              <Button
                variant="outline"
                onClick={handleCancel}
                className="rounded-xl text-[var(--color-error)] border-[var(--color-error)]/30 hover:bg-red-50"
                disabled={updateWorkOrder.isPending}
              >
                <XIcon className="h-4 w-4 mr-1" />
                Cancelar OT
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
