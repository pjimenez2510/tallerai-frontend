'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import {
  Hash,
  Wrench,
  DollarSign,
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
import {
  serviceSchema,
  type ServiceFormData,
} from '@/lib/validations/service';
import { useCreateService, useUpdateService } from '@/hooks/use-services';
import type { Service } from '@/types/service.types';

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
}: ServiceFormDialogProps) {
  const isEditing = !!service;
  const createService = useCreateService();
  const updateService = useUpdateService();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      price: 0,
    },
  });

  useEffect(() => {
    if (service) {
      reset({
        code: service.code,
        name: service.name,
        description: service.description ?? '',
        price: service.price,
      });
    } else {
      reset({
        code: '',
        name: '',
        description: '',
        price: 0,
      });
    }
  }, [service, reset]);

  async function onSubmit(data: ServiceFormData) {
    const payload = {
      ...data,
      description: data.description || undefined,
    };

    if (isEditing) {
      await updateService.mutateAsync({ id: service.id, data: payload });
    } else {
      await createService.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del servicio'
              : 'Registra un nuevo servicio del taller'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Code */}
          <div className="space-y-1.5">
            <Label className="text-xs">Código</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                placeholder="SRV-001"
                className="h-10 pl-10 rounded-xl uppercase"
                {...register('code')}
              />
            </div>
            {errors.code && (
              <p className="text-xs text-[var(--color-error)]">
                {errors.code.message}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs">Nombre del servicio</Label>
            <div className="relative">
              <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                placeholder="Cambio de aceite"
                className="h-10 pl-10 rounded-xl"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-[var(--color-error)]">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label className="text-xs">Precio</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#10b981]" />
              <Input
                type="number"
                step="0.01"
                placeholder="25.00"
                className="h-10 pl-10 rounded-xl"
                {...register('price', { valueAsNumber: true })}
              />
            </div>
            {errors.price && (
              <p className="text-xs text-[var(--color-error)]">
                {errors.price.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Descripción{' '}
              <span className="text-[var(--color-text-secondary)] font-normal">
                (opcional)
              </span>
            </Label>
            <div className="relative">
              <StickyNote className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Textarea
                placeholder="Detalles del servicio..."
                className="min-h-[80px] pl-10 rounded-xl resize-none"
                {...register('description')}
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
                'Crear Servicio'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
