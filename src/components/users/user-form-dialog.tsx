'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
} from '@/lib/validations/user';
import { useCreateUser, useUpdateUser } from '@/hooks/use-users';
import type { WorkshopUser } from '@/types/user.types';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: WorkshopUser | null;
}

const roleOptions = [
  { value: 'admin', label: 'Administrador', description: 'Acceso total al sistema' },
  { value: 'jefe_taller', label: 'Jefe de Taller', description: 'Gestión de OT, inventario y personal' },
  { value: 'recepcionista', label: 'Recepcionista', description: 'Clientes, vehículos y recepción de OT' },
  { value: 'mecanico', label: 'Mecánico', description: 'Vista de tareas asignadas' },
];

export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: UserFormDialogProps) {
  const isEditing = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'mecanico',
      phone: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        phone: user.phone ?? '',
      });
    } else {
      reset({
        name: '',
        email: '',
        password: '',
        role: 'mecanico',
        phone: '',
      });
    }
    setShowPassword(false);
  }, [user, reset]);

  async function onSubmit(data: CreateUserFormData | UpdateUserFormData) {
    const payload = {
      ...data,
      phone: data.phone || undefined,
      password: data.password || undefined,
    };

    if (isEditing) {
      await updateUser.mutateAsync({ id: user.id, data: payload });
    } else {
      await createUser.mutateAsync(payload as CreateUserFormData);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del usuario. Deja la contraseña vacía para no cambiarla.'
              : 'Crea un nuevo usuario para el taller'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs">Nombre completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                placeholder="Juan Pérez"
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
            <Label className="text-xs">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                type="email"
                placeholder="juan@taller.com"
                className="h-10 pl-10 rounded-xl"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-[var(--color-error)]">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Contraseña{' '}
              {isEditing && (
                <span className="text-[var(--color-text-secondary)] font-normal">
                  (dejar vacía para no cambiar)
                </span>
              )}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={isEditing ? '••••••••' : 'Mínimo 8 caracteres'}
                className="h-10 pl-10 pr-10 rounded-xl"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[var(--color-error)]">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-xs">Rol</Label>
            <Select
              value={watch('role')}
              onValueChange={(val) =>
                setValue(
                  'role',
                  val as CreateUserFormData['role'],
                  { shouldValidate: true },
                )
              }
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div>
                      <span className="font-medium">{opt.label}</span>
                      <span className="ml-2 text-xs text-[var(--color-text-secondary)]">
                        — {opt.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-[var(--color-error)]">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Teléfono{' '}
              <span className="text-[var(--color-text-secondary)] font-normal">
                (opcional)
              </span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                placeholder="0998765432"
                className="h-10 pl-10 rounded-xl"
                {...register('phone')}
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
                'Crear Usuario'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
