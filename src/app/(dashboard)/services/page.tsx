import type { Metadata } from 'next';
import { ServicesTable } from '@/components/services/services-table';

export const metadata: Metadata = {
  title: 'Servicios',
};

export default function ServicesPage() {
  return <ServicesTable />;
}
