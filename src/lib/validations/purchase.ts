import { z } from 'zod';

export const createPurchaseSchema = z.object({
  supplier: z.string().min(1, 'El proveedor es requerido').max(200),
  notes: z.string().max(1000).optional(),
});

export type CreatePurchaseFormData = z.infer<typeof createPurchaseSchema>;
