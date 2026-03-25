'use client';

import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Users,
  Package,
  DollarSign,
  Plus,
  Car,
  TrendingUp,
  Wrench,
  Trophy,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { useDashboardMetrics } from '@/hooks/use-dashboard';

const STATUS_COLORS: Record<string, string> = {
  recepcion: '#64748b',
  diagnostico: '#3b82f6',
  aprobado: '#6366f1',
  en_progreso: '#f59e0b',
  completado: '#10b981',
  entregado: '#22c55e',
  cancelado: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  recepcion: 'Recepción',
  diagnostico: 'Diagnóstico',
  aprobado: 'Aprobado',
  en_progreso: 'En Progreso',
  completado: 'Completado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  borderColor: string;
  loading?: boolean;
}

function StatCard({ label, value, icon, borderColor, loading }: StatCardProps) {
  return (
    <div
      className={`rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)] border-l-4 ${borderColor}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
            {label}
          </p>
          {loading ? (
            <div className="h-8 w-20 rounded-lg bg-[var(--color-bg-secondary)] animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-[var(--color-text-primary)]">{value}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-bg-secondary)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function DashboardContent() {
  const router = useRouter();
  const { data: metrics, isLoading } = useDashboardMetrics();

  const byStatus = metrics?.workOrders?.byStatus;
  const chartData = byStatus
    ? Object.entries(byStatus)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
          name: STATUS_LABELS[status] ?? status,
          value: count,
          color: STATUS_COLORS[status] ?? '#94a3b8',
        }))
    : [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
          Resumen de tu taller mecánico
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="OTs Totales"
          value={metrics?.workOrders?.total ?? 0}
          icon={<ClipboardList className="h-5 w-5 text-blue-600" />}
          borderColor="border-l-blue-500"
          loading={isLoading}
        />
        <StatCard
          label="Clientes"
          value={metrics?.clients?.total ?? 0}
          icon={<Users className="h-5 w-5 text-emerald-600" />}
          borderColor="border-l-emerald-500"
          loading={isLoading}
        />
        <StatCard
          label="Valor Inventario"
          value={
            isLoading
              ? '—'
              : `$${(metrics?.inventory?.totalValue ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          }
          icon={<Package className="h-5 w-5 text-amber-600" />}
          borderColor="border-l-amber-500"
          loading={isLoading}
        />
        <StatCard
          label="Ingresos"
          value={
            isLoading
              ? '—'
              : `$${(metrics?.revenue?.total ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          }
          icon={<DollarSign className="h-5 w-5 text-[#f97316]" />}
          borderColor="border-l-[#f97316]"
          loading={isLoading}
        />
      </div>

      {/* Recent OTs + Top Mechanics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Work Orders */}
        <div className="lg:col-span-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-4 w-4 text-[#1e3a5f]" />
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Órdenes Recientes
            </h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-[var(--color-bg-secondary)] animate-pulse" />
              ))}
            </div>
          ) : !metrics?.recentWorkOrders || metrics.recentWorkOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-[var(--color-text-secondary)]">
              <ClipboardList className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No hay órdenes recientes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left pb-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      N° OT
                    </th>
                    <th className="text-left pb-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="text-left pb-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Placa
                    </th>
                    <th className="text-left pb-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider hidden sm:table-cell">
                      Estado
                    </th>
                    <th className="text-left pb-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider hidden md:table-cell">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {metrics.recentWorkOrders.map((wo) => (
                    <tr key={wo.orderNumber} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                      <td className="py-2.5 pr-4 font-mono text-xs font-semibold text-[#1e3a5f]">
                        {wo.orderNumber}
                      </td>
                      <td className="py-2.5 pr-4 text-[var(--color-text-primary)] truncate max-w-[120px]">
                        {wo.clientName}
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-[var(--color-text-secondary)]">
                        {wo.vehiclePlate}
                      </td>
                      <td className="py-2.5 pr-4 hidden sm:table-cell">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[wo.status] ? 'bg-opacity-10' : ''}`}
                          style={{
                            backgroundColor: `${STATUS_COLORS[wo.status] ?? '#94a3b8'}22`,
                            color: STATUS_COLORS[wo.status] ?? '#94a3b8',
                          }}
                        >
                          {STATUS_LABELS[wo.status] ?? wo.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-xs text-[var(--color-text-secondary)] hidden md:table-cell whitespace-nowrap">
                        {new Date(wo.createdAt).toLocaleDateString('es-EC')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Mechanics */}
        <div className="rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-[#f97316]" />
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Top Mecánicos
            </h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse" />
              ))}
            </div>
          ) : !metrics?.topMechanics || metrics.topMechanics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-[var(--color-text-secondary)]">
              <Wrench className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">Sin datos aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.topMechanics.slice(0, 3).map((mechanic, index) => (
                <div
                  key={mechanic.name}
                  className="flex items-center gap-3 rounded-xl bg-[var(--color-bg-secondary)] px-3 py-2.5"
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                      index === 0
                        ? 'bg-[#f97316] text-white'
                        : index === 1
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-700/20 text-amber-700'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {mechanic.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {mechanic.completedCount} completadas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OT Status Chart */}
        <div className="lg:col-span-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#1e3a5f]" />
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Estado de Órdenes de Trabajo
            </h2>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="h-40 w-40 rounded-full border-4 border-[var(--color-bg-secondary)] animate-pulse" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-[var(--color-text-secondary)]">
              <ClipboardList className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">No hay órdenes de trabajo aún</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, '']}
                  contentStyle={{
                    borderRadius: '0.75rem',
                    border: '1px solid var(--color-border)',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-[var(--color-text-secondary)]">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
            Acciones Rápidas
          </h2>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/work-orders')}
              className="w-full justify-start gap-3 h-12 rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                <Plus className="h-4 w-4" />
              </div>
              Nueva Orden de Trabajo
            </Button>
            <Button
              onClick={() => router.push('/clients')}
              variant="outline"
              className="w-full justify-start gap-3 h-12 rounded-xl border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                <Users className="h-4 w-4 text-emerald-700" />
              </div>
              Nuevo Cliente
            </Button>
            <Button
              onClick={() => router.push('/vehicles')}
              variant="outline"
              className="w-full justify-start gap-3 h-12 rounded-xl border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100">
                <Car className="h-4 w-4 text-cyan-700" />
              </div>
              Nuevo Vehículo
            </Button>
            <Button
              onClick={() => router.push('/work-orders')}
              variant="outline"
              className="w-full justify-start gap-3 h-12 rounded-xl border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                <ClipboardList className="h-4 w-4 text-blue-700" />
              </div>
              Ver todas las OTs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
