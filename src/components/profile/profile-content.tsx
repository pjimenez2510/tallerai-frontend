'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Phone,
  Mail,
  Shield,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { useUpdateProfile, useChangePassword } from '@/hooks/use-auth';

const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
      .max(100),
    confirmPassword: z.string().min(1, 'Confirma la nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function ProfileContent() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onProfileSubmit(data: ProfileFormData) {
    await updateProfile.mutateAsync({
      name: data.name,
      phone: data.phone || undefined,
    });
  }

  async function onPasswordSubmit(data: PasswordFormData) {
    await changePassword.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    passwordForm.reset();
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Mi Perfil
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Administra tu información personal y seguridad
        </p>
      </div>

      {/* User Info Card */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-2xl font-bold text-white uppercase">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {user.name}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {user.email}
            </p>
            <Badge
              className="mt-1 text-[10px] font-medium bg-slate-100 text-slate-700"
            >
              <Shield className="h-3 w-3 mr-1" />
              {user.roleName ?? user.roleSlug ?? 'Usuario'}
            </Badge>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] pt-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
            Editar información
          </h3>
          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="space-y-4"
          >
            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  value={user.email}
                  readOnly
                  className="h-10 pl-10 rounded-xl bg-[var(--color-bg-secondary)] cursor-not-allowed opacity-60"
                />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                El email no puede modificarse
              </p>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="Tu nombre completo"
                  className="h-10 pl-10 rounded-xl"
                  {...profileForm.register('name')}
                />
              </div>
              {profileForm.formState.errors.name && (
                <p className="text-xs text-[var(--color-error)]">
                  {profileForm.formState.errors.name.message}
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
                  {...profileForm.register('phone')}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                className="rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
                disabled={profileForm.formState.isSubmitting}
              >
                {profileForm.formState.isSubmitting ? (
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
      </div>

      {/* Change Password Card */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f97316]/10">
            <Lock className="h-4 w-4 text-[#f97316]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Cambiar contraseña
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Usa una contraseña segura de al menos 8 caracteres
            </p>
          </div>
        </div>

        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="space-y-4"
        >
          {/* Current Password */}
          <div className="space-y-1.5">
            <Label className="text-xs">Contraseña actual</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                type={showCurrent ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-10 pl-10 pr-10 rounded-xl"
                {...passwordForm.register('currentPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-xs text-[var(--color-error)]">
                {passwordForm.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label className="text-xs">Nueva contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                type={showNew ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-10 pl-10 pr-10 rounded-xl"
                {...passwordForm.register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordForm.formState.errors.newPassword && (
              <p className="text-xs text-[var(--color-error)]">
                {passwordForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label className="text-xs">Confirmar nueva contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-10 pl-10 pr-10 rounded-xl"
                {...passwordForm.register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-xs text-[var(--color-error)]">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="rounded-xl bg-[#f97316] text-white hover:bg-[#ea6c0a]"
              disabled={passwordForm.formState.isSubmitting}
            >
              {passwordForm.formState.isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Cambiando...
                </span>
              ) : (
                'Cambiar contraseña'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
