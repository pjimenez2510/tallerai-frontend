import { z } from 'zod';

export const productSchema = z.object({
  code: z.string().min(1, 'El código es requerido').max(50),
  oemCode: z.string().max(100).optional().or(z.literal('')),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  brand: z.string().max(100).optional().or(z.literal('')),
  category: z.string().max(100).optional().or(z.literal('')),
  unit: z.string().max(30).optional().or(z.literal('')),
  costPrice: z.number().min(0, 'El precio no puede ser negativo'),
  salePrice: z.number().min(0, 'El precio no puede ser negativo'),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  location: z.string().max(100).optional().or(z.literal('')),
  supplier: z.string().max(200).optional().or(z.literal('')),
});

export type ProductFormData = z.infer<typeof productSchema>;
