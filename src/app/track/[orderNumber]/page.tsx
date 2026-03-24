import { Wrench, Car, Calendar, CheckCircle2, Clock } from 'lucide-react';
import type { WorkOrderStatus } from '@/types/work-order.types';
import { publicApi } from '@/lib/api/public';

const STATUS_CONFIG: Record<
  WorkOrderStatus,
  { label: string; color: string; bg: string; step: number }
> = {
  recepcion: { label: 'Recepción', color: 'text-slate-700', bg: 'bg-slate-100', step: 1 },
  diagnostico: { label: 'Diagnóstico', color: 'text-blue-700', bg: 'bg-blue-100', step: 2 },
  aprobado: { label: 'Aprobado', color: 'text-indigo-700', bg: 'bg-indigo-100', step: 3 },
  en_progreso: { label: 'En Progreso', color: 'text-amber-700', bg: 'bg-amber-100', step: 4 },
  completado: { label: 'Completado', color: 'text-emerald-700', bg: 'bg-emerald-100', step: 5 },
  entregado: { label: 'Entregado', color: 'text-green-700', bg: 'bg-green-100', step: 6 },
  cancelado: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100', step: 0 },
};

const PROGRESS_STEPS: { status: WorkOrderStatus; label: string }[] = [
  { status: 'recepcion', label: 'Recepción' },
  { status: 'diagnostico', label: 'Diagnóstico' },
  { status: 'aprobado', label: 'Aprobado' },
  { status: 'en_progreso', label: 'En Progreso' },
  { status: 'completado', label: 'Completado' },
  { status: 'entregado', label: 'Entregado' },
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  let order = null;
  let error = false;

  try {
    const response = await publicApi.getWorkOrderStatus(orderNumber);
    order = response.data;
  } catch {
    error = true;
  }

  if (error || !order) {
    return (
      <div className="min-h-dvh bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 mx-auto mb-4">
            <Wrench className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-[#0f172a] mb-2">
            Orden no encontrada
          </h1>
          <p className="text-sm text-[#64748b]">
            El número de orden <span className="font-mono font-semibold">{orderNumber}</span> no
            existe o no está disponible para consulta pública.
          </p>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status];
  const currentStep = statusCfg.step;
  const isCancelled = order.status === 'cancelado';

  return (
    <div className="min-h-dvh bg-[#f8fafc] p-4">
      <div className="mx-auto max-w-md">
        {/* Header / Brand */}
        <div className="flex items-center gap-3 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a5f] shadow-lg">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748b] uppercase tracking-widest">
              TallerIA
            </p>
            <p className="text-sm font-bold text-[#0f172a]">{order.tenantName}</p>
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-2xl bg-white border border-[#e2e8f0] shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] px-6 py-5">
            <p className="text-xs font-medium text-white/60 uppercase tracking-widest mb-1">
              Orden de Trabajo
            </p>
            <p className="text-2xl font-bold font-mono text-white">{order.orderNumber}</p>
            <div className="mt-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}
              >
                {statusCfg.label}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Vehicle info */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 shrink-0">
                <Car className="h-4.5 w-4.5 text-cyan-700" />
              </div>
              <div>
                <p className="text-xs text-[#64748b] mb-0.5">Vehículo</p>
                <p className="text-sm font-bold font-mono text-[#0f172a]">
                  {order.vehiclePlate}
                </p>
                <p className="text-xs text-[#64748b]">{order.vehicleDescription}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs text-[#64748b] mb-1">Descripción del trabajo</p>
              <p className="text-sm text-[#0f172a] bg-[#f8fafc] rounded-xl p-3 leading-relaxed line-clamp-3">
                {order.description}
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#f8fafc] p-3">
                <div className="flex items-center gap-1.5 text-xs text-[#64748b] mb-1">
                  <Calendar className="h-3 w-3" />
                  Ingreso
                </div>
                <p className="text-xs font-medium text-[#0f172a]">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              {order.estimatedDate && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 mb-1">
                    <Clock className="h-3 w-3" />
                    Entrega estimada
                  </div>
                  <p className="text-xs font-medium text-amber-900">
                    {formatDate(order.estimatedDate)}
                  </p>
                </div>
              )}

              {order.completedDate && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 mb-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Completado
                  </div>
                  <p className="text-xs font-medium text-emerald-900">
                    {formatDate(order.completedDate)}
                  </p>
                </div>
              )}

              {order.deliveredDate && (
                <div className="rounded-xl bg-green-50 border border-green-100 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-green-700 mb-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Entregado
                  </div>
                  <p className="text-xs font-medium text-green-900">
                    {formatDate(order.deliveredDate)}
                  </p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {!isCancelled && (
              <div>
                <p className="text-xs text-[#64748b] mb-3">Progreso</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {PROGRESS_STEPS.map((step, index) => {
                      const stepConfig = STATUS_CONFIG[step.status];
                      const isDone = stepConfig.step <= currentStep;
                      const isCurrent = stepConfig.step === currentStep;
                      return (
                        <div key={step.status} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className={`h-2 w-full rounded-full transition-colors ${
                              isDone ? 'bg-[#1e3a5f]' : 'bg-[#e2e8f0]'
                            } ${isCurrent ? 'ring-2 ring-[#1e3a5f]/30 ring-offset-1' : ''}`}
                          />
                          {index === 0 || index === PROGRESS_STEPS.length - 1 ? (
                            <p className="text-[9px] text-[#64748b] text-center leading-tight">
                              {step.label}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {isCancelled && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-center">
                <p className="text-sm font-medium text-red-700">
                  Esta orden de trabajo fue cancelada
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[#94a3b8] mt-6 pb-4">
          Consulta el estado de tu vehículo en tiempo real con TallerIA
        </p>
      </div>
    </div>
  );
}
