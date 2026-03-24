import { z } from 'zod';

export const clientSchema = z.object({
  documentType: z.enum(['cedula', 'ruc', 'pasaporte'], {
    message: 'Selecciona un tipo de documento',
  }),
  documentNumber: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(20, 'Máximo 20 caracteres'),
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200),
  email: z
    .string()
    .email('Email inválido')
    .max(200)
    .optional()
    .or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  phoneSecondary: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export type ClientFormData = z.infer<typeof clientSchema>;
