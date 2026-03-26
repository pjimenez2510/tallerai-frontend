'use client';

import { useState } from 'react';
import { Download, ClipboardList, Package, Users } from 'lucide-react';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { ReportSummaryCards } from './report-summary-cards';
import { ReportTable } from './report-table';
import {
  useWorkOrdersReport,
  useInventoryReport,
  useClientsReport,
} from '@/hooks/use-reports';

type TabId = 'work-orders' | 'inventory' | 'clients';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'work-orders', label: 'Órdenes de Trabajo', icon: ClipboardList },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'clients', label: 'Clientes', icon: Users },
];

function downloadCsv(data: { headers: string[]; rows: string[][] }, filename: string) {
  const escape = (val: string | number) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];
  lines.push(data.headers.map(escape).join(','));
  for (const row of data.rows) {
    lines.push(row.map(escape).join(','));
  }

  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function WorkOrdersTab() {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [params, setParams] = useState<{ from?: string; to?: string }>({});

  const { data, isLoading, isFetching } = useWorkOrdersReport(params);

  function handleApply() {
    setParams({
      from: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
      to: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
    });
  }

  return (
    <div className="space-y-4">
      {/* Date range picker */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Desde</Label>
          <DatePicker
            value={fromDate}
            onChange={(d) => setFromDate(d ?? null)}
            placeholder="Fecha inicio"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hasta</Label>
          <DatePicker
            value={toDate}
            onChange={(d) => setToDate(d ?? null)}
            placeholder="Fecha fin"
          />
        </div>
        <Button
          onClick={handleApply}
          className="h-10 rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
          disabled={isFetching}
        >
          {isFetching ? 'Aplicando...' : 'Aplicar filtro'}
        </Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-[var(--color-bg-secondary)]" />
            ))}
          </div>
          <div className="h-40 rounded-xl bg-[var(--color-bg-secondary)]" />
        </div>
      ) : data ? (
        <>
          <ReportSummaryCards
            cards={[
              { label: 'Total OTs', value: data.summary.total },
              { label: 'Completadas', value: data.summary.completed },
              { label: 'Promedio días', value: data.summary.avgDays.toFixed(1) },
              { label: 'Ingresos', value: `$${data.summary.revenue.toFixed(2)}` },
            ]}
          />
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Detalle de Órdenes
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl gap-1.5"
                onClick={() => downloadCsv(data, 'ordenes-trabajo.csv')}
              >
                <Download className="h-3.5 w-3.5" />
                Exportar CSV
              </Button>
            </div>
            <ReportTable table={data} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function InventoryTab() {
  const { data, isLoading } = useInventoryReport();

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-[var(--color-bg-secondary)]" />
            ))}
          </div>
          <div className="h-40 rounded-xl bg-[var(--color-bg-secondary)]" />
        </div>
      ) : data ? (
        <>
          <ReportSummaryCards
            cards={[
              { label: 'Total Productos', value: data.summary.totalProducts },
              { label: 'Valor Total', value: `$${data.summary.totalValue.toFixed(2)}` },
              { label: 'Stock Bajo', value: data.summary.lowStock },
            ]}
          />
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Estado del Inventario
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl gap-1.5"
                onClick={() => downloadCsv(data, 'inventario.csv')}
              >
                <Download className="h-3.5 w-3.5" />
                Exportar CSV
              </Button>
            </div>
            <ReportTable table={data} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function ClientsTab() {
  const { data, isLoading } = useClientsReport();

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-[var(--color-bg-secondary)]" />
            ))}
          </div>
          <div className="h-40 rounded-xl bg-[var(--color-bg-secondary)]" />
        </div>
      ) : data ? (
        <>
          <ReportSummaryCards
            cards={[
              { label: 'Total Clientes', value: data.summary.total },
              { label: 'Con Email', value: data.summary.withEmail },
              { label: 'Con Teléfono', value: data.summary.withPhone },
            ]}
          />
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Listado de Clientes
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl gap-1.5"
                onClick={() => downloadCsv(data, 'clientes.csv')}
              >
                <Download className="h-3.5 w-3.5" />
                Exportar CSV
              </Button>
            </div>
            <ReportTable table={data} />
          </div>
        </>
      ) : null}
    </div>
  );
}

export function ReportsContent() {
  const [activeTab, setActiveTab] = useState<TabId>('work-orders');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Reportes
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Analiza y exporta datos del taller
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-[var(--color-bg-secondary)] p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-[var(--color-bg)] text-[var(--color-text-primary)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'work-orders' && <WorkOrdersTab />}
      {activeTab === 'inventory' && <InventoryTab />}
      {activeTab === 'clients' && <ClientsTab />}
    </div>
  );
}
