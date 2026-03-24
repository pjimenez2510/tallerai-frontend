import { z } from 'zod';

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0'),
  unitCost: z.number().min(0.01, 'El costo debe ser mayor a 0'),
});

export const createPurchaseSchema = z.object({
  supplier: z.string().min(1, 'El proveedor es requerido').max(200),
  notes: z.string().max(1000).optional(),
  items: z.array(purchaseItemSchema).min(1, 'Agrega al menos un ítem'),
});

export type CreatePurchaseFormData = z.infer<typeof createPurchaseSchema>;
export type PurchaseItemFormData = z.infer<typeof purchaseItemSchema>;
