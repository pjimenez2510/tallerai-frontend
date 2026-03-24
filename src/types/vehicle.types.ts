export interface Vehicle {
  id: string;
  clientId: string;
  clientName: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  vin: string | null;
  engine: string | null;
  transmission: string | null;
  fuelType: string | null;
  mileage: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleRequest {
  clientId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  vin?: string;
  engine?: string;
  transmission?: string;
  fuelType?: string;
  mileage?: number;
  notes?: string;
}

export interface UpdateVehicleRequest {
  clientId?: string;
  plate?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  vin?: string;
  engine?: string;
  transmission?: string;
  fuelType?: string;
  mileage?: number;
  notes?: string;
}
