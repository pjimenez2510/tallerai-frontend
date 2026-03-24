export interface Service {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  code: string;
  name: string;
  description?: string;
  price: number;
}

export interface UpdateServiceRequest {
  code?: string;
  name?: string;
  description?: string;
  price?: number;
}
