import type { Metadata } from 'next';
import { PurchasesTable } from '@/components/purchases/purchases-table';

export const metadata: Metadata = {
  title: 'Compras',
};

export default function PurchasesPage() {
  return <PurchasesTable />;
}
