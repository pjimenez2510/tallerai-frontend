'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CarFront,
  User,
  Gauge,
  Fuel,
  Wrench,
  Calendar,
  Package,
  DollarSign,
  CheckSquare,
  Clock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVehicle } from '@/hooks/use-vehicles';
import { useVehicleTimeline } from '@/hooks/use-work-orders';
import type { WorkOrderStatus, WorkOrderPriority, VehicleTimelineEntry } from '@/types/work-order.types';

const statusConfig: Record<WorkOrderStatus, { label: string; color: string; bg: string; dot: string }> = {
  recepcion: { label: 'Recepción', color: 'text-slate-700', bg: 'bg-slate-100', dot: 'bg-slate-400' },
  diagnostico: { label: 'Diagnóstico', color: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  aprobado: { label: 'Aprobado', color: 'text-indigo-700', bg: 'bg-indigo-100', dot: 'bg-indigo-500' },
  en_progreso: { label: 'En Progreso', color: 'text-amber-700', bg: 'bg-amber-100', dot: 'bg-amber-500' },
  completado: { label: 'Completado', color: 'text-emerald-700', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  entregado: { label: 'Entregado', color: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
  cancelado: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500' },
};

const priorityConfig: Record<WorkOrderPriority, { label: string; color: string }> = {
  baja: { label: 'Baja', color: 'text-slate-500' },
  normal: { label: 'Normal', color: 'text-blue-600' },
  alta: { label: 'Alta', color: 'text-amber-600' },
  urgente: { label: 'Urgente', color: 'text-red-600' },
};

function ColorDot({ color }: { color: string | null }) {
  if (!color) return null;

  const colorMap: Record<string, string> = {
    blanco: '#f8fafc',
    negro: '#1e293b',
    rojo: '#ef4444',
    azul: '#3b82f6',
    gris: '#9ca3af',
    plata: '#cbd5e1',
    verde: '#22c55e',
    amarillo: '#eab308',
    naranja: '#f97316',
  };

  const bg = colorMap[color.toLowerCase()] ?? '#d1d5db';

  return (
    <span
      className="inline-block h-3 w-3 rounded-full border border-[var(--color-border)] shrink-0"
      style={{ backgroundColor: bg }}
    />
  );
}

function TimelineEntry({ entry, isLast }: { entry: VehicleTimelineEntry; isLast: boolean }) {
  const status = statusConfig[entry.status];
  const priority = priorityConfig[entry.priority];

  return (
    <div className="flex gap-4">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`h-4 w-4 rounded-full border-2 border-white shadow-sm ${status.dot} ring-2 ring-offset-1 ring-[var(--color-border)]`}
        />
        {!isLast && (
          <div className="w-0.5 flex-1 mt-1 mb-1 bg-[var(--color-border)]" />
        )}
      </div>

      {/* Entry card */}
      <div className={`flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-sm ${isLast ? '' : 'mb-4'}`}>
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-mono text-sm font-bold text-[#1e3a5f]">
            {entry.orderNumber}
          </span>
          <Badge className={`${status.bg} ${status.color} hover:${status.bg} text-xs`}>
            {status.label}
          </Badge>
          <span className={`text-xs font-medium ${priority.color}`}>
            {priority.label}
          </span>
          <span className="ml-auto text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(entry.createdAt).toLocaleDateString('es-EC', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--color-text-primary)] mb-3 line-clamp-2">
          {entry.description}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 text-xs text-[var(--color-text-secondary)]">
          {entry.mechanicName && (
            <span className="flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              {entry.mechanicName}
            </span>
          )}
          {entry.mileageIn !== null && (
            <span className="flex items-center gap-1 font-mono">
              <Gauge className="h-3 w-3" />
              {entry.mileageIn.toLocaleString()} km
            </span>
          )}
          <span className="flex items-center gap-1">
            <CheckSquare className="h-3 w-3" />
            {entry.tasksCount} {entry.tasksCount === 1 ? 'tarea' : 'tareas'}
          </span>
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            {entry.partsCount} {entry.partsCount === 1 ? 'repuesto' : 'repuestos'}
          </span>
          {entry.completedDate && (
            <span className="flex items-center gap-1 text-emerald-600">
              <Clock className="h-3 w-3" />
              Completada: {new Date(entry.completedDate).toLocaleDateString('es-EC')}
            </span>
          )}
        </div>

        {/* Totals */}
        {(entry.totalParts > 0 || entry.totalLabor > 0) && (
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex flex-wrap gap-4 text-xs">
            {entry.totalParts > 0 && (
              <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                <Package className="h-3 w-3" />
                Repuestos:{' '}
                <span className="font-semibold text-[var(--color-text-primary)]">
                  ${entry.totalParts.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </span>
            )}
            {entry.totalLabor > 0 && (
              <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                <Wrench className="h-3 w-3" />
                Mano de obra:{' '}
                <span className="font-semibold text-[var(--color-text-primary)]">
                  ${entry.totalLabor.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </span>
            )}
            <span className="flex items-center gap-1 font-semibold text-[#1e3a5f]">
              <DollarSign className="h-3 w-3" />
              Total: ${entry.total.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface VehicleDetailContentProps {
  vehicleId: string;
}

export function VehicleDetailContent({ vehicleId }: VehicleDetailContentProps) {
  const router = useRouter();
  const { data: vehicle, isLoading: loadingVehicle } = useVehicle(vehicleId);
  const { data: timeline, isLoading: loadingTimeline } = useVehicleTimeline(vehicleId);

  if (loadingVehicle) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--color-text-secondary)]">Vehículo no encontrado</p>
        <Button
          variant="link"
          onClick={() => router.push('/vehicles')}
          className="mt-2 text-[#f97316]"
        >
          Volver a Vehículos
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/vehicles')}
        className="gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Vehículos
      </Button>

      {/* Vehicle info card */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            <CarFront className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge variant="outline" className="font-mono text-sm font-bold">
                {vehicle.plate}
              </Badge>
              {vehicle.color && <ColorDot color={vehicle.color} />}
              {vehicle.color && (
                <span className="text-sm text-[var(--color-text-secondary)]">{vehicle.color}</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
              {vehicle.brand} {vehicle.model}{' '}
              <span className="text-[var(--color-text-secondary)] font-normal text-base">
                ({vehicle.year})
              </span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[var(--color-border)]">
          <div>
            <p className="text-xs text-[var(--color-text-secondary)] mb-0.5 flex items-center gap-1">
              <User className="h-3 w-3" /> Propietario
            </p>
            <p className="text-sm font-medium">{vehicle.clientName}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-secondary)] mb-0.5 flex items-center gap-1">
              <Gauge className="h-3 w-3" /> Kilometraje
            </p>
            <p className="text-sm font-medium font-mono">
              {vehicle.mileage.toLocaleString()} km
            </p>
          </div>
          {vehicle.fuelType && (
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-0.5 flex items-center gap-1">
                <Fuel className="h-3 w-3" /> Combustible
              </p>
              <p className="text-sm font-medium">{vehicle.fuelType}</p>
            </div>
          )}
          {vehicle.engine && (
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-0.5">Motor</p>
              <p className="text-sm font-medium">{vehicle.engine}</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Historial de Órdenes de Trabajo
          </h2>
          {timeline && timeline.length > 0 && (
            <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] rounded-full px-2.5 py-0.5">
              {timeline.length} {timeline.length === 1 ? 'visita' : 'visitas'}
            </span>
          )}
        </div>

        {loadingTimeline ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-4 w-4 rounded-full bg-[var(--color-bg-secondary)] animate-pulse" />
                  {i < 3 && <div className="w-0.5 h-20 mt-1 bg-[var(--color-bg-secondary)] animate-pulse" />}
                </div>
                <div className="flex-1 h-24 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse mb-4" />
              </div>
            ))}
          </div>
        ) : !timeline || timeline.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-10 text-center">
            <CarFront className="h-10 w-10 mx-auto text-[var(--color-text-secondary)]/30 mb-3" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              Este vehículo no tiene órdenes de trabajo aún
            </p>
          </div>
        ) : (
          <div>
            {timeline.map((entry, index) => (
              <TimelineEntry
                key={entry.id}
                entry={entry}
                isLast={index === timeline.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
