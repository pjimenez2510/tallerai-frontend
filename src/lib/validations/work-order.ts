import { z } from 'zod';

export const createWorkOrderSchema = z.object({
  clientId: z.string().min(1, 'Selecciona un cliente'),
  vehicleId: z.string().min(1, 'Selecciona un vehículo'),
  description: z
    .string()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(5000),
  priority: z
    .enum(['baja', 'normal', 'alta', 'urgente'])
    .optional(),
  mileageIn: z.number().int().min(0).optional(),
  assignedTo: z.string().optional().or(z.literal('')),
  estimatedDate: z.string().optional().or(z.literal('')),
});

export type CreateWorkOrderFormData = z.infer<typeof createWorkOrderSchema>;
