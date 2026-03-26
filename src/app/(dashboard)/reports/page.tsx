import type { Metadata } from 'next';
import { PagePermissionGuard } from '@/components/auth/page-permission-guard';
import { ReportsContent } from '@/components/reports/reports-content';

export const metadata: Metadata = {
  title: 'Reportes',
};

export default function ReportsContentPage() {
  return (
    <PagePermissionGuard permission="reports.view">
      <ReportsContent />
    </PagePermissionGuard>
  );
}
