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
  QrCode,
  Copy,
  PenLine,
  Check,
  FileText,
  Printer,
  GitBranch,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

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
  useWorkOrderQuote,
} from '@/hooks/use-work-orders';
import { useProducts } from '@/hooks/use-products';
import type { WorkOrder, WorkOrderStatus, QuoteResponse } from '@/types/work-order.types';
import { SignatureDialog } from './signature-dialog';
import { SupplementDialog } from './supplement-dialog';

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

type TabType = 'detalle' | 'tareas' | 'repuestos' | 'qr' | 'cotizacion';

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
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [supplementOpen, setSupplementOpen] = useState(false);

  const { data: quote, isLoading: quoteLoading } = useWorkOrderQuote(
    initialWorkOrder?.id ?? '',
    activeTab === 'cotizacion',
  );

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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg font-bold">
              {workOrder.orderNumber}
            </DialogTitle>
            <Badge className={`${status.bg} ${status.color} hover:${status.bg}`}>
              {status.label}
            </Badge>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)] -mx-6 px-6 gap-1 mt-1 overflow-x-auto">
          {(['detalle', 'tareas', 'repuestos', 'qr', 'cotizacion'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[#1e3a5f] text-[#1e3a5f]'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab === 'detalle'
                ? 'Detalle'
                : tab === 'tareas'
                  ? 'Tareas'
                  : tab === 'repuestos'
                    ? 'Repuestos'
                    : tab === 'qr'
                      ? 'QR'
                      : 'Cotización'}
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
              onOpenSignature={() => setSignatureOpen(true)}
              onOpenSupplement={() => setSupplementOpen(true)}
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
          {activeTab === 'qr' && <QrTab workOrder={workOrder} />}
          {activeTab === 'cotizacion' && (
            <QuoteTab quote={quote ?? null} isLoading={quoteLoading} />
          )}
        </div>
      </DialogContent>

      <SignatureDialog
        workOrderId={workOrder.id}
        open={signatureOpen}
        onClose={() => setSignatureOpen(false)}
      />

      <SupplementDialog
        parentId={workOrder.id}
        parentOrderNumber={workOrder.orderNumber}
        open={supplementOpen}
        onClose={() => setSupplementOpen(false)}
      />
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
  onOpenSignature,
  onOpenSupplement,
}: {
  workOrder: WorkOrder;
  next?: WorkOrderStatus;
  nextLabel?: string;
  onAdvance: () => void;
  onCancel: () => void;
  isPending: boolean;
  onOpenSignature: () => void;
  onOpenSupplement: () => void;
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

      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Creada: {new Date(workOrder.createdAt).toLocaleDateString('es-EC')}
        </div>
        {workOrder.estimatedDate && (
          <div className="flex items-center gap-1 text-amber-600 font-medium">
            <Calendar className="h-3 w-3" />
            Entrega estimada:{' '}
            {new Date(workOrder.estimatedDate).toLocaleDateString('es-EC')}
          </div>
        )}
        {workOrder.completedDate && (
          <div className="flex items-center gap-1">
            Completada:{' '}
            {new Date(workOrder.completedDate).toLocaleDateString('es-EC')}
          </div>
        )}
      </div>

      {/* Client Signature */}
      <div className="rounded-xl bg-[var(--color-bg-secondary)] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)]">
            <PenLine className="h-3.5 w-3.5" />
            Firma del cliente
          </div>
          {!workOrder.clientSignature && (
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenSignature}
              className="h-7 rounded-lg text-xs border-[var(--color-border)]"
            >
              <PenLine className="h-3 w-3 mr-1" />
              Firmar
            </Button>
          )}
          {workOrder.clientSignature && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">
              <Check className="h-3 w-3" />
              Firmado
            </span>
          )}
        </div>
        {workOrder.clientSignature ? (
          <div className="rounded-lg border border-[var(--color-border)] bg-white overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={workOrder.clientSignature}
              alt="Firma del cliente"
              className="w-full max-h-32 object-contain"
            />
          </div>
        ) : (
          <p className="text-xs text-[var(--color-text-secondary)]">
            Sin firma — el cliente no ha firmado aún
          </p>
        )}
      </div>

      {/* Linked supplements */}
      {workOrder.supplements && workOrder.supplements.length > 0 && (
        <div className="rounded-xl bg-[var(--color-bg-secondary)] p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)] mb-2">
            <GitBranch className="h-3.5 w-3.5" />
            OTs Suplementarias ({workOrder.supplements.length})
          </div>
          <div className="space-y-1.5">
            {workOrder.supplements.map((supp) => {
              const suppStatus = statusConfig[supp.status];
              return (
                <div
                  key={supp.id}
                  className="flex items-center gap-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-2"
                >
                  <span className="font-mono text-xs font-bold text-[#1e3a5f]">
                    {supp.orderNumber}
                  </span>
                  <Badge className={`${suppStatus.bg} ${suppStatus.color} hover:${suppStatus.bg} text-xs`}>
                    {suppStatus.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2 border-t border-[var(--color-border)]">
        {/* Supplement button — only for en_progreso or completado */}
        {(workOrder.status === 'en_progreso' || workOrder.status === 'completado') && (
          <Button
            variant="outline"
            onClick={onOpenSupplement}
            className="w-full rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <GitBranch className="h-4 w-4 mr-2" />
            Crear OT Suplementaria
          </Button>
        )}
        <div className="flex items-center gap-2">
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

function QuoteTab({
  quote,
  isLoading,
}: {
  quote: QuoteResponse | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1e3a5f] border-t-transparent" />
        <p className="text-sm text-[var(--color-text-secondary)]">Generando cotización...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <FileText className="h-10 w-10 text-[var(--color-text-secondary)]/30" />
        <p className="text-sm text-[var(--color-text-secondary)]">No hay cotización disponible</p>
      </div>
    );
  }

  const IVA_RATE = 0.12;

  return (
    <div className="space-y-4">
      {/* Print button */}
      <div className="flex justify-end print:hidden">
        <Button
          onClick={() => window.print()}
          variant="outline"
          size="sm"
          className="rounded-xl border-[var(--color-border)] gap-2"
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>

      {/* Quote document */}
      <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e3a5f] text-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f97316]">
                  <Wrench className="h-3.5 w-3.5 text-white" />
                </div>
                <h2 className="text-base font-bold">{quote.tenantName}</h2>
              </div>
              {quote.tenantRuc && (
                <p className="text-xs text-white/70">RUC: {quote.tenantRuc}</p>
              )}
              {quote.tenantPhone && (
                <p className="text-xs text-white/70">Tel: {quote.tenantPhone}</p>
              )}
              {quote.tenantAddress && (
                <p className="text-xs text-white/70">{quote.tenantAddress}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-medium text-white/60 uppercase tracking-wider">Cotización</p>
              <p className="text-sm font-bold font-mono">{quote.orderNumber}</p>
              <p className="text-xs text-white/70">
                {new Date(quote.date).toLocaleDateString('es-EC', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Client + Vehicle */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-[var(--color-border)] p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1e3a5f] mb-2 uppercase tracking-wider">
                <User className="h-3 w-3" />
                Cliente
              </div>
              <p className="text-sm font-medium">{quote.clientName}</p>
              {quote.clientDocument && (
                <p className="text-xs text-[var(--color-text-secondary)]">CI/RUC: {quote.clientDocument}</p>
              )}
              {quote.clientPhone && (
                <p className="text-xs text-[var(--color-text-secondary)]">Tel: {quote.clientPhone}</p>
              )}
              {quote.clientEmail && (
                <p className="text-xs text-[var(--color-text-secondary)] truncate">{quote.clientEmail}</p>
              )}
            </div>
            <div className="rounded-lg border border-[var(--color-border)] p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1e3a5f] mb-2 uppercase tracking-wider">
                <Car className="h-3 w-3" />
                Vehículo
              </div>
              <p className="text-sm font-medium font-mono">{quote.vehiclePlate}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {[quote.vehicleBrand, quote.vehicleModel, quote.vehicleYear]
                  .filter(Boolean)
                  .join(' ')}
              </p>
              {quote.vehicleColor && (
                <p className="text-xs text-[var(--color-text-secondary)]">Color: {quote.vehicleColor}</p>
              )}
              {quote.mileageIn != null && (
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Km: {quote.mileageIn.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Tasks table */}
          {quote.tasks.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Wrench className="h-3 w-3" />
                Mano de Obra
              </h3>
              <table className="w-full text-sm border border-[var(--color-border)] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[var(--color-bg-secondary)]">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider w-24">
                      Costo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quote.tasks.map((task, i) => (
                    <tr
                      key={`task-${i}`}
                      className={i % 2 === 0 ? 'bg-[var(--color-bg)]' : 'bg-[var(--color-bg-secondary)]'}
                    >
                      <td className="px-3 py-2 text-[var(--color-text-primary)]">{task.description}</td>
                      <td className="px-3 py-2 text-right font-mono text-[var(--color-text-primary)]">
                        ${task.laborCost.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Parts table */}
          {quote.parts.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Package className="h-3 w-3" />
                Repuestos
              </h3>
              <table className="w-full text-sm border border-[var(--color-border)] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[var(--color-bg-secondary)]">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider w-20">
                      Código
                    </th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider w-12">
                      Cant.
                    </th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider w-24">
                      P. Unit.
                    </th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider w-24">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quote.parts.map((part, i) => (
                    <tr
                      key={`part-${i}`}
                      className={i % 2 === 0 ? 'bg-[var(--color-bg)]' : 'bg-[var(--color-bg-secondary)]'}
                    >
                      <td className="px-3 py-2 font-mono text-xs text-[var(--color-text-secondary)]">
                        {part.productCode}
                      </td>
                      <td className="px-3 py-2 text-[var(--color-text-primary)]">{part.productName}</td>
                      <td className="px-3 py-2 text-right text-[var(--color-text-primary)]">{part.quantity}</td>
                      <td className="px-3 py-2 text-right font-mono text-[var(--color-text-primary)]">
                        ${part.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-medium text-[var(--color-text-primary)]">
                        ${part.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div className="ml-auto max-w-xs rounded-lg border border-[var(--color-border)] overflow-hidden">
            <div className="divide-y divide-[var(--color-border)]">
              <div className="flex justify-between items-center px-4 py-2 bg-[var(--color-bg-secondary)]">
                <span className="text-xs text-[var(--color-text-secondary)]">Subtotal Repuestos</span>
                <span className="text-sm font-mono">${quote.subtotalParts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2 bg-[var(--color-bg-secondary)]">
                <span className="text-xs text-[var(--color-text-secondary)]">Subtotal Mano de Obra</span>
                <span className="text-sm font-mono">${quote.subtotalLabor.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2 bg-[var(--color-bg-secondary)]">
                <span className="text-xs text-[var(--color-text-secondary)]">Subtotal</span>
                <span className="text-sm font-mono">${quote.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2 bg-[var(--color-bg-secondary)]">
                <span className="text-xs text-[var(--color-text-secondary)]">IVA ({(IVA_RATE * 100).toFixed(0)}%)</span>
                <span className="text-sm font-mono">${quote.iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5 bg-[#1e3a5f]">
                <span className="text-sm font-bold text-white">TOTAL</span>
                <span className="text-base font-bold font-mono text-[#f97316]">
                  ${quote.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QrTab({ workOrder }: { workOrder: WorkOrder }) {
  const trackingUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/track/${workOrder.orderNumber}`
      : `/track/${workOrder.orderNumber}`;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      toast.success('Enlace copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a5f]/10">
          <QrCode className="h-5 w-5 text-[#1e3a5f]" />
        </div>
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          Código QR de seguimiento
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] text-center max-w-xs">
          El cliente puede escanear este código para ver el estado de su vehículo en tiempo real.
        </p>
      </div>

      {/* QR Code */}
      <div className="rounded-2xl bg-white border-2 border-[var(--color-border)] p-4 shadow-sm">
        <QRCodeSVG
          value={trackingUrl}
          size={200}
          bgColor="#ffffff"
          fgColor="#1e3a5f"
          level="M"
          includeMargin={false}
        />
      </div>

      {/* Order number */}
      <div className="text-center">
        <p className="text-xs text-[var(--color-text-secondary)] mb-1">Número de orden</p>
        <p className="text-xl font-bold font-mono text-[var(--color-text-primary)]">
          {workOrder.orderNumber}
        </p>
      </div>

      {/* Copy link button */}
      <div className="flex gap-2 w-full max-w-xs">
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="flex-1 rounded-xl border-[var(--color-border)] gap-2"
        >
          <Copy className="h-4 w-4" />
          Copiar enlace
        </Button>
      </div>

      {/* URL preview */}
      <p className="text-[10px] text-[var(--color-text-secondary)] font-mono text-center break-all max-w-xs px-2">
        {trackingUrl}
      </p>
    </div>
  );
}
