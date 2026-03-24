'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Car,
  User,
  Wrench,
  Calendar,
  Gauge,
  ChevronRight,
  X as XIcon,
  CheckSquare,
  Square,
  Trash2,
  Plus,
  Package,
  DollarSign,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useWorkOrder,
  useUpdateWorkOrder,
  useAddTask,
  useUpdateTask,
  useDeleteTask,
  useAddPart,
  useRemovePart,
} from '@/hooks/use-work-orders';
import { useProducts } from '@/hooks/use-products';
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

type TabType = 'detalle' | 'tareas' | 'repuestos';

const addTaskSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida').max(500),
});

const addPartSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0'),
});

type AddTaskFormData = z.infer<typeof addTaskSchema>;
type AddPartFormData = z.infer<typeof addPartSchema>;

interface WorkOrderDetailDialogProps {
  workOrder: WorkOrder | null;
  onClose: () => void;
}

export function WorkOrderDetailDialog({
  workOrder: initialWorkOrder,
  onClose,
}: WorkOrderDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>('detalle');
  const updateWorkOrder = useUpdateWorkOrder();
  const addTask = useAddTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const addPart = useAddPart();
  const removePart = useRemovePart();
  const { data: products } = useProducts();

  // Fetch live data so tasks/parts update without closing the dialog
  const { data: liveWorkOrder } = useWorkOrder(initialWorkOrder?.id ?? '');
  const workOrder = liveWorkOrder ?? initialWorkOrder;

  const [productSearch, setProductSearch] = useState('');

  const taskForm = useForm<AddTaskFormData>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: { description: '' },
  });

  const partForm = useForm<AddPartFormData>({
    resolver: zodResolver(addPartSchema),
    defaultValues: { productId: '', quantity: 1 },
  });

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

  async function handleToggleTask(taskId: string, isCompleted: boolean) {
    await updateTask.mutateAsync({
      woId: workOrder!.id,
      taskId,
      data: { isCompleted: !isCompleted },
    });
  }

  async function handleDeleteTask(taskId: string) {
    await deleteTask.mutateAsync({ woId: workOrder!.id, taskId });
  }

  async function onAddTask(data: AddTaskFormData) {
    await addTask.mutateAsync({
      woId: workOrder!.id,
      data: { description: data.description },
    });
    taskForm.reset();
  }

  async function onAddPart(data: AddPartFormData) {
    await addPart.mutateAsync({
      woId: workOrder!.id,
      data: { productId: data.productId, quantity: data.quantity },
    });
    partForm.reset();
    setProductSearch('');
  }

  async function handleRemovePart(partId: string) {
    await removePart.mutateAsync({ woId: workOrder!.id, partId });
  }

  const filteredProducts = products?.filter((p) => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q)
    );
  });

  const selectedProduct = products?.find(
    (p) => p.id === partForm.watch('productId'),
  );

  return (
    <Dialog open={!!initialWorkOrder} onOpenChange={(open) => !open && onClose()}>
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

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)] -mx-6 px-6 gap-1 mt-1">
          {(['detalle', 'tareas', 'repuestos'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-[#1e3a5f] text-[#1e3a5f]'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab === 'detalle' ? 'Detalle' : tab === 'tareas' ? 'Tareas' : 'Repuestos'}
              {tab === 'tareas' && workOrder.tasks.length > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1e3a5f]/10 text-[10px] font-bold text-[#1e3a5f] px-1">
                  {workOrder.tasks.length}
                </span>
              )}
              {tab === 'repuestos' && (workOrder.parts?.length ?? 0) > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1e3a5f]/10 text-[10px] font-bold text-[#1e3a5f] px-1">
                  {workOrder.parts?.length ?? 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-2">
          {activeTab === 'detalle' && (
            <DetailTab
              workOrder={workOrder}
              next={next}
              nextLabel={nextLabel}
              onAdvance={handleAdvanceStatus}
              onCancel={handleCancel}
              isPending={updateWorkOrder.isPending}
            />
          )}
          {activeTab === 'tareas' && (
            <TasksTab
              workOrder={workOrder}
              taskForm={taskForm}
              onAddTask={onAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              isAddingTask={addTask.isPending}
            />
          )}
          {activeTab === 'repuestos' && (
            <PartsTab
              workOrder={workOrder}
              partForm={partForm}
              onAddPart={onAddPart}
              onRemovePart={handleRemovePart}
              isAddingPart={addPart.isPending}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              filteredProducts={filteredProducts ?? []}
              selectedProduct={selectedProduct}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailTab({
  workOrder,
  next,
  nextLabel,
  onAdvance,
  onCancel,
  isPending,
}: {
  workOrder: WorkOrder;
  next?: WorkOrderStatus;
  nextLabel?: string;
  onAdvance: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-5">
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
          <p className="text-sm font-medium font-mono">{workOrder.vehiclePlate}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {workOrder.vehicleDescription}
          </p>
        </div>
      </div>

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

      <div>
        <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">
          Descripción
        </p>
        <p className="text-sm bg-[var(--color-bg-secondary)] rounded-xl p-3">
          {workOrder.description}
        </p>
      </div>

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

      <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
        {next && nextLabel && (
          <Button
            onClick={onAdvance}
            className="flex-1 rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
            disabled={isPending}
          >
            {nextLabel}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
        {!['entregado', 'cancelado'].includes(workOrder.status) && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="rounded-xl text-[var(--color-error)] border-[var(--color-error)]/30 hover:bg-red-50"
            disabled={isPending}
          >
            <XIcon className="h-4 w-4 mr-1" />
            Cancelar OT
          </Button>
        )}
      </div>
    </div>
  );
}

function TasksTab({
  workOrder,
  taskForm,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  isAddingTask,
}: {
  workOrder: WorkOrder;
  taskForm: ReturnType<typeof useForm<AddTaskFormData>>;
  onAddTask: (data: AddTaskFormData) => Promise<void>;
  onToggleTask: (id: string, isCompleted: boolean) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  isAddingTask: boolean;
}) {
  const completedCount = workOrder.tasks.filter((t) => t.isCompleted).length;

  return (
    <div className="space-y-4">
      {/* Progress */}
      {workOrder.tasks.length > 0 && (
        <div className="rounded-xl bg-[var(--color-bg-secondary)] p-3">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-2">
            <span>Progreso</span>
            <span>
              {completedCount}/{workOrder.tasks.length} completadas
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1e3a5f] transition-all"
              style={{
                width:
                  workOrder.tasks.length > 0
                    ? `${(completedCount / workOrder.tasks.length) * 100}%`
                    : '0%',
              }}
            />
          </div>
        </div>
      )}

      {/* Task list */}
      {workOrder.tasks.length > 0 ? (
        <div className="space-y-2">
          {workOrder.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] p-3 group"
            >
              <button
                onClick={() => onToggleTask(task.id, task.isCompleted)}
                className="mt-0.5 shrink-0 text-[var(--color-text-secondary)] hover:text-[#1e3a5f] transition-colors"
              >
                {task.isCompleted ? (
                  <CheckSquare className="h-5 w-5 text-[#1e3a5f]" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>
              <span
                className={`flex-1 text-sm ${
                  task.isCompleted
                    ? 'line-through text-[var(--color-text-secondary)]'
                    : 'text-[var(--color-text-primary)]'
                }`}
              >
                {task.description}
              </span>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <CheckSquare className="h-8 w-8 mx-auto text-[var(--color-text-secondary)]/30 mb-2" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            No hay tareas para esta OT
          </p>
        </div>
      )}

      {/* Add task form */}
      <form
        onSubmit={taskForm.handleSubmit(onAddTask)}
        className="flex items-start gap-2 pt-2 border-t border-[var(--color-border)]"
      >
        <div className="flex-1 space-y-1">
          <Input
            placeholder="Agregar tarea..."
            className="h-10 rounded-xl"
            {...taskForm.register('description')}
          />
          {taskForm.formState.errors.description && (
            <p className="text-xs text-[var(--color-error)]">
              {taskForm.formState.errors.description.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a] shrink-0"
          disabled={isAddingTask}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function PartsTab({
  workOrder,
  partForm,
  onAddPart,
  onRemovePart,
  isAddingPart,
  productSearch,
  setProductSearch,
  filteredProducts,
  selectedProduct,
}: {
  workOrder: WorkOrder;
  partForm: ReturnType<typeof useForm<AddPartFormData>>;
  onAddPart: (data: AddPartFormData) => Promise<void>;
  onRemovePart: (partId: string) => Promise<void>;
  isAddingPart: boolean;
  productSearch: string;
  setProductSearch: (v: string) => void;
  filteredProducts: import('@/types/product.types').Product[];
  selectedProduct: import('@/types/product.types').Product | undefined;
}) {
  const parts = workOrder.parts ?? [];

  return (
    <div className="space-y-4">
      {/* Total */}
      {parts.length > 0 && (
        <div className="rounded-xl bg-[var(--color-bg-secondary)] p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <Package className="h-4 w-4" />
            <span>{parts.length} repuesto(s)</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-[var(--color-text-primary)]">
            <DollarSign className="h-4 w-4 text-[#10b981]" />
            {workOrder.totalParts.toFixed(2)}
          </div>
        </div>
      )}

      {/* Parts list */}
      {parts.length > 0 ? (
        <div className="space-y-2">
          {parts.map((part) => (
            <div
              key={part.id}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3 group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 shrink-0">
                <Package className="h-4 w-4 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {part.productName}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {part.quantity} x ${part.unitPrice.toFixed(2)} ={' '}
                  <span className="font-medium text-[#10b981]">
                    ${part.total.toFixed(2)}
                  </span>
                </p>
              </div>
              <button
                onClick={() => onRemovePart(part.id)}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Package className="h-8 w-8 mx-auto text-[var(--color-text-secondary)]/30 mb-2" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            No hay repuestos asignados
          </p>
        </div>
      )}

      {/* Add part form */}
      <form
        onSubmit={partForm.handleSubmit(onAddPart)}
        className="space-y-3 pt-2 border-t border-[var(--color-border)]"
      >
        <div className="space-y-1.5">
          <Label className="text-xs">Buscar producto</Label>
          <div className="relative">
            <Input
              placeholder="Buscar por nombre o código..."
              className="h-10 rounded-xl"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                partForm.setValue('productId', '');
              }}
            />
          </div>

          {productSearch && !selectedProduct && filteredProducts.length > 0 && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] max-h-40 overflow-y-auto">
              {filteredProducts.slice(0, 8).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--color-bg-secondary)] text-left transition-colors"
                  onClick={() => {
                    partForm.setValue('productId', p.id);
                    setProductSearch(`${p.code} — ${p.name}`);
                  }}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 shrink-0">
                    <Package className="h-3.5 w-3.5 text-amber-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--color-text-primary)] truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {p.code} · Stock: {p.stock} · ${p.salePrice.toFixed(2)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {partForm.formState.errors.productId && (
            <p className="text-xs text-[var(--color-error)]">
              {partForm.formState.errors.productId.message}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Cantidad</Label>
            <Input
              type="number"
              min={1}
              placeholder="1"
              className="h-10 rounded-xl"
              {...partForm.register('quantity', { valueAsNumber: true })}
            />
            {partForm.formState.errors.quantity && (
              <p className="text-xs text-[var(--color-error)]">
                {partForm.formState.errors.quantity.message}
              </p>
            )}
          </div>
          <div className="mt-5">
            <Button
              type="submit"
              className="h-10 rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
              disabled={isAddingPart || !partForm.watch('productId')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
