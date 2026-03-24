'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  User,
  Car,
  Wrench,
  AlertTriangle,
  GripVertical,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { WorkOrder } from '@/types/work-order.types';

const priorityConfig: Record<string, { label: string; dot: string }> = {
  baja: { label: 'Baja', dot: 'bg-gray-400' },
  normal: { label: 'Normal', dot: 'bg-blue-400' },
  alta: { label: 'Alta', dot: 'bg-orange-400' },
  urgente: { label: 'Urgente', dot: 'bg-red-500' },
};

interface KanbanCardProps {
  workOrder: WorkOrder;
  onClick: () => void;
}

export function KanbanCard({ workOrder, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: workOrder.id, data: { workOrder } });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const priority = priorityConfig[workOrder.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      {/* Header: OT number + drag handle + priority */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] font-bold">
            {workOrder.orderNumber}
          </Badge>
          {workOrder.priority === 'urgente' && (
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          )}
        </div>
        <div
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-[var(--color-bg-secondary)]"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-[var(--color-text-secondary)]" />
        </div>
      </div>

      {/* Description snippet */}
      <p className="text-xs text-[var(--color-text-primary)] line-clamp-2 mb-2.5">
        {workOrder.description}
      </p>

      {/* Client + Vehicle */}
      <div className="space-y-1 mb-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate">{workOrder.clientName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
          <Car className="h-3 w-3 shrink-0" />
          <span className="font-mono">{workOrder.vehiclePlate}</span>
          <span className="truncate">— {workOrder.vehicleDescription}</span>
        </div>
      </div>

      {/* Footer: mechanic + priority */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
        {workOrder.mechanicName ? (
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-[8px] font-bold text-white uppercase">
              {workOrder.mechanicName.charAt(0)}
            </div>
            <span className="text-[11px] text-[var(--color-text-secondary)]">
              {workOrder.mechanicName}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)]/50">
            <Wrench className="h-3 w-3" />
            Sin asignar
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full ${priority.dot}`} />
          <span className="text-[10px] text-[var(--color-text-secondary)]">
            {priority.label}
          </span>
        </div>
      </div>
    </div>
  );
}
