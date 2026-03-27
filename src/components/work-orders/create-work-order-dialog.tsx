'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, FileText, Gauge, Car, Wrench } from 'lucide-react';

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
import { ClientCombobox } from '@/components/shared/client-combobox';
import {
  createWorkOrderSchema,
  type CreateWorkOrderFormData,
} from '@/lib/validations/work-order';
import { useCreateWorkOrder } from '@/hooks/use-work-orders';
import { vehiclesApi } from '@/lib/api/vehicles';
import { usersApi } from '@/lib/api/users';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/types/vehicle.types';
import type { WorkshopUser } from '@/types/user.types';

const priorityOptions = [
  { value: 'baja', label: 'Baja', dot: 'bg-gray-400' },
  { value: 'normal', label: 'Normal', dot: 'bg-blue-400' },
  { value: 'alta', label: 'Alta', dot: 'bg-orange-400' },
  { value: 'urgente', label: 'Urgente', dot: 'bg-red-500' },
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
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedMechanicId, setSelectedMechanicId] = useState('');
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const [mechanicDropdownOpen, setMechanicDropdownOpen] = useState(false);

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
    },
  });

  const { data: clientVehicles } = useQuery({
    queryKey: ['vehicles', 'by-client', selectedClientId],
    queryFn: async () => {
      const response = await vehiclesApi.getByClient(selectedClientId);
      return response.data;
    },
    enabled: !!selectedClientId,
  });

  const { data: usersPage } = useQuery({
    queryKey: ['users', 1, 200],
    queryFn: async () => {
      const response = await usersApi.list({ limit: 200 });
      return response.data;
    },
  });

  const mechanics = usersPage?.items.filter(
    (u) =>
      u.isActive &&
      (u.roleSlug === 'mecanico' || u.roleSlug === 'jefe_taller'),
  );

  const selectedVehicle = clientVehicles?.find(
    (v) => v.id === selectedVehicleId,
  );
  const selectedMechanic = mechanics?.find(
    (m) => m.id === selectedMechanicId,
  );
  const selectedPriority = priorityOptions.find(
    (p) => p.value === watch('priority'),
  );

  useEffect(() => {
    setValue('vehicleId', '');
    setSelectedVehicleId('');
  }, [selectedClientId, setValue]);

  useEffect(() => {
    if (open) {
      reset({
        clientId: '',
        vehicleId: '',
        description: '',
        priority: 'normal',
        mileageIn: undefined,
        assignedTo: '',
      });
      setSelectedClientId('');
      setSelectedVehicleId('');
      setSelectedMechanicId('');
    }
  }, [open, reset]);

  function handleClientChange(clientId: string) {
    setSelectedClientId(clientId);
    setValue('clientId', clientId, { shouldValidate: true });
  }

  function handleVehicleSelect(vehicle: Vehicle) {
    setSelectedVehicleId(vehicle.id);
    setValue('vehicleId', vehicle.id, { shouldValidate: true });
    setVehicleDropdownOpen(false);
  }

  function handleMechanicSelect(mechanic: WorkshopUser) {
    setSelectedMechanicId(mechanic.id);
    setValue('assignedTo', mechanic.id);
    setMechanicDropdownOpen(false);
  }

  async function onSubmit(data: CreateWorkOrderFormData) {
    const payload = {
      clientId: data.clientId,
      vehicleId: data.vehicleId,
      description: data.description,
      priority: data.priority,
      mileageIn: data.mileageIn || undefined,
      assignedTo: data.assignedTo || undefined,
    };

    await createWorkOrder.mutateAsync(payload);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden">
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

          {/* Vehicle — custom dropdown */}
          <div className="space-y-1.5">
            <Label className="text-xs">Vehículo</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  selectedClientId && setVehicleDropdownOpen(!vehicleDropdownOpen)
                }
                disabled={!selectedClientId}
                className={cn(
                  'flex w-full items-center justify-between h-10 rounded-xl border border-input bg-transparent px-3 text-sm transition-colors',
                  'hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                  !selectedClientId && 'opacity-50 cursor-not-allowed',
                  !selectedVehicle && 'text-muted-foreground',
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  <Car className="h-4 w-4 text-[var(--color-text-secondary)] shrink-0" />
                  {selectedVehicle
                    ? `${selectedVehicle.plate} — ${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.year})`
                    : selectedClientId
                      ? 'Seleccionar vehículo...'
                      : 'Primero selecciona un cliente'}
                </span>
              </button>
              {vehicleDropdownOpen && clientVehicles && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg p-1 max-h-48 overflow-y-auto">
                  {clientVehicles.length > 0 ? (
                    clientVehicles.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleVehicleSelect(v)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--color-bg-secondary)]',
                          selectedVehicleId === v.id &&
                            'bg-[var(--color-bg-secondary)]',
                        )}
                      >
                        <span className="font-mono font-bold">{v.plate}</span>
                        <span className="text-[var(--color-text-secondary)]">
                          {v.brand} {v.model} ({v.year})
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="py-3 text-center text-sm text-[var(--color-text-secondary)]">
                      Este cliente no tiene vehículos
                    </p>
                  )}
                </div>
              )}
            </div>
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
                placeholder="Ej: Revisión de frenos, cambio de pastillas delanteras..."
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

          {/* Priority */}
          <div className="space-y-1.5">
            <Label className="text-xs">Prioridad</Label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setValue(
                      'priority',
                      opt.value as CreateWorkOrderFormData['priority'],
                    )
                  }
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors',
                    watch('priority') === opt.value
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]',
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full', opt.dot)} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mileage */}
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

          {/* Assign mechanic — custom dropdown */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Asignar mecánico{' '}
              <span className="text-[var(--color-text-secondary)] font-normal">
                (opcional)
              </span>
            </Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMechanicDropdownOpen(!mechanicDropdownOpen)}
                className={cn(
                  'flex w-full items-center justify-between h-10 rounded-xl border border-input bg-transparent px-3 text-sm transition-colors',
                  'hover:border-ring',
                  !selectedMechanic && 'text-muted-foreground',
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  <Wrench className="h-4 w-4 text-[var(--color-text-secondary)] shrink-0" />
                  {selectedMechanic
                    ? selectedMechanic.name
                    : 'Sin asignar'}
                </span>
              </button>
              {mechanicDropdownOpen && mechanics && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg p-1 max-h-48 overflow-y-auto">
                  {mechanics.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleMechanicSelect(m)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--color-bg-secondary)]',
                        selectedMechanicId === m.id &&
                          'bg-[var(--color-bg-secondary)]',
                      )}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-[9px] font-bold text-white uppercase">
                        {m.name.charAt(0)}
                      </div>
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
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
