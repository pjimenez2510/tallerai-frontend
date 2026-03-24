'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import {
  User,
  FileText,
  Mail,
  Phone,
  MapPin,
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
import { clientSchema, type ClientFormData } from '@/lib/validations/client';
import { useCreateClient, useUpdateClient } from '@/hooks/use-clients';
import type { Client } from '@/types/client.types';

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

const documentTypeOptions = [
  { value: 'cedula', label: 'Cédula' },
  { value: 'ruc', label: 'RUC' },
  { value: 'pasaporte', label: 'Pasaporte' },
];

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
}: ClientFormDialogProps) {
  const isEditing = !!client;
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      documentType: 'cedula',
      documentNumber: '',
      name: '',
      email: '',
      phone: '',
      phoneSecondary: '',
      address: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (client) {
      reset({
        documentType: client.documentType,
        documentNumber: client.documentNumber,
        name: client.name,
        email: client.email ?? '',
        phone: client.phone ?? '',
        phoneSecondary: client.phoneSecondary ?? '',
        address: client.address ?? '',
        notes: client.notes ?? '',
      });
    } else {
      reset({
        documentType: 'cedula',
        documentNumber: '',
        name: '',
        email: '',
        phone: '',
        phoneSecondary: '',
        address: '',
        notes: '',
      });
    }
  }, [client, reset]);

  async function onSubmit(data: ClientFormData) {
    const payload = {
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
      phoneSecondary: data.phoneSecondary || undefined,
      address: data.address || undefined,
      notes: data.notes || undefined,
    };

    if (isEditing) {
      await updateClient.mutateAsync({ id: client.id, data: payload });
    } else {
      await createClient.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del cliente'
              : 'Ingresa los datos del nuevo cliente del taller'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Document type + number row */}
          <div className="grid grid-cols-[140px_1fr] gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo doc.</Label>
              <select
                className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register('documentType')}
              >
                {documentTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Número</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="0912345678"
                  className="h-10 pl-10 rounded-xl"
                  {...register('documentNumber')}
                />
              </div>
              {errors.documentNumber && (
                <p className="text-xs text-[var(--color-error)]">
                  {errors.documentNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs">Nombre completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                placeholder="Carlos Mendoza"
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

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Email{' '}
              <span className="text-[var(--color-text-secondary)] font-normal">
                (opcional)
              </span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                type="email"
                placeholder="carlos@email.com"
                className="h-10 pl-10 rounded-xl"
                {...register('email')}
              />
            </div>
          </div>

          {/* Phones */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="0998765432"
                  className="h-10 pl-10 rounded-xl"
                  {...register('phone')}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tel. secundario</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="0987654321"
                  className="h-10 pl-10 rounded-xl"
                  {...register('phoneSecondary')}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label className="text-xs">Dirección</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                placeholder="Av. Principal 123, Guayaquil"
                className="h-10 pl-10 rounded-xl"
                {...register('address')}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Notas</Label>
            <div className="relative">
              <StickyNote className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Textarea
                placeholder="Observaciones sobre el cliente..."
                className="min-h-[70px] pl-10 rounded-xl resize-none"
                {...register('notes')}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
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
                'Crear Cliente'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
