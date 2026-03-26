'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, Percent, FileText, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useBusinessSettings, useUpdateBusinessSettings } from '@/hooks/use-settings';

const currencyOptions = [
  { value: 'USD', label: 'USD — Dólar Estadounidense' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'COP', label: 'COP — Peso Colombiano' },
  { value: 'PEN', label: 'PEN — Sol Peruano' },
];

const businessSchema = z.object({
  currency: z.string().min(1, 'Selecciona una moneda'),
  taxRate: z
    .number({ error: 'Ingresa un porcentaje válido' })
    .min(0, 'El impuesto no puede ser negativo')
    .max(100, 'El impuesto no puede superar 100%'),
  defaultPaymentTerms: z.string().max(200).optional().or(z.literal('')),
  workingHours: z.string().max(200).optional().or(z.literal('')),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export function BusinessSettingsForm() {
  const { data: settings, isLoading } = useBusinessSettings();
  const updateBusiness = useUpdateBusinessSettings();
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      currency: 'USD',
      taxRate: 12,
      defaultPaymentTerms: '',
      workingHours: '',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        currency: settings.currency ?? 'USD',
        taxRate: settings.taxRate ?? 12,
        defaultPaymentTerms: settings.defaultPaymentTerms ?? '',
        workingHours: settings.workingHours ?? '',
      });
    }
  }, [settings, reset]);

  async function onSubmit(data: BusinessFormData) {
    await updateBusiness.mutateAsync({
      currency: data.currency,
      taxRate: data.taxRate,
      defaultPaymentTerms: data.defaultPaymentTerms || undefined,
      workingHours: data.workingHours || undefined,
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
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f97316]/10">
          <DollarSign className="h-4 w-4 text-[#f97316]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Configuración de Negocio
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Parámetros financieros y operativos del taller
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Currency */}
        <div className="space-y-1.5">
          <Label className="text-xs">Moneda</Label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCurrencyOpen((v) => !v)}
              className={cn(
                'flex w-full items-center justify-between h-10 rounded-xl border border-input bg-transparent px-3 text-sm transition-colors hover:border-ring',
              )}
            >
              {currencyOptions.find((c) => c.value === watch('currency'))?.label ??
                'Seleccionar moneda'}
            </button>
            {currencyOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg p-1">
                {currencyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setValue('currency', opt.value, { shouldValidate: true });
                      setCurrencyOpen(false);
                    }}
                    className={cn(
                      'flex w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-bg-secondary)]',
                      watch('currency') === opt.value && 'bg-[var(--color-bg-secondary)]',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.currency && (
            <p className="text-xs text-[var(--color-error)]">{errors.currency.message}</p>
          )}
        </div>

        {/* Tax Rate */}
        <div className="space-y-1.5">
          <Label className="text-xs">Tasa de Impuesto (%)</Label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="12"
              className="h-10 pl-10 rounded-xl"
              {...register('taxRate', { valueAsNumber: true })}
            />
          </div>
          {errors.taxRate && (
            <p className="text-xs text-[var(--color-error)]">{errors.taxRate.message}</p>
          )}
        </div>

        {/* Payment Terms */}
        <div className="space-y-1.5">
          <Label className="text-xs">
            Términos de Pago{' '}
            <span className="text-[var(--color-text-secondary)] font-normal">(opcional)</span>
          </Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              placeholder="Pago inmediato al entregar el vehículo"
              className="h-10 pl-10 rounded-xl"
              {...register('defaultPaymentTerms')}
            />
          </div>
          {errors.defaultPaymentTerms && (
            <p className="text-xs text-[var(--color-error)]">{errors.defaultPaymentTerms.message}</p>
          )}
        </div>

        {/* Working Hours */}
        <div className="space-y-1.5">
          <Label className="text-xs">
            Horario de Atención{' '}
            <span className="text-[var(--color-text-secondary)] font-normal">(opcional)</span>
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              placeholder="Lunes a Viernes 08:00 - 18:00"
              className="h-10 pl-10 rounded-xl"
              {...register('workingHours')}
            />
          </div>
          {errors.workingHours && (
            <p className="text-xs text-[var(--color-error)]">{errors.workingHours.message}</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="rounded-xl bg-[#f97316] text-white hover:bg-[#ea6c0a]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </span>
            ) : (
              'Guardar configuración'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
