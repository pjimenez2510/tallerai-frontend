'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Receipt,
  DollarSign,
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { ServiceFormDialog } from './service-form-dialog';
import { useServices, useDeactivateService } from '@/hooks/use-services';
import type { Service } from '@/types/service.types';

export function ServicesTable() {
  const { data: services, isLoading } = useServices();
  const deactivateService = useDeactivateService();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  const filtered = services?.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      (s.description?.toLowerCase().includes(q) ?? false)
    );
  });

  const totalServices = services?.length ?? 0;
  const avgPrice =
    totalServices > 0
      ? (services?.reduce((sum, s) => sum + s.price, 0) ?? 0) / totalServices
      : 0;

  function handleEdit(service: Service) {
    setEditingService(service);
    setFormOpen(true);
  }

  function handleNew() {
    setEditingService(null);
    setFormOpen(true);
  }

  async function handleDeactivate() {
    if (!deletingService) return;
    await deactivateService.mutateAsync(deletingService.id);
    setDeletingService(null);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
          <Input
            placeholder="Buscar por código, nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-10 rounded-xl"
          />
        </div>
        <Button
          onClick={handleNew}
          className="rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a] shadow-md shadow-[#1e3a5f]/20"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {totalServices}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Servicios activos
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[#10b981]">
            ${avgPrice.toFixed(2)}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Precio promedio
          </p>
        </div>
        <div className="hidden sm:block rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {filtered?.length ?? 0}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Resultados
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)]">
              <TableHead className="font-semibold">Servicio</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">
                Descripción
              </TableHead>
              <TableHead className="font-semibold">Precio</TableHead>
              <TableHead className="font-semibold text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered && filtered.length > 0 ? (
              filtered.map((service) => (
                <TableRow
                  key={service.id}
                  className="group cursor-pointer hover:bg-[var(--color-bg-secondary)]/50"
                  onClick={() => handleEdit(service)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-white shrink-0">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] font-bold"
                          >
                            {service.code}
                          </Badge>
                        </div>
                        <p className="text-sm text-[var(--color-text-primary)] font-medium mt-0.5 truncate max-w-[200px]">
                          {service.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-[var(--color-text-secondary)] truncate max-w-[250px] block">
                      {service.description || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm font-medium text-[#10b981]">
                      <DollarSign className="h-3.5 w-3.5" />
                      {service.price.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(service);
                        }}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-secondary)]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingService(service);
                        }}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-error)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <Receipt className="h-10 w-10 mx-auto text-[var(--color-text-secondary)]/30 mb-3" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {search
                      ? 'No se encontraron servicios con esa búsqueda'
                      : 'Aún no hay servicios registrados'}
                  </p>
                  {!search && (
                    <Button
                      variant="link"
                      onClick={handleNew}
                      className="mt-2 text-[#f97316]"
                    >
                      Agrega tu primer servicio
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <ServiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        service={editingService}
      />

      {/* Deactivate Confirmation */}
      <AlertDialog
        open={!!deletingService}
        onOpenChange={(open) => !open && setDeletingService(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              El servicio{' '}
              <span className="font-semibold">{deletingService?.name}</span>{' '}
              <span className="font-mono">({deletingService?.code})</span> será
              desactivado. Podrá reactivarse después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <Button
              onClick={handleDeactivate}
              className="rounded-xl bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90"
            >
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
