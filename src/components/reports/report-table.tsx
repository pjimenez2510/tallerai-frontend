'use client';

import type { ReportTable as ReportTableType } from '@/types/report.types';

interface ReportTableProps {
  table: ReportTableType;
}

export function ReportTable({ table }: ReportTableProps) {
  if (!table || !table.headers) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-[var(--color-text-secondary)]">
        Cargando datos...
      </div>
    );
  }

  const rows = table.rows.slice(0, 10);

  if (!table.headers.length) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-[var(--color-text-secondary)]">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            {table.headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={table.headers.length}
                className="px-4 py-6 text-center text-xs text-[var(--color-text-secondary)]"
              >
                Sin registros en el período seleccionado
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-3 text-xs text-[var(--color-text-primary)] whitespace-nowrap"
                  >
                    {String(cell)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
