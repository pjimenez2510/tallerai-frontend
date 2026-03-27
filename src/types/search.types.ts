export interface SearchResultClient {
  type: 'client';
  id: string;
  name: string;
  documentNumber: string;
}

export interface SearchResultVehicle {
  type: 'vehicle';
  id: string;
  plate: string;
  brand: string;
  model: string;
}

export interface SearchResultWorkOrder {
  type: 'work_order';
  id: string;
  orderNumber: string;
  clientName: string;
}

export interface SearchResultProduct {
  type: 'product';
  id: string;
  code: string;
  name: string;
}

export type SearchResult =
  | SearchResultClient
  | SearchResultVehicle
  | SearchResultWorkOrder
  | SearchResultProduct;

export interface SearchResponse {
  clients: SearchResultClient[];
  vehicles: SearchResultVehicle[];
  workOrders: SearchResultWorkOrder[];
  products: SearchResultProduct[];
}
