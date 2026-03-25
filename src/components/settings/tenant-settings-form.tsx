'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, MapPin, Phone, Mail, ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';

const tenantSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  address: z.string().max(200).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Email inválido').max(100).optional().or(z.literal('')),
  logoUrl: z.string().url('URL inválida').max(500).optional().or(z.literal('')),
});

type TenantFormData = z.infer<typeof tenantSchema>;

export function TenantSettingsForm() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
      logoUrl: '',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        name: settings.name ?? '',
        address: settings.address ?? '',
        phone: settings.phone ?? '',
        email: settings.email ?? '',
        logoUrl: settings.logoUrl ?? '',
      });
    }
  }, [settings, reset]);

  async function onSubmit(data: TenantFormData) {
    await updateSettings.mutateAsync({
      name: data.name,
      address: data.address || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      logoUrl: data.logoUrl || undefined,
    });
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-[var(--color-bg-secondary)] rounded w-1/3" />
          <div className="h-10 bg-[var(--color-bg-secondary)] rounded-xl" />
          <div className="h-10 bg-[var(--color-bg-secondary)] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f]/10">
          <Building2 className="h-4 w-4 text-[#1e3a5f]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Información del Taller
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Datos generales del taller visibles en documentos y reportes
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label className="text-xs">Nombre del taller</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              placeholder="Taller Mecánico XYZ"
              className="h-10 pl-10 rounded-xl"
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-[var(--color-error)]">{errors.name.message}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label className="text-xs">
            Dirección{' '}
            <span className="text-[var(--color-text-secondary)] font-normal">(opcional)</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              placeholder="Av. Principal 123, Ciudad"
              className="h-10 pl-10 rounded-xl"
              {...register('address')}
            />
          </div>
          {errors.address && (
            <p className="text-xs text-[var(--color-error)]">{errors.address.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label className="text-xs">
            Teléfono{' '}
            <span className="text-[var(--color-text-secondary)] font-normal">(opcional)</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              placeholder="0998765432"
              className="h-10 pl-10 rounded-xl"
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-[var(--color-error)]">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-xs">
            Email{' '}
            <span className="text-[var(--color-text-secondary)] font-normal">(opcional)</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              type="email"
              placeholder="taller@ejemplo.com"
              className="h-10 pl-10 rounded-xl"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-[var(--color-error)]">{errors.email.message}</p>
          )}
        </div>

        {/* Logo URL */}
        <div className="space-y-1.5">
          <Label className="text-xs">
            URL del Logo{' '}
            <span className="text-[var(--color-text-secondary)] font-normal">(opcional)</span>
          </Label>
          <div className="relative">
            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              placeholder="https://ejemplo.com/logo.png"
              className="h-10 pl-10 rounded-xl"
              {...register('logoUrl')}
            />
          </div>
          {errors.logoUrl && (
            <p className="text-xs text-[var(--color-error)]">{errors.logoUrl.message}</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </span>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
