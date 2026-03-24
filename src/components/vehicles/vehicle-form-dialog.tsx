'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import {
  Car,
  Hash,
  Palette,
  Gauge,
  Fuel,
  Settings,
  StickyNote,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { vehicleSchema, type VehicleFormData } from '@/lib/validations/vehicle';
import { useCreateVehicle, useUpdateVehicle } from '@/hooks/use-vehicles';
import { ClientCombobox } from '@/components/shared/client-combobox';
import type { Vehicle } from '@/types/vehicle.types';

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle | null;
}

export function VehicleFormDialog({
  open,
  onOpenChange,
  vehicle,
}: VehicleFormDialogProps) {
  const isEditing = !!vehicle;
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      clientId: '',
      plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      vin: '',
      engine: '',
      transmission: '',
      fuelType: '',
      mileage: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (vehicle) {
      reset({
        clientId: vehicle.clientId,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color ?? '',
        vin: vehicle.vin ?? '',
        engine: vehicle.engine ?? '',
        transmission: vehicle.transmission ?? '',
        fuelType: vehicle.fuelType ?? '',
        mileage: vehicle.mileage,
        notes: vehicle.notes ?? '',
      });
    } else {
      reset({
        clientId: '',
        plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        vin: '',
        engine: '',
        transmission: '',
        fuelType: '',
        mileage: 0,
        notes: '',
      });
    }
  }, [vehicle, reset]);

  async function onSubmit(data: VehicleFormData) {
    const payload = {
      ...data,
      color: data.color || undefined,
      vin: data.vin || undefined,
      engine: data.engine || undefined,
      transmission: data.transmission || undefined,
      fuelType: data.fuelType || undefined,
      notes: data.notes || undefined,
    };

    if (isEditing) {
      await updateVehicle.mutateAsync({ id: vehicle.id, data: payload });
    } else {
      await createVehicle.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isEditing ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del vehículo'
              : 'Registra un nuevo vehículo del taller'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Client selector */}
          <div className="space-y-1.5">
            <Label className="text-xs">Propietario</Label>
            <ClientCombobox
              value={watch('clientId')}
              onChange={(val) => setValue('clientId', val, { shouldValidate: true })}
              error={errors.clientId?.message}
            />
          </div>

          {/* Plate + Year */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Placa</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="GYE-1234"
                  className="h-10 pl-10 rounded-xl uppercase"
                  {...register('plate')}
                />
              </div>
              {errors.plate && (
                <p className="text-xs text-[var(--color-error)]">
                  {errors.plate.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Año</Label>
              <Input
                type="number"
                placeholder="2024"
                className="h-10 rounded-xl"
                {...register('year', { valueAsNumber: true })}
              />
              {errors.year && (
                <p className="text-xs text-[var(--color-error)]">
                  {errors.year.message}
                </p>
              )}
            </div>
          </div>

          {/* Brand + Model */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Marca</Label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="Toyota"
                  className="h-10 pl-10 rounded-xl"
                  {...register('brand')}
                />
              </div>
              {errors.brand && (
                <p className="text-xs text-[var(--color-error)]">
                  {errors.brand.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Modelo</Label>
              <Input
                placeholder="Hilux"
                className="h-10 rounded-xl"
                {...register('model')}
              />
              {errors.model && (
                <p className="text-xs text-[var(--color-error)]">
                  {errors.model.message}
                </p>
              )}
            </div>
          </div>

          {/* Color + Mileage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Color</Label>
              <div className="relative">
                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="Blanco"
                  className="h-10 pl-10 rounded-xl"
                  {...register('color')}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Kilometraje</Label>
              <div className="relative">
                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  type="number"
                  placeholder="45000"
                  className="h-10 pl-10 rounded-xl"
                  {...register('mileage', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Engine + Fuel + Transmission */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Motor</Label>
              <div className="relative">
                <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="2.4L"
                  className="h-10 pl-10 rounded-xl"
                  {...register('engine')}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Combustible</Label>
              <div className="relative">
                <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="Diesel"
                  className="h-10 pl-10 rounded-xl"
                  {...register('fuelType')}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Transmisión</Label>
              <Input
                placeholder="Manual"
                className="h-10 rounded-xl"
                {...register('transmission')}
              />
            </div>
          </div>

          {/* VIN */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              VIN{' '}
              <span className="text-[var(--color-text-secondary)] font-normal">
                (opcional)
              </span>
            </Label>
            <Input
              placeholder="1HGBH41JXMN109186"
              maxLength={17}
              className="h-10 rounded-xl font-mono"
              {...register('vin')}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Notas</Label>
            <div className="relative">
              <StickyNote className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Textarea
                placeholder="Observaciones del vehículo..."
                className="min-h-[70px] pl-10 rounded-xl resize-none"
                {...register('notes')}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 bg-transparent border-t-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
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
              ) : isEditing ? (
                'Guardar Cambios'
              ) : (
                'Registrar Vehículo'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
