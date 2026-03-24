import { apiClient } from './client';
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  StockMovement,
  AddStockMovementRequest,
  InventoryReport,
} from '@/types/product.types';

export const productsApi = {
  list() {
    return apiClient.get<Product[]>('/products');
  },

  search(query: string) {
    return apiClient.get<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
  },

  getById(id: string) {
    return apiClient.get<Product>(`/products/${id}`);
  },

  getLowStock() {
    return apiClient.get<Product[]>('/products/low-stock');
  },

  create(data: CreateProductRequest) {
    return apiClient.post<Product>('/products', data);
  },

  update(id: string, data: UpdateProductRequest) {
    return apiClient.patch<Product>(`/products/${id}`, data);
  },

  deactivate(id: string) {
    return apiClient.delete<Product>(`/products/${id}`);
  },

  addStockMovement(id: string, data: AddStockMovementRequest) {
    return apiClient.post<Product>(`/products/${id}/stock`, data);
  },

  getMovements(id: string) {
    return apiClient.get<StockMovement[]>(`/products/${id}/movements`);
  },

  getReport() {
    return apiClient.get<InventoryReport>('/products/report');
  },
};
