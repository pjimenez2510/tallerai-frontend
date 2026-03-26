export interface WorkOrderReportParams {
  from?: string;
  to?: string;
  status?: string;
}

export interface WorkOrderReport {
  headers: string[];
  rows: string[][];
  summary: {
    total: number;
    completed: number;
    avgDays: number;
    revenue: number;
  };
}

export interface InventoryReport {
  headers: string[];
  rows: string[][];
  summary: {
    totalProducts: number;
    totalValue: number;
    lowStock: number;
  };
}

export interface ClientReport {
  headers: string[];
  rows: string[][];
  summary: {
    total: number;
    withEmail: number;
    withPhone: number;
  };
}
