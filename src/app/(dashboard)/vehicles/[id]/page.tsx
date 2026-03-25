import type { Metadata } from 'next';
import { VehicleDetailContent } from '@/components/vehicles/vehicle-detail-content';

export const metadata: Metadata = {
  title: 'Historial del Vehículo',
};

interface VehicleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { id } = await params;
  return <VehicleDetailContent vehicleId={id} />;
}
