'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  UserPlus,
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import { ApiError } from '@/types/api.types';

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
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-8 shadow-lg shadow-black/5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Registra tu taller
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Crea una cuenta y empieza a digitalizar tu negocio
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tenant section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <Building2 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Datos del taller
            </span>
          </div>

          <div className="space-y-3 pl-1">
            <div className="space-y-1.5">
              <Label htmlFor="tenantName" className="text-sm">
                Nombre del taller
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  id="tenantName"
                  placeholder="Taller Carrillo & Hijos"
                  className="h-10 pl-10 rounded-xl"
                  {...register('tenantName')}
                />
              </div>
              {errors.tenantName && (
                <p className="text-xs text-[var(--color-error)]">
                  {errors.tenantName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tenantRuc" className="text-sm">
                RUC
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  id="tenantRuc"
                  placeholder="0992345678001"
                  maxLength={13}
                  className="h-10 pl-10 rounded-xl"
                  {...register('tenantRuc')}
                />
              </div>
              {errors.tenantRuc && (
                <p className="text-xs text-[var(--color-error)]">
                  {errors.tenantRuc.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Admin section */}
        <div className="space-y-4 border-t border-[var(--color-border)] pt-5">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <User className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Cuenta del administrador
            </span>
          </div>

          <div className="space-y-3 pl-1">
            <div className="space-y-1.5">
              <Label htmlFor="adminName" className="text-sm">
                Nombre completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  id="adminName"
                  placeholder="Carlos Carrillo"
                  className="h-10 pl-10 rounded-xl"
                  {...register('adminName')}
                />
              </div>
              {errors.adminName && (
                <p className="text-xs text-[var(--color-error)]">
                  {errors.adminName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adminEmail" className="text-sm">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="carlos@tallercarrillo.com"
                  autoComplete="email"
                  className="h-10 pl-10 rounded-xl"
                  {...register('adminEmail')}
                />
              </div>
              {errors.adminEmail && (
                <p className="text-xs text-[var(--color-error)]">
                  {errors.adminEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adminPassword" className="text-sm">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className="h-10 pl-10 pr-10 rounded-xl"
                  {...register('adminPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.adminPassword && (
                <p className="text-xs text-[var(--color-error)]">
                  {errors.adminPassword.message}
                </p>
              )}
              <p className="text-xs text-[var(--color-text-secondary)]">
                Debe contener mayúscula, minúscula y número
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adminPhone" className="text-sm">
                Teléfono{' '}
                <span className="text-[var(--color-text-secondary)] font-normal">
                  (opcional)
                </span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  id="adminPhone"
                  placeholder="0998765432"
                  className="h-10 pl-10 rounded-xl"
                  {...register('adminPhone')}
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-11 rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a] font-semibold text-sm shadow-md shadow-[#1e3a5f]/25 transition-all hover:shadow-lg hover:shadow-[#1e3a5f]/30"
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

      <div className="mt-6 pt-5 border-t border-[var(--color-border)]">
        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#f97316] hover:text-[#ea580c] transition-colors"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
