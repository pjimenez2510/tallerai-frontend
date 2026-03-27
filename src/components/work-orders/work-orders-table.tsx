'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  ClipboardList,
  User,
  Car,
  ChevronRight,
  Clock,
  AlertTriangle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreateWorkOrderDialog } from './create-work-order-dialog';
import { WorkOrderDetailDialog } from './work-order-detail-dialog';
import { useWorkOrders } from '@/hooks/use-work-orders';
import { usePermissions } from '@/hooks/use-permissions';
import { Pagination } from '@/components/shared/pagination';
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

const priorityConfig: Record<string, { label: string; color: string }> = {
  baja: { label: 'Baja', color: 'text-gray-500' },
  normal: { label: 'Normal', color: 'text-blue-500' },
  alta: { label: 'Alta', color: 'text-orange-500' },
  urgente: { label: 'Urgente', color: 'text-red-600' },
};

const statusTabs: { value: WorkOrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'recepcion', label: 'Recepción' },
  { value: 'diagnostico', label: 'Diagnóstico' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'en_progreso', label: 'En Progreso' },
  { value: 'completado', label: 'Completado' },
  { value: 'entregado', label: 'Entregado' },
];

const LIMIT = 20;

export function WorkOrdersTable() {
  const [activeTab, setActiveTab] = useState<WorkOrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);

  const statusFilter = activeTab === 'all' ? undefined : activeTab;
  const { data: workOrdersPage, isLoading } = useWorkOrders({
    status: statusFilter,
    page,
    limit: LIMIT,
  });
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission('work_orders.create');

  const workOrders = workOrdersPage?.items;

  const filtered = workOrders?.filter((wo) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      wo.orderNumber.toLowerCase().includes(q) ||
      wo.clientName.toLowerCase().includes(q) ||
      wo.vehiclePlate.toLowerCase().includes(q) ||
      wo.description.toLowerCase().includes(q) ||
      (wo.mechanicName?.toLowerCase().includes(q) ?? false)
    );
  });

  const activeCount =
    workOrders?.filter(
      (wo) => !['entregado', 'cancelado'].includes(wo.status),
    ).length ?? 0;

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
          <Input
            placeholder="Buscar por N° OT, cliente, placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-10 rounded-xl"
          />
        </div>
        {canCreate && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="rounded-xl bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90 shadow-md shadow-[var(--color-accent)]/20"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva OT
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {workOrdersPage?.total ?? 0}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Total OTs
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <p className="text-2xl font-bold text-amber-600">{activeCount}</p>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            En proceso
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {workOrders?.filter((wo) => wo.priority === 'urgente').length ?? 0}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Urgentes (pág.)
          </p>
        </div>
        <div className="hidden sm:block rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {search ? filtered?.length ?? 0 : workOrdersPage?.total ?? 0}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Resultados
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setActiveTab(tab.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] border border-[var(--color-border)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)]">
              <TableHead className="font-semibold">OT</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">
                Cliente / Vehículo
              </TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">
                Estado
              </TableHead>
              <TableHead className="font-semibold hidden xl:table-cell">
                Mecánico
              </TableHead>
              <TableHead className="font-semibold text-right">
                Detalle
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered && filtered.length > 0 ? (
              filtered.map((wo) => {
                const status = statusConfig[wo.status];
                const priority = priorityConfig[wo.priority];
                return (
                  <TableRow
                    key={wo.id}
                    className="group cursor-pointer hover:bg-[var(--color-bg-secondary)]/50"
                    onClick={() => setSelectedWO(wo)}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs font-bold"
                          >
                            {wo.orderNumber}
                          </Badge>
                          {wo.priority === 'urgente' && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] truncate max-w-[200px]">
                          {wo.description}
                        </p>
                        <div className="flex items-center gap-2 md:hidden">
                          <Badge
                            className={`${status.bg} ${status.color} hover:${status.bg} text-[10px]`}
                          >
                            {status.label}
                          </Badge>
                          <span className={`text-xs ${priority.color}`}>
                            ● {priority.label}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <User className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                          {wo.clientName}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                          <Car className="h-3 w-3" />
                          <span className="font-mono">{wo.vehiclePlate}</span>
                          <span>— {wo.vehicleDescription}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="space-y-1">
                        <Badge
                          className={`${status.bg} ${status.color} hover:${status.bg} text-xs`}
                        >
                          {status.label}
                        </Badge>
                        <p className={`text-xs ${priority.color}`}>
                          ● {priority.label}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {wo.mechanicName ? (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-[10px] font-bold text-white uppercase">
                            {wo.mechanicName.charAt(0)}
                          </div>
                          {wo.mechanicName}
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          Sin asignar
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-[var(--color-text-secondary)]"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <ClipboardList className="h-10 w-10 mx-auto text-[var(--color-text-secondary)]/30 mb-3" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {search
                      ? 'No se encontraron órdenes de trabajo'
                      : 'Aún no hay órdenes de trabajo'}
                  </p>
                  {!search && (
                    <Button
                      variant="link"
                      onClick={() => setCreateOpen(true)}
                      className="mt-2 text-[#f97316]"
                    >
                      Crea tu primera orden de trabajo
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {workOrdersPage && !search && (
        <Pagination
          page={workOrdersPage.page}
          totalPages={workOrdersPage.totalPages}
          total={workOrdersPage.total}
          limit={workOrdersPage.limit}
          onPageChange={setPage}
        />
      )}

      <CreateWorkOrderDialog open={createOpen} onOpenChange={setCreateOpen} />
      <WorkOrderDetailDialog
        workOrder={selectedWO}
        onClose={() => setSelectedWO(null)}
      />
    </>
  );
}
