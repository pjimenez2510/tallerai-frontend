'use client';

import { ClipboardList, CheckSquare, Square, Clock } from 'lucide-react';
import { useMechanicTasks, useMechanicSummary, useCompleteTask } from '@/hooks/use-mechanic';
import type { MechanicWorkOrder } from '@/types/mechanic.types';

const PRIORITY_CONFIG = {
  baja: { label: 'Baja', className: 'bg-slate-700 text-slate-200' },
  normal: { label: 'Normal', className: 'bg-blue-900 text-blue-200' },
  alta: { label: 'Alta', className: 'bg-amber-900 text-amber-200' },
  urgente: { label: 'Urgente', className: 'bg-red-900 text-red-200' },
} as const;

function SummaryCard({
  label,
  value,
  icon,
  color,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#1e293b] p-5 border-l-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">{label}</p>
          {loading ? (
            <div className="h-9 w-16 rounded-lg bg-white/10 animate-pulse" />
          ) : (
            <p className="text-4xl font-bold text-white">{value}</p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
          {icon}
        </div>
      </div>
    </div>
  );
}

function WorkOrderCard({ workOrder }: { workOrder: MechanicWorkOrder }) {
  const completeTask = useCompleteTask();
  const priority = PRIORITY_CONFIG[workOrder.priority] ?? PRIORITY_CONFIG.normal;
  const completedCount = workOrder.tasks.filter((t) => t.isCompleted).length;
  const totalTasks = workOrder.tasks.length;

  async function handleToggleTask(taskId: string) {
    await completeTask.mutateAsync(taskId);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1e293b] overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold font-mono text-white">{workOrder.orderNumber}</span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priority.className}`}
            >
              {priority.label}
            </span>
          </div>
          <p className="text-base font-semibold text-white/90">
            {workOrder.vehiclePlate}
            <span className="text-sm font-normal text-white/50 ml-2">{workOrder.vehicleDescription}</span>
          </p>
          <p className="text-sm text-white/60 mt-0.5">{workOrder.clientName}</p>
        </div>
        {totalTasks > 0 && (
          <div className="shrink-0 text-right">
            <p className="text-2xl font-bold text-white">
              {completedCount}
              <span className="text-sm font-normal text-white/40">/{totalTasks}</span>
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Tareas</p>
          </div>
        )}
      </div>

      {/* Description */}
      {workOrder.description && (
        <div className="px-5 py-3 bg-white/5 border-b border-white/10">
          <p className="text-sm text-white/70 line-clamp-2">{workOrder.description}</p>
        </div>
      )}

      {/* Tasks */}
      {workOrder.tasks.length > 0 && (
        <div className="px-5 py-4 space-y-2">
          {workOrder.tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => handleToggleTask(task.id)}
              disabled={completeTask.isPending}
              className="w-full flex items-start gap-3 rounded-xl border border-white/10 p-4 hover:bg-white/5 transition-colors text-left disabled:opacity-60 min-h-[3rem]"
            >
              <span className="mt-0.5 shrink-0 text-white/40">
                {task.isCompleted ? (
                  <CheckSquare className="h-6 w-6 text-[#10b981]" />
                ) : (
                  <Square className="h-6 w-6" />
                )}
              </span>
              <span
                className={`flex-1 text-base leading-snug ${
                  task.isCompleted
                    ? 'line-through text-white/30'
                    : 'text-white/90'
                }`}
              >
                {task.description}
              </span>
            </button>
          ))}
        </div>
      )}

      {workOrder.tasks.length === 0 && (
        <div className="px-5 py-6 text-center">
          <p className="text-sm text-white/30">Sin tareas asignadas</p>
        </div>
      )}
    </div>
  );
}

export function MechanicContent() {
  const { data: summary, isLoading: summaryLoading } = useMechanicSummary();
  const { data: workOrders, isLoading: woLoading } = useMechanicTasks();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Mi Trabajo</h1>
        <p className="text-sm text-white/50 mt-0.5">Órdenes y tareas asignadas</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          label="Asignadas"
          value={summary?.assignedCount ?? 0}
          icon={<ClipboardList className="h-6 w-6 text-blue-400" />}
          color="border-l-blue-500"
          loading={summaryLoading}
        />
        <SummaryCard
          label="Completadas hoy"
          value={summary?.completedToday ?? 0}
          icon={<CheckSquare className="h-6 w-6 text-emerald-400" />}
          color="border-l-emerald-500"
          loading={summaryLoading}
        />
        <SummaryCard
          label="Tareas pendientes"
          value={summary?.pendingTasksCount ?? 0}
          icon={<Clock className="h-6 w-6 text-amber-400" />}
          color="border-l-amber-500"
          loading={summaryLoading}
        />
      </div>

      {/* Work orders */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
          Órdenes asignadas
        </h2>

        {woLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-[#1e293b] h-40 animate-pulse" />
            ))}
          </div>
        ) : !workOrders || workOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/10 bg-[#1e293b]">
            <ClipboardList className="h-12 w-12 text-white/20 mb-3" />
            <p className="text-base font-medium text-white/40">No tienes órdenes asignadas</p>
            <p className="text-sm text-white/25 mt-1">Revisa más tarde con tu jefe de taller</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workOrders.map((wo) => (
              <WorkOrderCard key={wo.id} workOrder={wo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
