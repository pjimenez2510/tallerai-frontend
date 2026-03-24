'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiError } from '@/types/api.types';

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      const response = await authApi.login(data);
      setAuth(response.data);
      toast.success(response.message);
      router.refresh();
      router.push('/');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Error al iniciar sesión');
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-8 shadow-lg shadow-black/5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Bienvenido de vuelta
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Ingresa tus credenciales para acceder al sistema
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Correo electrónico
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              className="h-11 pl-10 rounded-xl"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-[var(--color-error)] mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-11 pl-10 pr-10 rounded-xl"
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
            <p className="text-xs text-[var(--color-error)] mt-1">
              {errors.password.message}
            </p>
          )}
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
              Ingresando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LogIn size={18} />
              Iniciar Sesión
            </span>
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          ¿No tienes cuenta?{' '}
          <Link
            href="/register"
            className="font-semibold text-[#f97316] hover:text-[#ea580c] transition-colors"
          >
            Registra tu taller
          </Link>
        </p>
      </div>
    </div>
  );
}
