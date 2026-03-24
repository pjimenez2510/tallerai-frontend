'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  ShoppingCart,
  Truck,
  StickyNote,
  Package,
  DollarSign,
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
  createPurchaseSchema,
  type CreatePurchaseFormData,
} from '@/lib/validations/purchase';
import { useCreatePurchase } from '@/hooks/use-purchases';
import { useProducts } from '@/hooks/use-products';
import type { Product } from '@/types/product.types';

interface PurchaseItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitCost: number;
}

interface CreatePurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePurchaseDialog({
  open,
  onOpenChange,
}: CreatePurchaseDialogProps) {
  const createPurchase = useCreatePurchase();
  const { data: products } = useProducts();

  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemCost, setItemCost] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemError, setItemError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePurchaseFormData>({
    resolver: zodResolver(createPurchaseSchema),
    defaultValues: {
      supplier: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({ supplier: '', notes: '' });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems([]);
       
      setProductSearch('');
       
      setItemQty(1);
       
      setItemCost(0);
       
      setSelectedProduct(null);
       
      setItemError('');
    }
  }, [open, reset]);

  const filteredProducts = products?.filter((p) => {
    if (!productSearch) return false;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q)
    );
  });

  function handleSelectProduct(product: Product) {
    setSelectedProduct(product);
    setProductSearch(`${product.code} — ${product.name}`);
    setItemCost(product.costPrice);
  }

  function handleAddItem() {
    if (!selectedProduct) {
      setItemError('Selecciona un producto');
      return;
    }
    if (itemQty < 1) {
      setItemError('La cantidad debe ser mayor a 0');
      return;
    }
    if (itemCost <= 0) {
      setItemError('El costo debe ser mayor a 0');
      return;
    }

    const existing = items.findIndex((i) => i.productId === selectedProduct.id);
    if (existing >= 0) {
      const updated = [...items];
      updated[existing] = {
        ...updated[existing],
        quantity: updated[existing].quantity + itemQty,
        unitCost: itemCost,
      };
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          productCode: selectedProduct.code,
          quantity: itemQty,
          unitCost: itemCost,
        },
      ]);
    }

    setProductSearch('');
    setSelectedProduct(null);
    setItemQty(1);
    setItemCost(0);
    setItemError('');
  }

  function handleRemoveItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);

  async function onSubmit(data: CreatePurchaseFormData) {
    if (items.length === 0) {
      setItemError('Agrega al menos un ítem');
      return;
    }

    await createPurchase.mutateAsync({
      supplier: data.supplier,
      notes: data.notes || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitCost: i.unitCost,
      })),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[var(--color-accent)]" />
            Nueva Orden de Compra
          </DialogTitle>
          <DialogDescription>
            Registra una orden de compra de repuestos al proveedor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Supplier */}
          <div className="space-y-1.5">
            <Label className="text-xs">Proveedor</Label>
            <div className="relative">
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                placeholder="Nombre del proveedor..."
                className="h-10 pl-10 rounded-xl"
                {...register('supplier')}
              />
            </div>
            {errors.supplier && (
              <p className="text-xs text-[var(--color-error)]">
                {errors.supplier.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Notas{' '}
              <span className="text-[var(--color-text-secondary)] font-normal">
                (opcional)
              </span>
            </Label>
            <div className="relative">
              <StickyNote className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Textarea
                placeholder="Observaciones o instrucciones para la orden..."
                className="min-h-[60px] pl-10 rounded-xl resize-none"
                {...register('notes')}
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3 rounded-xl border border-[var(--color-border)] p-4 bg-[var(--color-bg-secondary)]">
            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Ítems
            </p>

            {/* Product search */}
            <div className="space-y-1.5">
              <Label className="text-xs">Buscar producto</Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="Buscar por nombre o código..."
                  className="h-10 pl-10 rounded-xl bg-[var(--color-bg)]"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setSelectedProduct(null);
                  }}
                />
              </div>

              {productSearch && !selectedProduct && filteredProducts && filteredProducts.length > 0 && (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] max-h-40 overflow-y-auto">
                  {filteredProducts.slice(0, 8).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--color-bg-secondary)] text-left transition-colors"
                      onClick={() => handleSelectProduct(p)}
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 shrink-0">
                        <Package className="h-3.5 w-3.5 text-amber-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-[var(--color-text-primary)] truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {p.code} · Costo: ${p.costPrice.toFixed(2)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Qty + Cost + Add */}
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Cantidad</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="1"
                  className="h-10 rounded-xl bg-[var(--color-bg)]"
                  value={itemQty}
                  onChange={(e) => setItemQty(Number(e.target.value))}
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Costo unitario</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    className="h-10 pl-10 rounded-xl bg-[var(--color-bg)]"
                    value={itemCost}
                    onChange={(e) => setItemCost(Number(e.target.value))}
                  />
                </div>
              </div>
              <Button
                type="button"
                className="h-10 rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a] shrink-0"
                onClick={handleAddItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>

            {itemError && (
              <p className="text-xs text-[var(--color-error)]">{itemError}</p>
            )}

            {/* Items list */}
            {items.length > 0 && (
              <div className="space-y-2 mt-2">
                {items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 group"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 shrink-0">
                      <Package className="h-4 w-4 text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {item.quantity} x ${item.unitCost.toFixed(2)} ={' '}
                        <span className="font-medium text-[#10b981]">
                          ${(item.quantity * item.unitCost).toFixed(2)}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between rounded-xl bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 px-4 py-2.5">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    Total
                  </span>
                  <span className="text-lg font-bold text-[#1e3a5f] font-mono">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {items.length === 0 && (
              <div className="text-center py-4">
                <Package className="h-8 w-8 mx-auto text-[var(--color-text-secondary)]/30 mb-2" />
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Agrega productos a la orden
                </p>
              </div>
            )}
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
              disabled={isSubmitting || items.length === 0}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creando...
                </span>
              ) : (
                'Crear Orden de Compra'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
