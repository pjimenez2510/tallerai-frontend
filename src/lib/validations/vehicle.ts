import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const vehicleSchema = z.object({
  clientId: z.string().min(1, 'Selecciona un cliente'),
  plate: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(10, 'Máximo 10 caracteres'),
  brand: z
    .string()
    .min(1, 'La marca es requerida')
    .max(100),
  model: z
    .string()
    .min(1, 'El modelo es requerido')
    .max(100),
  year: z
    .number()
    .int()
    .min(1900, 'Año inválido')
    .max(currentYear + 2, 'Año inválido'),
  color: z.string().max(50).optional().or(z.literal('')),
  vin: z.string().max(17).optional().or(z.literal('')),
  engine: z.string().max(100).optional().or(z.literal('')),
  transmission: z.string().max(50).optional().or(z.literal('')),
  fuelType: z.string().max(30).optional().or(z.literal('')),
  mileage: z.number().int().min(0).optional(),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
