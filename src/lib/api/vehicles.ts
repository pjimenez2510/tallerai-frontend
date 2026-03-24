import { apiClient } from './client';
import type {
  Vehicle,
  CreateVehicleRequest,
  UpdateVehicleRequest,
} from '@/types/vehicle.types';

export const vehiclesApi = {
  list() {
    return apiClient.get<Vehicle[]>('/vehicles');
  },

  search(query: string) {
    return apiClient.get<Vehicle[]>(`/vehicles/search?q=${encodeURIComponent(query)}`);
  },

  getById(id: string) {
    return apiClient.get<Vehicle>(`/vehicles/${id}`);
  },

  getByClient(clientId: string) {
    return apiClient.get<Vehicle[]>(`/vehicles/by-client/${clientId}`);
  },

  getByPlate(plate: string) {
    return apiClient.get<Vehicle>(`/vehicles/by-plate/${encodeURIComponent(plate)}`);
  },

  create(data: CreateVehicleRequest) {
    return apiClient.post<Vehicle>('/vehicles', data);
  },

  update(id: string, data: UpdateVehicleRequest) {
    return apiClient.patch<Vehicle>(`/vehicles/${id}`, data);
  },

  deactivate(id: string) {
    return apiClient.delete<Vehicle>(`/vehicles/${id}`);
  },
};
