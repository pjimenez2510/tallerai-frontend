import type { Metadata } from 'next';
import { PagePermissionGuard } from '@/components/auth/page-permission-guard';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardIndexPage() {
  return (
    <PagePermissionGuard permission="dashboard.view">
      <DashboardContent />
    </PagePermissionGuard>
  );
}
