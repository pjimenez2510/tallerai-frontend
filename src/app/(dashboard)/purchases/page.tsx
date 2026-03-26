import type { Metadata } from 'next';
import { PagePermissionGuard } from '@/components/auth/page-permission-guard';
import { PurchasesTable } from '@/components/purchases/purchases-table';

export const metadata: Metadata = {
  title: 'Compras',
};

export default function PurchasesTablePage() {
  return (
    <PagePermissionGuard permission="purchases.view">
      <PurchasesTable />
    </PagePermissionGuard>
  );
}
