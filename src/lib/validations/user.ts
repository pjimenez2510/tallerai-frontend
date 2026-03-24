import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(200),
  email: z.string().email('Email inválido').max(200),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      'Debe contener mayúscula, minúscula y número',
    ),
  role: z.enum(['admin', 'jefe_taller', 'recepcionista', 'mecanico'], {
    message: 'Selecciona un rol',
  }),
  phone: z.string().max(20).optional().or(z.literal('')),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(200),
  email: z.string().email('Email inválido').max(200),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      'Debe contener mayúscula, minúscula y número',
    )
    .optional()
    .or(z.literal('')),
  role: z.enum(['admin', 'jefe_taller', 'recepcionista', 'mecanico'], {
    message: 'Selecciona un rol',
  }),
  phone: z.string().max(20).optional().or(z.literal('')),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
