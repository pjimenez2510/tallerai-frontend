'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { WorkOrderDetailDialog } from '../work-orders/work-order-detail-dialog';
import { CreateWorkOrderDialog } from '../work-orders/create-work-order-dialog';
import { useWorkOrders, useUpdateWorkOrder } from '@/hooks/use-work-orders';
import type { WorkOrder, WorkOrderStatus } from '@/types/work-order.types';

const VISIBLE_COLUMNS: WorkOrderStatus[] = [
  'recepcion',
  'diagnostico',
  'aprobado',
  'en_progreso',
  'completado',
  'entregado',
];

const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  recepcion: ['diagnostico', 'cancelado'],
  diagnostico: ['aprobado', 'cancelado'],
  aprobado: ['en_progreso', 'cancelado'],
  en_progreso: ['completado', 'cancelado'],
  completado: ['entregado'],
  entregado: [],
  cancelado: [],
};

export function KanbanBoard() {
  const { data: workOrders, isLoading } = useWorkOrders();
  const updateWorkOrder = useUpdateWorkOrder();

  const [activeCard, setActiveCard] = useState<WorkOrder | null>(null);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  // Group work orders by status
  const columns = VISIBLE_COLUMNS.map((status) => ({
    status,
    items:
      workOrders?.filter((wo) => wo.status === status) ?? [],
  }));

  function handleDragStart(event: DragStartEvent) {
    const wo = event.active.data.current?.workOrder as WorkOrder | undefined;
    if (wo) setActiveCard(wo);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);

    const { active, over } = event;
    if (!over) return;

    const workOrder = active.data.current?.workOrder as WorkOrder | undefined;
    if (!workOrder) return;

    const targetStatus = over.id as WorkOrderStatus;
    if (targetStatus === workOrder.status) return;

    // Validate transition
    const allowed = VALID_TRANSITIONS[workOrder.status];
    if (!allowed.includes(targetStatus)) {
      toast.error(
        `No se puede mover de "${workOrder.status}" a "${targetStatus}"`,
      );
      return;
    }

    await updateWorkOrder.mutateAsync({
      id: workOrder.id,
      data: { status: targetStatus },
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {workOrders?.filter(
              (wo) => !['entregado', 'cancelado'].includes(wo.status),
            ).length ?? 0}{' '}
            órdenes activas
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="rounded-xl bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90 shadow-md shadow-[var(--color-accent)]/20"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva OT
        </Button>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              workOrders={col.items}
              onCardClick={setSelectedWO}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="w-[280px] rotate-3 opacity-90">
              <KanbanCard workOrder={activeCard} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <WorkOrderDetailDialog
        workOrder={selectedWO}
        onClose={() => setSelectedWO(null)}
      />
      <CreateWorkOrderDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
