'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  DollarSign,
  MapPin,
  Truck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { ProductFormDialog } from './product-form-dialog';
import { useProducts, useDeactivateProduct, useInventoryReport } from '@/hooks/use-products';
import type { Product } from '@/types/product.types';

export function InventoryTable() {
  const { data: products, isLoading } = useProducts();
  const { data: report } = useInventoryReport();
  const deactivateProduct = useDeactivateProduct();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const filtered = products?.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.oemCode?.toLowerCase().includes(q) ?? false) ||
      (p.brand?.toLowerCase().includes(q) ?? false) ||
      (p.category?.toLowerCase().includes(q) ?? false)
    );
  });

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  function handleNew() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  async function handleDeactivate() {
    if (!deletingProduct) return;
    await deactivateProduct.mutateAsync(deletingProduct.id);
    setDeletingProduct(null);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Inventory Report Summary */}
      {report && (
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {report.totalProducts}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Total productos
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                ${report.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Valor total inventario
              </p>
            </div>
            {report.lowStockCount > 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <p className="text-2xl font-bold text-amber-700">
                    {report.lowStockCount}
                  </p>
                </div>
                <p className="text-xs text-amber-600 mt-1">Alertas de stock bajo</p>
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                <p className="text-2xl font-bold text-[var(--color-success)]">0</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Alertas de stock
                </p>
              </div>
            )}
          </div>

          {report.categorySummary.length > 0 && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
                Categorías
              </p>
              <div className="flex flex-wrap gap-2">
                {report.categorySummary.map((cat) => (
                  <span
                    key={cat.category}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-1 text-xs font-medium text-[var(--color-text-primary)]"
                  >
                    {cat.category}
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1e3a5f]/10 text-[10px] font-bold text-[#1e3a5f] px-1">
                      {cat.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
          <Input
            placeholder="Buscar por código, nombre, marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-10 rounded-xl"
          />
        </div>
        <Button
          onClick={handleNew}
          className="rounded-xl bg-[#1e3a5f] text-white hover:bg-[#162d4a] shadow-md shadow-[#1e3a5f]/20"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)]">
              <TableHead className="font-semibold">Producto</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">
                Precios
              </TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">
                Stock
              </TableHead>
              <TableHead className="font-semibold hidden xl:table-cell">
                Ubicación
              </TableHead>
              <TableHead className="font-semibold text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered && filtered.length > 0 ? (
              filtered.map((product) => (
                <TableRow
                  key={product.id}
                  className="group cursor-pointer hover:bg-[var(--color-bg-secondary)]/50"
                  onClick={() => handleEdit(product)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shrink-0">
                        <Package className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] font-bold"
                          >
                            {product.code}
                          </Badge>
                          {product.isLowStock && (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px]">
                              <AlertTriangle className="h-3 w-3 mr-0.5" />
                              Bajo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[var(--color-text-primary)] font-medium mt-0.5 truncate max-w-[250px]">
                          {product.name}
                        </p>
                        {(product.brand || product.category) && (
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {[product.brand, product.category]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-3 w-3 text-[var(--color-text-secondary)]" />
                        <span className="text-[var(--color-text-secondary)]">
                          Costo:
                        </span>
                        <span className="font-mono">
                          ${product.costPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-3 w-3 text-[#10b981]" />
                        <span className="text-[var(--color-text-secondary)]">
                          Venta:
                        </span>
                        <span className="font-mono font-medium text-[#10b981]">
                          ${product.salePrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg font-bold font-mono ${
                            product.isLowStock
                              ? 'text-amber-600'
                              : 'text-[var(--color-text-primary)]'
                          }`}
                        >
                          {product.stock}
                        </span>
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          {product.unit}
                        </span>
                      </div>
                      {product.minStock > 0 && (
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          Mín: {product.minStock}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                      {product.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {product.location}
                        </div>
                      )}
                      {product.supplier && (
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">
                            {product.supplier}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(product);
                        }}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-secondary)]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingProduct(product);
                        }}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-error)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Package className="h-10 w-10 mx-auto text-[var(--color-text-secondary)]/30 mb-3" />
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {search
                      ? 'No se encontraron productos con esa búsqueda'
                      : 'Aún no hay productos en el inventario'}
                  </p>
                  {!search && (
                    <Button
                      variant="link"
                      onClick={handleNew}
                      className="mt-2 text-[#f97316]"
                    >
                      Agrega tu primer producto
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
      />

      {/* Deactivate Confirmation */}
      <AlertDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              El producto{' '}
              <span className="font-semibold">{deletingProduct?.name}</span>{' '}
              <span className="font-mono">({deletingProduct?.code})</span> será
              desactivado del inventario. Podrá reactivarse después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <Button
              onClick={handleDeactivate}
              className="rounded-xl bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90"
            >
              Desactivar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
