import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  tenantName: z
    .string()
    .min(2, 'El nombre del taller debe tener al menos 2 caracteres')
    .max(200),
  tenantRuc: z
    .string()
    .regex(/^\d{13}$/, 'El RUC debe tener exactamente 13 dígitos'),
  adminName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200),
  adminEmail: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),
  adminPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      'Debe contener mayúscula, minúscula y número',
    ),
  adminPhone: z.string().max(20).optional().or(z.literal('')),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
