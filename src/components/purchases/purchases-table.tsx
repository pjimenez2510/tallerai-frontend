'use client';

import { useState } from 'react';
import {
  Plus,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Truck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CreatePurchaseDialog } from './create-purchase-dialog';
import {
  usePurchases,
  useReceivePurchase,
  useCancelPurchase,
} from '@/hooks/use-purchases';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchase.types';

const statusConfig: Record<
  PurchaseOrderStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pendiente: {
    label: 'Pendiente',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    icon: Clock,
  },
  recibida: {
    label: 'Recibida',
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    icon: CheckCircle2,
  },
  cancelada: {
    label: 'Cancelada',
    color: 'text-red-700',
    bg: 'bg-red-100',
    icon: XCircle,
  },
};

export function PurchasesTable() {
  const { data: purchases, isLoading } = usePurchases();
  const receivePurchase = useReceivePurchase();
  const cancelPurchase = useCancelPurchase();

  const [createOpen, setCreateOpen] = useState(false);
  const [detailPurchase, setDetailPurchase] = useState<PurchaseOrder | null>(null);
  const [receivingPurchase, setReceivingPurchase] = useState<PurchaseOrder | null>(null);
  const [cancelingPurchase, setCancelingPurchase] = useState<PurchaseOrder | null>(null);

  async function handleReceive() {
    if (!receivingPurchase) return;
    await receivePurchase.mutateAsync(receivingPurchase.id);
    setReceivingPurchase(null);
  }

  async function handleCancel() {
    if (!cancelingPurchase) return;
    await cancelPurchase.mutateAsync(cancelingPurchase.id);
    setCancelingPurchase(null);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  const pendingCount = purchases?.filter((p) => p.status === 'pendiente').length ?? 0;
  const receivedCount = purchases?.filter((p) => p.status === 'recibida').length ?? 0;

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Órdenes de Compra
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Gestiona las compras de repuestos a proveedores
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a] shadow-md shadow-[#1e3a5f]/20"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Compra
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {purchases?.length ?? 0}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Total órdenes
          </p>
        </div>
        {pendingCount > 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
            </div>
            <p className="text-xs text-amber-600 mt-1">Pendientes</p>
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {pendingCount}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Pendientes
            </p>
          </div>
        )}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[#10b981]">{receivedCount}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Recibidas
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)]">
              <TableHead className="font-semibold">Orden</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">
                Proveedor
              </TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">
                Total
              </TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold hidden xl:table-cell">
                Fecha
              </TableHead>
              <TableHead className="font-semibold text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases && purchases.length > 0 ? (
              purchases.map((purchase) => {
                const status = statusConfig[purchase.status];
                const StatusIcon = status.icon;
                return (
                  <TableRow
                    key={purchase.id}
                    className="group cursor-pointer hover:bg-[var(--color-bg-secondary)]/50"
                    onClick={() => setDetailPurchase(purchase)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-white shrink-0">
                          <ShoppingCart className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold font-mono text-[var(--color-text-primary)]">
                            {purchase.orderNumber}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)] md:hidden">
                            {purchase.supplier}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-[var(--color-text-secondary)]" />
                        <span className="text-sm text-[var(--color-text-primary)] truncate max-w-[200px]">
                          {purchase.supplier}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="font-mono font-semibold text-[var(--color-text-primary)]">
                        ${purchase.total.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${status.bg} ${status.color} hover:${status.bg} flex items-center gap-1 w-fit`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-[var(--color-text-secondary)]">
                      {new Date(purchase.createdAt).toLocaleDateString('es-EC')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {purchase.status === 'pendiente' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-lg text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              onClick={() => setReceivingPurchase(purchase)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Recibir
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-lg text-xs border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => setCancelingPurchase(purchase)}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] opacity-0 group-hover:opacity-100"
                          onClick={() => setDetailPurchase(purchase)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <ShoppingCart className="h-10 w-10 mx-auto text-[var(--color-text-secondary)]/30 mb-3" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Aún no hay órdenes de compra registradas
                  </p>
                  <Button
                    variant="link"
                    onClick={() => setCreateOpen(true)}
                    className="mt-2 text-[#f97316]"
                  >
                    Crea tu primera orden de compra
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <CreatePurchaseDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Detail Dialog */}
      {detailPurchase && (
        <PurchaseDetailDialog
          purchase={detailPurchase}
          onClose={() => setDetailPurchase(null)}
        />
      )}

      {/* Receive Confirmation */}
      <AlertDialog
        open={!!receivingPurchase}
        onOpenChange={(open) => !open && setReceivingPurchase(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar recepción?</AlertDialogTitle>
            <AlertDialogDescription>
              Se marcará la orden{' '}
              <span className="font-semibold font-mono">
                {receivingPurchase?.orderNumber}
              </span>{' '}
              como recibida y se actualizará el stock de los productos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <Button
              onClick={handleReceive}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={receivePurchase.isPending}
            >
              {receivePurchase.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Procesando...
                </span>
              ) : (
                'Confirmar Recepción'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation */}
      <AlertDialog
        open={!!cancelingPurchase}
        onOpenChange={(open) => !open && setCancelingPurchase(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar orden de compra?</AlertDialogTitle>
            <AlertDialogDescription>
              La orden{' '}
              <span className="font-semibold font-mono">
                {cancelingPurchase?.orderNumber}
              </span>{' '}
              será cancelada. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Volver
            </AlertDialogCancel>
            <Button
              onClick={handleCancel}
              className="rounded-xl bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90"
              disabled={cancelPurchase.isPending}
            >
              {cancelPurchase.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Cancelando...
                </span>
              ) : (
                'Cancelar Orden'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function PurchaseDetailDialog({
  purchase,
  onClose,
}: {
  purchase: PurchaseOrder;
  onClose: () => void;
}) {
  const status = statusConfig[purchase.status];
  const StatusIcon = status.icon;

  return (
    <Dialog open={!!purchase} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg font-bold font-mono">
              {purchase.orderNumber}
            </DialogTitle>
            <Badge
              className={`${status.bg} ${status.color} hover:${status.bg} flex items-center gap-1`}
            >
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>
          <DialogDescription>
            Detalle de la orden de compra
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[var(--color-bg-secondary)] p-3">
              <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                Proveedor
              </p>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {purchase.supplier}
              </p>
            </div>
            <div className="rounded-xl bg-[var(--color-bg-secondary)] p-3">
              <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                Total
              </p>
              <p className="text-lg font-bold font-mono text-[var(--color-text-primary)]">
                ${purchase.total.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl bg-[var(--color-bg-secondary)] p-3">
              <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                Fecha de creación
              </p>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {new Date(purchase.createdAt).toLocaleDateString('es-EC', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            {purchase.receivedAt && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                <p className="text-xs text-emerald-600 mb-1">Recibida el</p>
                <p className="text-sm font-medium text-emerald-700">
                  {new Date(purchase.receivedAt).toLocaleDateString('es-EC', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {purchase.notes && (
            <div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Notas
              </p>
              <p className="text-sm bg-[var(--color-bg-secondary)] rounded-xl p-3">
                {purchase.notes}
              </p>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              Productos ({purchase.items.length})
            </p>
            <div className="space-y-2">
              {purchase.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 shrink-0">
                    <ShoppingCart className="h-4 w-4 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      <span className="font-mono">{item.productCode}</span> ·{' '}
                      {item.quantity} x ${item.unitCost.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-sm font-bold font-mono text-[#10b981] shrink-0">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
