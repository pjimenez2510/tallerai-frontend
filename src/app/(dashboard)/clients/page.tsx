import type { Metadata } from 'next';
import { ClientsTable } from '@/components/clients/clients-table';

export const metadata: Metadata = {
  title: 'Clientes',
};

export default function ClientsPage() {
  return <ClientsTable />;
}
