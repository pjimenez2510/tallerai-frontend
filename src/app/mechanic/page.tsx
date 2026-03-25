import type { Metadata } from 'next';
import { MechanicContent } from '@/components/mechanic/mechanic-content';

export const metadata: Metadata = {
  title: 'Mi Trabajo — TallerIA',
};

export default function MechanicPage() {
  return <MechanicContent />;
}
