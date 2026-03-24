import type { Metadata } from 'next';
import { UsersTable } from '@/components/users/users-table';

export const metadata: Metadata = {
  title: 'Usuarios',
};

export default function UsersPage() {
  return <UsersTable />;
}
