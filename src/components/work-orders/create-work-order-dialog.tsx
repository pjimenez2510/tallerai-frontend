'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, FileText, Gauge, Users, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ClientCombobox } from '@/components/shared/client-combobox';
import {
  createWorkOrderSchema,
  type CreateWorkOrderFormData,
} from '@/lib/validations/work-order';
import { useCreateWorkOrder } from '@/hooks/use-work-orders';
import { vehiclesApi } from '@/lib/api/vehicles';
import { usersApi } from '@/lib/api/users';
import type { Vehicle } from '@/types/vehicle.types';

const priorityOptions = [
  { value: 'baja', label: 'Baja', color: 'text-gray-500' },
  { value: 'normal', label: 'Normal', color: 'text-blue-500' },
  { value: 'alta', label: 'Alta', color: 'text-orange-500' },
  { value: 'urgente', label: 'Urgente', color: 'text-red-500' },
];

interface CreateWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkOrderDialog({
  open,
  onOpenChange,
}: CreateWorkOrderDialogProps) {
  const createWorkOrder = useCreateWorkOrder();
  const [selectedClientId, setSelectedClientId] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkOrderFormData>({
    resolver: zodResolver(createWorkOrderSchema),
    defaultValues: {
      clientId: '',
      vehicleId: '',
      description: '',
      priority: 'normal',
      mileageIn: undefined,
      assignedTo: '',
      estimatedDate: '',
    },
  });

  // Fetch vehicles for selected client
  const { data: clientVehicles } = useQuery({
    queryKey: ['vehicles', 'by-client', selectedClientId],
    queryFn: async () => {
      const response = await vehiclesApi.getByClient(selectedClientId);
      return response.data;
    },
    enabled: !!selectedClientId,
  });

  // Fetch mechanics for assignment
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await usersApi.list();
      return response.data;
    },
  });

  const mechanics = users?.filter(
    (u) =>
      (u.role === 'mecanico' || u.role === 'jefe_taller') && u.isActive,
  );

  // Reset vehicle when client changes
  useEffect(() => {
    setValue('vehicleId', '');
  }, [selectedClientId, setValue]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        clientId: '',
        vehicleId: '',
        description: '',
        priority: 'normal',
        mileageIn: undefined,
        assignedTo: '',
        estimatedDate: '',
      });
      setSelectedClientId('');
    }
  }, [open, reset]);

  function handleClientChange(clientId: string) {
    setSelectedClientId(clientId);
    setValue('clientId', clientId, { shouldValidate: true });
  }

  async function onSubmit(data: CreateWorkOrderFormData) {
    const payload = {
      ...data,
      mileageIn: data.mileageIn || undefined,
      assignedTo: data.assignedTo || undefined,
      estimatedDate: data.estimatedDate || undefined,
    };

    await createWorkOrder.mutateAsync(payload);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[var(--color-accent)]" />
            Nueva Orden de Trabajo
          </DialogTitle>
          <DialogDescription>
            Crea una OT seleccionando cliente, vehículo y describiendo el
            trabajo requerido
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Client */}
          <div className="space-y-1.5">
            <Label className="text-xs">Cliente</Label>
            <ClientCombobox
              value={watch('clientId')}
              onChange={handleClientChange}
              error={errors.clientId?.message}
            />
          </div>

          {/* Vehicle (depends on client) */}
          <div className="space-y-1.5">
            <Label className="text-xs">Vehículo</Label>
            <Select
              value={watch('vehicleId')}
              onValueChange={(val) =>
                setValue('vehicleId', val ?? '', { shouldValidate: true })
              }
              disabled={!selectedClientId}
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue
                  placeholder={
                    selectedClientId
                      ? 'Seleccionar vehículo...'
                      : 'Primero selecciona un cliente'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {clientVehicles?.map((v: Vehicle) => (
                  <SelectItem key={v.id} value={v.id}>
                    <span className="font-mono font-bold">{v.plate}</span>
                    <span className="ml-2 text-[var(--color-text-secondary)]">
                      {v.brand} {v.model} ({v.year})
                    </span>
                  </SelectItem>
                ))}
                {clientVehicles?.length === 0 && (
                  <SelectItem value="__none" disabled>
                    Este cliente no tiene vehículos
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.vehicleId && (
              <p className="text-xs text-[var(--color-error)]">
                {errors.vehicleId.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs">Descripción del trabajo</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Textarea
                placeholder="Ej: Revisión de frenos, cambio de pastillas delanteras, revisión de discos..."
                className="min-h-[100px] pl-10 rounded-xl resize-none"
                {...register('description')}
              />
            </div>
            {errors.description && (
              <p className="text-xs text-[var(--color-error)]">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Priority + Mileage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Prioridad</Label>
              <Select
                value={watch('priority') ?? 'normal'}
                onValueChange={(val) =>
                  setValue(
                    'priority',
                    val as CreateWorkOrderFormData['priority'],
                  )
                }
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className={opt.color}>●</span>{' '}
                      <span className="ml-1">{opt.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Km de ingreso</Label>
              <div className="relative">
                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  type="number"
                  placeholder="45000"
                  className="h-10 pl-10 rounded-xl"
                  {...register('mileageIn', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Estimated date */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Fecha estimada de entrega{' '}
              <span className="text-[var(--color-text-secondary)] font-normal">
                (opcional)
              </span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                type="date"
                className="h-10 pl-10 rounded-xl"
                {...register('estimatedDate')}
              />
            </div>
          </div>

          {/* Assign mechanic */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Asignar mecánico{' '}
              <span className="text-[var(--color-text-secondary)] font-normal">
                (opcional)
              </span>
            </Label>
            <Select
              value={watch('assignedTo') ?? ''}
              onValueChange={(val) => setValue('assignedTo', val ?? '')}
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                {mechanics?.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      {m.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  Creando...
                </span>
              ) : (
                'Crear Orden de Trabajo'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
