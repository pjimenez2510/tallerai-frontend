export interface ReportSummaryCard {
  label: string;
  value: string | number;
  change?: string;
}

export interface ReportTable {
  headers: string[];
  rows: (string | number)[][];
}

export interface WorkOrderReportParams {
  from?: string;
  to?: string;
}

export interface WorkOrderReport {
  summary: ReportSummaryCard[];
  table: ReportTable;
}

export interface InventoryReport {
  summary: ReportSummaryCard[];
  table: ReportTable;
}

export interface ClientReport {
  summary: ReportSummaryCard[];
  table: ReportTable;
}
