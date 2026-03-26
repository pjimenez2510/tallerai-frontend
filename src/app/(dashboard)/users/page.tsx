import type { Metadata } from 'next';
import { PagePermissionGuard } from '@/components/auth/page-permission-guard';
import { UsersTable } from '@/components/users/users-table';

export const metadata: Metadata = {
  title: 'Usuarios',
};

export default function UsersTablePage() {
  return (
    <PagePermissionGuard permission="users.view">
      <UsersTable />
    </PagePermissionGuard>
  );
}
