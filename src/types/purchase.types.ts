export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export type PurchaseOrderStatus = 'pendiente' | 'recibida' | 'cancelada';

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  notes: string | null;
  total: number;
  status: PurchaseOrderStatus;
  receivedAt: string | null;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderItemRequest {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseOrderRequest {
  supplier: string;
  notes?: string;
  items: CreatePurchaseOrderItemRequest[];
}
