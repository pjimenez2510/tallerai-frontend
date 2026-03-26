import type { Metadata } from 'next';
import { RolesTable } from '@/components/roles/roles-table';

export const metadata: Metadata = {
  title: 'Roles y Permisos',
};

export default function RolesPage() {
  return <RolesTable />;
}
