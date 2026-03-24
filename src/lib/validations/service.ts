import { z } from 'zod';

export const serviceSchema = z.object({
  code: z.string().min(1, 'El código es requerido').max(50),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  price: z.number().min(0, 'El precio no puede ser negativo'),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
