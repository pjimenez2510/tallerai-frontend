'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import {
  Hash,
  Package,
  DollarSign,
  MapPin,
  Truck,
  Tag,
  StickyNote,
  Layers,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  productSchema,
  type ProductFormData,
} from '@/lib/validations/product';
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-products';
import type { Product } from '@/types/product.types';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: ProductFormDialogProps) {
  const isEditing = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      code: '',
      oemCode: '',
      name: '',
      description: '',
      brand: '',
      category: '',
      unit: 'unidad',
      costPrice: 0,
      salePrice: 0,
      stock: 0,
      minStock: 0,
      location: '',
      supplier: '',
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        code: product.code,
        oemCode: product.oemCode ?? '',
        name: product.name,
        description: product.description ?? '',
        brand: product.brand ?? '',
        category: product.category ?? '',
        unit: product.unit,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        stock: product.stock,
        minStock: product.minStock,
        location: product.location ?? '',
        supplier: product.supplier ?? '',
      });
    } else {
      reset({
        code: '',
        oemCode: '',
        name: '',
        description: '',
        brand: '',
        category: '',
        unit: 'unidad',
        costPrice: 0,
        salePrice: 0,
        stock: 0,
        minStock: 0,
        location: '',
        supplier: '',
      });
    }
  }, [product, reset]);

  async function onSubmit(data: ProductFormData) {
    const payload = {
      ...data,
      oemCode: data.oemCode || undefined,
      description: data.description || undefined,
      brand: data.brand || undefined,
      category: data.category || undefined,
      unit: data.unit || undefined,
      location: data.location || undefined,
      supplier: data.supplier || undefined,
    };

    if (isEditing) {
      await updateProduct.mutateAsync({ id: product.id, data: payload });
    } else {
      await createProduct.mutateAsync(payload);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del repuesto'
              : 'Registra un nuevo repuesto en el inventario'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Code + OEM */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Código interno</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="REP-001"
                  className="h-10 pl-10 rounded-xl uppercase"
                  {...register('code')}
                />
              </div>
              {errors.code && (
                <p className="text-xs text-[var(--color-error)]">
                  {errors.code.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Código OEM</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="90915-YZZD1"
                  className="h-10 pl-10 rounded-xl"
                  {...register('oemCode')}
                />
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs">Nombre del producto</Label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                placeholder="Filtro de aceite Toyota Hilux"
                className="h-10 pl-10 rounded-xl"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-[var(--color-error)]">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Brand + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Marca</Label>
              <Input
                placeholder="Toyota"
                className="h-10 rounded-xl"
                {...register('brand')}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Categoría</Label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="Filtros"
                  className="h-10 pl-10 rounded-xl"
                  {...register('category')}
                />
              </div>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Precio costo</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="8.50"
                  className="h-10 pl-10 rounded-xl"
                  {...register('costPrice', { valueAsNumber: true })}
                />
              </div>
              {errors.costPrice && (
                <p className="text-xs text-[var(--color-error)]">
                  {errors.costPrice.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Precio venta</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#10b981]" />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="15.00"
                  className="h-10 pl-10 rounded-xl"
                  {...register('salePrice', { valueAsNumber: true })}
                />
              </div>
              {errors.salePrice && (
                <p className="text-xs text-[var(--color-error)]">
                  {errors.salePrice.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Unidad</Label>
              <Input
                placeholder="unidad"
                className="h-10 rounded-xl"
                {...register('unit')}
              />
            </div>
          </div>

          {/* Stock + Min Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Stock actual</Label>
              <Input
                type="number"
                placeholder="50"
                className="h-10 rounded-xl"
                {...register('stock', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Stock mínimo (alerta)</Label>
              <Input
                type="number"
                placeholder="5"
                className="h-10 rounded-xl"
                {...register('minStock', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Location + Supplier */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Ubicación</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="Estante A-3"
                  className="h-10 pl-10 rounded-xl"
                  {...register('location')}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Proveedor</Label>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="Repuestos Ecuador"
                  className="h-10 pl-10 rounded-xl"
                  {...register('supplier')}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs">Descripción</Label>
            <div className="relative">
              <StickyNote className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Textarea
                placeholder="Detalles del repuesto..."
                className="min-h-[70px] pl-10 rounded-xl resize-none"
                {...register('description')}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 bg-transparent border-t-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </span>
              ) : isEditing ? (
                'Guardar Cambios'
              ) : (
                'Crear Producto'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
