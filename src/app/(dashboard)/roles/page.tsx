import type { Metadata } from 'next';
import { PagePermissionGuard } from '@/components/auth/page-permission-guard';
import { RolesTable } from '@/components/roles/roles-table';

export const metadata: Metadata = {
  title: 'Roles y Permisos',
};

export default function RolesTablePage() {
  return (
    <PagePermissionGuard permission="roles.view">
      <RolesTable />
    </PagePermissionGuard>
  );
}
