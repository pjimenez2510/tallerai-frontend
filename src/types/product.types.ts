export interface Product {
  id: string;
  code: string;
  oemCode: string | null;
  name: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  unit: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  location: string | null;
  supplier: string | null;
  isActive: boolean;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  code: string;
  oemCode?: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  unit?: string;
  costPrice: number;
  salePrice: number;
  stock?: number;
  minStock?: number;
  location?: string;
  supplier?: string;
}

export interface StockMovement {
  id: string;
  type: 'ingreso' | 'salida' | 'ajuste';
  quantity: number;
  notes: string | null;
  createdAt: string;
  createdBy: string;
}

export interface AddStockMovementRequest {
  type: 'ingreso' | 'salida' | 'ajuste';
  quantity: number;
  notes?: string;
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  categories: { category: string; count: number }[];
}

export interface UpdateProductRequest {
  code?: string;
  oemCode?: string;
  name?: string;
  description?: string;
  brand?: string;
  category?: string;
  unit?: string;
  costPrice?: number;
  salePrice?: number;
  stock?: number;
  minStock?: number;
  location?: string;
  supplier?: string;
}
