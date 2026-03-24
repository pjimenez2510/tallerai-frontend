'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  CarFront,
  Gauge,
  Fuel,
  User,
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
import { VehicleFormDialog } from './vehicle-form-dialog';
import { useVehicles, useDeactivateVehicle } from '@/hooks/use-vehicles';
import type { Vehicle } from '@/types/vehicle.types';

export function VehiclesTable() {
  const { data: vehicles, isLoading } = useVehicles();
  const deactivateVehicle = useDeactivateVehicle();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

  const filtered = vehicles?.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.plate.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.clientName.toLowerCase().includes(q)
    );
  });

  function handleEdit(vehicle: Vehicle) {
    setEditingVehicle(vehicle);
    setFormOpen(true);
  }

  function handleNew() {
    setEditingVehicle(null);
    setFormOpen(true);
  }

  async function handleDeactivate() {
    if (!deletingVehicle) return;
    await deactivateVehicle.mutateAsync(deletingVehicle.id);
    setDeletingVehicle(null);
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
            placeholder="Buscar por placa, marca, modelo, cliente..."
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
          Nuevo Vehículo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {vehicles?.length ?? 0}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Vehículos activos
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {new Set(vehicles?.map((v) => v.brand)).size}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Marcas distintas
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
              <TableHead className="font-semibold">Vehículo</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">
                Propietario
              </TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">
                Detalles
              </TableHead>
              <TableHead className="font-semibold hidden xl:table-cell">
                Kilometraje
              </TableHead>
              <TableHead className="font-semibold text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered && filtered.length > 0 ? (
              filtered.map((vehicle) => (
                <TableRow
                  key={vehicle.id}
                  className="group cursor-pointer hover:bg-[var(--color-bg-secondary)]/50"
                  onClick={() => handleEdit(vehicle)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shrink-0">
                        <CarFront className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs font-bold"
                          >
                            {vehicle.plate}
                          </Badge>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                          {vehicle.brand} {vehicle.model}{' '}
                          <span className="text-[var(--color-text-secondary)]/60">
                            ({vehicle.year})
                          </span>
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                      <span className="text-sm">{vehicle.clientName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                      {vehicle.color && (
                        <span className="flex items-center gap-1">
                          <span
                            className="h-3 w-3 rounded-full border border-[var(--color-border)]"
                            style={{
                              backgroundColor:
                                vehicle.color.toLowerCase() === 'blanco'
                                  ? '#f8fafc'
                                  : vehicle.color.toLowerCase() === 'negro'
                                    ? '#1e293b'
                                    : vehicle.color.toLowerCase() === 'rojo'
                                      ? '#ef4444'
                                      : vehicle.color.toLowerCase() === 'azul'
                                        ? '#3b82f6'
                                        : vehicle.color.toLowerCase() === 'gris'
                                          ? '#9ca3af'
                                          : '#d1d5db',
                            }}
                          />
                          {vehicle.color}
                        </span>
                      )}
                      {vehicle.fuelType && (
                        <span className="flex items-center gap-1">
                          <Fuel className="h-3 w-3" />
                          {vehicle.fuelType}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Gauge className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                      <span className="font-mono">
                        {vehicle.mileage.toLocaleString()}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        km
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(vehicle);
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
                          setDeletingVehicle(vehicle);
                        }}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-error)]"
                      >
                        <CarFront className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <CarFront className="h-10 w-10 mx-auto text-[var(--color-text-secondary)]/30 mb-3" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {search
                      ? 'No se encontraron vehículos con esa búsqueda'
                      : 'Aún no hay vehículos registrados'}
                  </p>
                  {!search && (
                    <Button
                      variant="link"
                      onClick={handleNew}
                      className="mt-2 text-[#f97316]"
                    >
                      Registra tu primer vehículo
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <VehicleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        vehicle={editingVehicle}
      />

      {/* Deactivate Confirmation */}
      <AlertDialog
        open={!!deletingVehicle}
        onOpenChange={(open) => !open && setDeletingVehicle(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar vehículo?</AlertDialogTitle>
            <AlertDialogDescription>
              El vehículo{' '}
              <span className="font-semibold font-mono">
                {deletingVehicle?.plate}
              </span>{' '}
              ({deletingVehicle?.brand} {deletingVehicle?.model}) será
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
              Desactivar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
