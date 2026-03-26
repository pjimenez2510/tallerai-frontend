export interface BusinessSettings {
  currency: string;
  taxRate: number;
  paymentTerms: string | null;
  workingHours: string | null;
}

export interface TenantSettings {
  id: string;
  name: string;
  ruc: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  settings: BusinessSettings | null;
  isActive: boolean;
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
