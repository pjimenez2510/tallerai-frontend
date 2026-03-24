export type DocumentType = 'cedula' | 'ruc' | 'pasaporte';

export interface Client {
  id: string;
  documentType: DocumentType;
  documentNumber: string;
  name: string;
  email: string | null;
  phone: string | null;
  phoneSecondary: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  documentType: DocumentType;
  documentNumber: string;
  name: string;
  email?: string;
  phone?: string;
  phoneSecondary?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientRequest {
  documentType?: DocumentType;
  documentNumber?: string;
  name?: string;
  email?: string;
  phone?: string;
  phoneSecondary?: string;
  address?: string;
  notes?: string;
}
