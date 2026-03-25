import type { Metadata } from 'next';
import { ReportsContent } from '@/components/reports/reports-content';

export const metadata: Metadata = {
  title: 'Reportes',
};

export default function ReportsPage() {
  return <ReportsContent />;
}
