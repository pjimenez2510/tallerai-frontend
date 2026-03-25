export interface TenantSettings {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettings {
  id: string;
  tenantId: string;
  currency: string;
  taxRate: number;
  paymentTerms: string | null;
  workingHours: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTenantSettingsRequest {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
}

export interface UpdateBusinessSettingsRequest {
  currency?: string;
  taxRate?: number;
  paymentTerms?: string;
  workingHours?: string;
}
