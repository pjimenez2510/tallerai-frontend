'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { KanbanCard } from './kanban-card';
import type { WorkOrder, WorkOrderStatus } from '@/types/work-order.types';

const statusConfig: Record<
  WorkOrderStatus,
  { label: string; headerColor: string; countBg: string }
> = {
  recepcion: {
    label: 'Recepción',
    headerColor: 'border-t-slate-400',
    countBg: 'bg-slate-100 text-slate-600',
  },
  diagnostico: {
    label: 'Diagnóstico',
    headerColor: 'border-t-blue-400',
    countBg: 'bg-blue-100 text-blue-600',
  },
  aprobado: {
    label: 'Aprobado',
    headerColor: 'border-t-indigo-400',
    countBg: 'bg-indigo-100 text-indigo-600',
  },
  en_progreso: {
    label: 'En Progreso',
    headerColor: 'border-t-amber-400',
    countBg: 'bg-amber-100 text-amber-600',
  },
  completado: {
    label: 'Completado',
    headerColor: 'border-t-emerald-400',
    countBg: 'bg-emerald-100 text-emerald-600',
  },
  entregado: {
    label: 'Entregado',
    headerColor: 'border-t-green-400',
    countBg: 'bg-green-100 text-green-600',
  },
  cancelado: {
    label: 'Cancelado',
    headerColor: 'border-t-red-400',
    countBg: 'bg-red-100 text-red-600',
  },
};

interface KanbanColumnProps {
  status: WorkOrderStatus;
  workOrders: WorkOrder[];
  onCardClick: (wo: WorkOrder) => void;
}

export function KanbanColumn({
  status,
  workOrders,
  onCardClick,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  const config = statusConfig[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col min-w-[280px] w-[280px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] border-t-4',
        config.headerColor,
        isOver && 'ring-2 ring-[var(--color-accent)] ring-offset-2',
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          {config.label}
        </h3>
        <span
          className={cn(
            'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
            config.countBg,
          )}
        >
          {workOrders.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[200px]">
        {workOrders.map((wo) => (
          <KanbanCard
            key={wo.id}
            workOrder={wo}
            onClick={() => onCardClick(wo)}
          />
        ))}
        {workOrders.length === 0 && (
          <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]/50">
            Sin órdenes
          </div>
        )}
      </div>
    </div>
  );
}
