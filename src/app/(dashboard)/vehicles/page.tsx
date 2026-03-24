import type { Metadata } from 'next';
import { VehiclesTable } from '@/components/vehicles/vehicles-table';

export const metadata: Metadata = {
  title: 'Vehículos',
};

export default function VehiclesPage() {
  return <VehiclesTable />;
}
