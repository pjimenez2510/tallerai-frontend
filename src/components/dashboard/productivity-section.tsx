'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Clock, ClipboardList } from 'lucide-react';
import { useProductivity } from '@/hooks/use-dashboard';

function ChangeIndicator({ percent }: { percent: number }) {
  const isPositive = percent >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const color = isPositive ? 'text-emerald-600' : 'text-red-500';
  const bg = isPositive ? 'bg-emerald-50' : 'bg-red-50';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${color} ${bg}`}>
      <Icon className="h-3 w-3" />
      {isPositive ? '+' : ''}{percent.toFixed(1)}%
    </span>
  );
}

export function ProductivitySection() {
  const { data: productivity, isLoading } = useProductivity();

  return (
    <div className="rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-4 w-4 text-[#1e3a5f]" />
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Productividad
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* This month vs last month */}
        <div className="rounded-xl bg-[var(--color-bg-secondary)] p-4">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider font-medium">
              Este mes
            </p>
          </div>
          {isLoading ? (
            <div className="h-8 w-16 rounded-lg bg-[var(--color-bg)] animate-pulse mt-1" />
          ) : (
            <div className="flex items-end gap-2 mt-1">
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {productivity?.workOrdersThisMonth ?? 0}
              </p>
              {productivity && productivity.workOrdersLastMonth > 0 && (
                <div className="mb-0.5">
                  <ChangeIndicator
                    percent={
                      ((productivity.workOrdersThisMonth - productivity.workOrdersLastMonth) /
                        productivity.workOrdersLastMonth) *
                      100
                    }
                  />
                </div>
              )}
            </div>
          )}
          {!isLoading && productivity && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              vs {productivity.workOrdersLastMonth} el mes pasado
            </p>
          )}
        </div>

        {/* Average completion time */}
        <div className="rounded-xl bg-[var(--color-bg-secondary)] p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider font-medium">
              Tiempo promedio
            </p>
          </div>
          {isLoading ? (
            <div className="h-8 w-20 rounded-lg bg-[var(--color-bg)] animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">
              {productivity?.avgCompletionDays != null
                ? `${productivity.avgCompletionDays.toFixed(1)}d`
                : '—'}
            </p>
          )}
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            de recepción a entrega
          </p>
        </div>

        {/* Last 6 months total */}
        <div className="rounded-xl bg-[var(--color-bg-secondary)] p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider font-medium">
              Últimos 6 meses
            </p>
          </div>
          {isLoading ? (
            <div className="h-8 w-16 rounded-lg bg-[var(--color-bg)] animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">
              {productivity?.monthlyTrend.reduce((acc, m) => acc + m.count, 0) ?? 0}
            </p>
          )}
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            órdenes completadas
          </p>
        </div>
      </div>

      {/* Bar chart */}
      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-bg-secondary)] border-t-[#1e3a5f]" />
        </div>
      ) : !productivity?.monthlyTrend || productivity.monthlyTrend.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center text-[var(--color-text-secondary)]">
          <ClipboardList className="h-8 w-8 mb-2 opacity-30" />
          <p className="text-sm">Sin datos de tendencia aún</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={192}>
          <BarChart
            data={productivity.monthlyTrend}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-bg-secondary)' }}
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid var(--color-border)',
                fontSize: '12px',
                backgroundColor: 'var(--color-bg)',
              }}
              formatter={(value) => [value, 'Órdenes']}
            />
            <Bar
              dataKey="count"
              fill="#1e3a5f"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
