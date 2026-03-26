'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { User, Mail, Lock, Phone, Eye, EyeOff, Shield, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
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
import { useRoles } from '@/hooks/use-roles';
import type { WorkshopUser } from '@/types/user.types';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: WorkshopUser | null;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: UserFormDialogProps) {
  const isEditing = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const { data: roles, isLoading: loadingRoles } = useRoles();
  const [showPassword, setShowPassword] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

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
      roleId: '',
      phone: '',
    },
  });

  const selectedRoleId = watch('roleId');
  const selectedRole = roles?.find((r) => r.id === selectedRoleId);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        roleId: user.roleId ?? '',
        phone: user.phone ?? '',
      });
    } else {
      reset({
        name: '',
        email: '',
        password: '',
        roleId: '',
        phone: '',
      });
    }
    setShowPassword(false);
    setRoleDropdownOpen(false);
  }, [user, reset, open]);

  async function onSubmit(data: CreateUserFormData | UpdateUserFormData) {
    const payload = {
      name: data.name,
      email: data.email,
      roleId: data.roleId,
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
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                disabled={loadingRoles}
                className={cn(
                  'flex w-full items-center justify-between h-10 rounded-xl border border-input bg-transparent px-3 text-sm transition-colors hover:border-ring',
                  !selectedRoleId && 'text-muted-foreground',
                )}
              >
                <span className="flex items-center gap-2">
                  {selectedRole ? (
                    <>
                      <Shield className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                      {selectedRole.name}
                    </>
                  ) : loadingRoles ? (
                    'Cargando roles...'
                  ) : (
                    'Seleccionar rol'
                  )}
                </span>
                <ChevronDown className="h-4 w-4 text-[var(--color-text-secondary)]" />
              </button>
              {roleDropdownOpen && roles && roles.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg p-1 max-h-60 overflow-y-auto">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setValue('roleId', r.id, { shouldValidate: true });
                        setRoleDropdownOpen(false);
                      }}
                      className={cn(
                        'flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-bg-secondary)]',
                        selectedRoleId === r.id && 'bg-[var(--color-bg-secondary)]',
                      )}
                    >
                      <span className="text-sm font-medium">{r.name}</span>
                      {r.description && (
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          {r.description}
                        </span>
                      )}
                      <span className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {r.permissions.length} permiso{r.permissions.length !== 1 ? 's' : ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.roleId && (
              <p className="text-xs text-[var(--color-error)]">
                {errors.roleId.message}
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
