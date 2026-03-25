import type { Metadata } from 'next';
import { TenantSettingsForm } from '@/components/settings/tenant-settings-form';
import { BusinessSettingsForm } from '@/components/settings/business-settings-form';

export const metadata: Metadata = {
  title: 'Configuración',
};

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Configuración
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Administra la información y parámetros de tu taller
        </p>
      </div>

      <TenantSettingsForm />
      <BusinessSettingsForm />
    </div>
  );
}
