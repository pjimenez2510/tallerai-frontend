import {
  Wrench,
  Car,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  DollarSign,
  CheckSquare,
  Gauge,
} from 'lucide-react';
import type { WorkOrderStatus, WorkOrderPriority } from '@/types/work-order.types';
import type { PublicVehicleWorkOrder } from '@/types/public.types';
import { publicApi } from '@/lib/api/public';

const STATUS_CONFIG: Record<
  WorkOrderStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  recepcion: { label: 'Recepción', color: 'text-slate-700', bg: 'bg-slate-100', dot: 'bg-slate-400' },
  diagnostico: { label: 'Diagnóstico', color: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  aprobado: { label: 'Aprobado', color: 'text-indigo-700', bg: 'bg-indigo-100', dot: 'bg-indigo-500' },
  en_progreso: { label: 'En Progreso', color: 'text-amber-700', bg: 'bg-amber-100', dot: 'bg-amber-500' },
  completado: { label: 'Completado', color: 'text-emerald-700', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  entregado: { label: 'Entregado', color: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
  cancelado: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500' },
};

const PRIORITY_CONFIG: Record<WorkOrderPriority, { label: string; color: string }> = {
  baja: { label: 'Baja', color: 'text-slate-500' },
  normal: { label: 'Normal', color: 'text-blue-600' },
  alta: { label: 'Alta', color: 'text-amber-600' },
  urgente: { label: 'Urgente', color: 'text-red-600' },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function WorkOrderCard({
  wo,
  isLast,
}: {
  wo: PublicVehicleWorkOrder;
  isLast: boolean;
}) {
  const status = STATUS_CONFIG[wo.status];
  const priority = PRIORITY_CONFIG[wo.priority];

  return (
    <div className="flex gap-4">
      {/* Timeline dot */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`h-4 w-4 rounded-full border-2 border-white shadow-sm ${status.dot} ring-2 ring-offset-1 ring-[#e2e8f0]`}
        />
        {!isLast && <div className="w-0.5 flex-1 mt-1 mb-1 bg-[#e2e8f0]" />}
      </div>

      {/* Card */}
      <div className={`flex-1 rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm ${isLast ? '' : 'mb-4'}`}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-mono text-sm font-bold text-[#1e3a5f]">
            {wo.orderNumber}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.bg} ${status.color}`}
          >
            {status.label}
          </span>
          <span className={`text-xs font-medium ${priority.color}`}>
            {priority.label}
          </span>
          <span className="ml-auto text-xs text-[#64748b] flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(wo.createdAt)}
          </span>
        </div>

        <p className="text-sm text-[#334155] mb-3 line-clamp-2">{wo.description}</p>

        <div className="flex flex-wrap gap-3 text-xs text-[#64748b]">
          {wo.mileageIn !== null && (
            <span className="flex items-center gap-1 font-mono">
              <Gauge className="h-3 w-3" />
              {wo.mileageIn.toLocaleString()} km
            </span>
          )}
          <span className="flex items-center gap-1">
            <CheckSquare className="h-3 w-3" />
            {wo.tasksCount} {wo.tasksCount === 1 ? 'tarea' : 'tareas'}
          </span>
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            {wo.partsCount} {wo.partsCount === 1 ? 'repuesto' : 'repuestos'}
          </span>
          {wo.completedDate && (
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              {formatDate(wo.completedDate)}
            </span>
          )}
        </div>

        {wo.total > 0 && (
          <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex flex-wrap gap-3 text-xs">
            {wo.totalParts > 0 && (
              <span className="flex items-center gap-1 text-[#64748b]">
                <Package className="h-3 w-3" />
                Repuestos:{' '}
                <span className="font-semibold text-[#334155]">
                  ${wo.totalParts.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                </span>
              </span>
            )}
            {wo.totalLabor > 0 && (
              <span className="flex items-center gap-1 text-[#64748b]">
                <Wrench className="h-3 w-3" />
                M.O.:{' '}
                <span className="font-semibold text-[#334155]">
                  ${wo.totalLabor.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                </span>
              </span>
            )}
            <span className="flex items-center gap-1 font-semibold text-[#1e3a5f]">
              <DollarSign className="h-3 w-3" />
              Total: ${wo.total.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function PublicVehiclePage({
  params,
}: {
  params: Promise<{ plate: string }>;
}) {
  const { plate } = await params;
  const decodedPlate = decodeURIComponent(plate).toUpperCase();

  let vehicleHistory = null;
  let notFound = false;

  try {
    const response = await publicApi.getVehicleHistory(decodedPlate);
    vehicleHistory = response.data;
  } catch {
    notFound = true;
  }

  if (notFound || !vehicleHistory) {
    return (
      <div className="min-h-dvh bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {/* Brand */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a5f] shadow-lg">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-[#64748b] uppercase tracking-widest">TallerIA</p>
              <p className="text-sm font-bold text-[#0f172a]">Portal de Vehículos</p>
            </div>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mx-auto mb-4">
            <Car className="h-8 w-8 text-slate-400" />
          </div>
          <h1 className="text-xl font-bold text-[#0f172a] mb-2">Vehículo no encontrado</h1>
          <p className="text-sm text-[#64748b]">
            La placa{' '}
            <span className="font-mono font-semibold text-[#0f172a]">{decodedPlate}</span>{' '}
            no tiene historial registrado en este taller.
          </p>
          <p className="text-xs text-[#94a3b8] mt-4">
            Consulta el estado de tu vehículo en tiempo real con TallerIA
          </p>
        </div>
      </div>
    );
  }

  const { workOrders } = vehicleHistory;

  return (
    <div className="min-h-dvh bg-[#f8fafc] p-4">
      <div className="mx-auto max-w-lg">
        {/* Header / Brand */}
        <div className="flex items-center gap-3 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a5f] shadow-lg">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748b] uppercase tracking-widest">TallerIA</p>
            <p className="text-sm font-bold text-[#0f172a]">{vehicleHistory.tenantName}</p>
          </div>
        </div>

        {/* Vehicle card */}
        <div className="rounded-2xl bg-white border border-[#e2e8f0] shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] px-6 py-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-white/60 uppercase tracking-widest mb-0.5">
                  Vehículo
                </p>
                <p className="text-xl font-bold font-mono text-white">{vehicleHistory.plate}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 px-3 py-2">
                <p className="text-xs text-white/60 mb-0.5">Marca / Modelo</p>
                <p className="text-sm font-semibold text-white">
                  {vehicleHistory.brand} {vehicleHistory.model}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 px-3 py-2">
                <p className="text-xs text-white/60 mb-0.5">Año</p>
                <p className="text-sm font-semibold text-white">{vehicleHistory.year}</p>
              </div>
              {vehicleHistory.color && (
                <div className="rounded-xl bg-white/10 px-3 py-2">
                  <p className="text-xs text-white/60 mb-0.5">Color</p>
                  <p className="text-sm font-semibold text-white capitalize">{vehicleHistory.color}</p>
                </div>
              )}
              <div className="rounded-xl bg-white/10 px-3 py-2">
                <p className="text-xs text-white/60 mb-0.5">Propietario</p>
                <p className="text-sm font-semibold text-white">{vehicleHistory.clientName}</p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="px-6 py-4 border-t border-[#f1f5f9] flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#1e3a5f]">{workOrders.length}</p>
              <p className="text-xs text-[#64748b]">
                {workOrders.length === 1 ? 'visita' : 'visitas'}
              </p>
            </div>
            {workOrders.length > 0 && (
              <>
                <div className="h-8 w-px bg-[#e2e8f0]" />
                <div className="text-center">
                  <p className="text-sm font-bold text-[#1e3a5f]">
                    {formatDate(workOrders[workOrders.length - 1].createdAt)}
                  </p>
                  <p className="text-xs text-[#64748b]">primera visita</p>
                </div>
                <div className="h-8 w-px bg-[#e2e8f0]" />
                <div className="text-center">
                  <p className="text-sm font-bold text-[#1e3a5f]">
                    {formatDate(workOrders[0].createdAt)}
                  </p>
                  <p className="text-xs text-[#64748b]">última visita</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#334155] mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#64748b]" />
            Historial de Servicios
          </h2>

          {workOrders.length === 0 ? (
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-10 text-center">
              <Car className="h-10 w-10 mx-auto text-[#cbd5e1] mb-3" />
              <p className="text-sm text-[#64748b]">No hay órdenes de trabajo registradas aún</p>
            </div>
          ) : (
            <div>
              {workOrders.map((wo, index) => (
                <WorkOrderCard
                  key={wo.id}
                  wo={wo}
                  isLast={index === workOrders.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[#94a3b8] pb-6">
          Historial del vehículo generado por TallerIA · Consulta en tiempo real
        </p>
      </div>
    </div>
  );
}
