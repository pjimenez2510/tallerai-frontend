'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Plus, Filter } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { WorkOrderDetailDialog } from '../work-orders/work-order-detail-dialog';
import { CreateWorkOrderDialog } from '../work-orders/create-work-order-dialog';
import { useWorkOrders, useUpdateWorkOrder } from '@/hooks/use-work-orders';
import type { WorkOrder, WorkOrderStatus, WorkOrderPriority } from '@/types/work-order.types';

type PriorityFilter = WorkOrderPriority | 'all';

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

const PRIORITIES: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'baja', label: 'Baja' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

const PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  baja: 'text-gray-500',
  normal: 'text-blue-500',
  alta: 'text-orange-500',
  urgente: 'text-red-600',
};

export function KanbanBoard() {
  const { data: workOrdersPage, isLoading } = useWorkOrders({ limit: 200 });
  const updateWorkOrder = useUpdateWorkOrder();

  const workOrders = workOrdersPage?.items;

  const [activeCard, setActiveCard] = useState<WorkOrder | null>(null);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [mechanicFilter, setMechanicFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  // Unique mechanics from loaded work orders
  const mechanics = useMemo(() => {
    if (!workOrders) return [];
    const map = new Map<string, string>();
    for (const wo of workOrders) {
      if (wo.assignedTo && wo.mechanicName) {
        map.set(wo.assignedTo, wo.mechanicName);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [workOrders]);

  // Apply client-side filters
  const filteredOrders = useMemo(() => {
    if (!workOrders) return [];
    return workOrders.filter((wo) => {
      if (mechanicFilter !== 'all' && wo.assignedTo !== mechanicFilter)
        return false;
      if (priorityFilter !== 'all' && wo.priority !== priorityFilter)
        return false;
      return true;
    });
  }, [workOrders, mechanicFilter, priorityFilter]);

  // Group work orders by status
  const columns = VISIBLE_COLUMNS.map((status) => ({
    status,
    items: filteredOrders.filter((wo) => wo.status === status),
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
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {filteredOrders.filter(
                (wo) => !['entregado', 'cancelado'].includes(wo.status),
              ).length}{' '}
              órdenes activas
              {(mechanicFilter !== 'all' || priorityFilter !== 'all') && (
                <span className="ml-1 text-[#f97316]">(filtradas)</span>
              )}
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

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Filtros:
            </span>
          </div>

          {/* Mechanic filter */}
          {mechanics.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--color-text-secondary)]">
                Mecánico:
              </span>
              <select
                value={mechanicFilter}
                onChange={(e) => setMechanicFilter(e.target.value)}
                className="h-7 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text-primary)] px-2 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
                aria-label="Filtrar por mecánico"
              >
                <option value="all">Todos</option>
                {mechanics.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Priority filter */}
          <div className="flex items-center gap-1">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                onClick={() => setPriorityFilter(p.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  priorityFilter === p.value
                    ? 'bg-[#1e3a5f] text-white'
                    : `bg-[var(--color-bg)] border border-[var(--color-border)] ${
                        p.value !== 'all'
                          ? PRIORITY_COLORS[p.value as WorkOrderPriority]
                          : 'text-[var(--color-text-secondary)]'
                      } hover:bg-[var(--color-bg-secondary)]`
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Clear filters */}
          {(mechanicFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              onClick={() => {
                setMechanicFilter('all');
                setPriorityFilter('all');
              }}
              className="text-xs text-[#f97316] hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>
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
