import { apiClient } from './client';
import type { MechanicWorkOrder, MechanicSummary } from '@/types/mechanic.types';

export const mechanicApi = {
  getMyTasks() {
    return apiClient.get<MechanicWorkOrder[]>('/mechanic/my-tasks');
  },

  completeTask(taskId: string) {
    return apiClient.patch<{ id: string; isCompleted: boolean }>(
      `/mechanic/tasks/${taskId}/complete`,
      {},
    );
  },

  getSummary() {
    return apiClient.get<MechanicSummary>('/mechanic/summary');
  },
};
