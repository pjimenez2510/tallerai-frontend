import type { ApiResponse } from '@/types/api.types';
import type { PublicWorkOrderStatus, PublicVehicleHistory } from '@/types/public.types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export const publicApi = {
  async getWorkOrderStatus(
    orderNumber: string,
  ): Promise<ApiResponse<PublicWorkOrderStatus>> {
    const response = await fetch(
      `${API_URL}/public/work-orders/${orderNumber}`,
      { cache: 'no-store' },
    );

    const json: unknown = await response.json();

    if (!response.ok) {
      throw json;
    }

    return json as ApiResponse<PublicWorkOrderStatus>;
  },

  async getVehicleHistory(plate: string): Promise<ApiResponse<PublicVehicleHistory>> {
    const response = await fetch(
      `${API_URL}/public/vehicles/${encodeURIComponent(plate)}`,
      { cache: 'no-store' },
    );

    const json: unknown = await response.json();

    if (!response.ok) {
      throw json;
    }

    return json as ApiResponse<PublicVehicleHistory>;
  },
};
