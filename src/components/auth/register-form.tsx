'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiError } from '@/types/api.types';

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      const payload = {
        ...data,
        adminPhone: data.adminPhone || undefined,
      };
      const response = await authApi.register(payload);
      setAuth(response.data);
      toast.success(response.message);
      router.refresh();
      router.push('/');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Error al registrar');
    }
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
        Registra tu Taller
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Crea una cuenta para tu taller mecánico
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {/* Tenant info */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
            Datos del taller
          </p>

          <div className="space-y-2">
            <Label htmlFor="tenantName">Nombre del taller</Label>
            <Input
              id="tenantName"
              placeholder="Taller Carrillo & Hijos"
              {...register('tenantName')}
            />
            {errors.tenantName && (
              <p className="text-sm text-[var(--color-error)]">
                {errors.tenantName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantRuc">RUC</Label>
            <Input
              id="tenantRuc"
              placeholder="0992345678001"
              maxLength={13}
              {...register('tenantRuc')}
            />
            {errors.tenantRuc && (
              <p className="text-sm text-[var(--color-error)]">
                {errors.tenantRuc.message}
              </p>
            )}
          </div>
        </div>

        {/* Admin info */}
        <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
            Datos del administrador
          </p>

          <div className="space-y-2">
            <Label htmlFor="adminName">Nombre completo</Label>
            <Input
              id="adminName"
              placeholder="Carlos Carrillo"
              {...register('adminName')}
            />
            {errors.adminName && (
              <p className="text-sm text-[var(--color-error)]">
                {errors.adminName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmail">Email</Label>
            <Input
              id="adminEmail"
              type="email"
              placeholder="carlos@tallercarrillo.com"
              autoComplete="email"
              {...register('adminEmail')}
            />
            {errors.adminEmail && (
              <p className="text-sm text-[var(--color-error)]">
                {errors.adminEmail.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPassword">Contraseña</Label>
            <div className="relative">
              <Input
                id="adminPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                {...register('adminPassword')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.adminPassword && (
              <p className="text-sm text-[var(--color-error)]">
                {errors.adminPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPhone">Teléfono (opcional)</Label>
            <Input
              id="adminPhone"
              placeholder="0998765432"
              {...register('adminPhone')}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Registrando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <UserPlus size={18} />
              Crear Cuenta
            </span>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login"
          className="font-medium text-[var(--color-secondary)] hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
