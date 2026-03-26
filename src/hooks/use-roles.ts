'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { rolesApi } from '@/lib/api/roles';
import type { CreateRoleRequest, UpdateRoleRequest } from '@/types/role.types';
import { ApiError } from '@/types/api.types';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await rolesApi.list();
      return response.data;
    },
  });
}

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  clients: 'Clientes',
  vehicles: 'Vehículos',
  work_orders: 'Órdenes de Trabajo',
  inventory: 'Inventario',
  services: 'Servicios',
  purchases: 'Compras',
  users: 'Usuarios',
  roles: 'Roles',
  settings: 'Configuración',
  reports: 'Reportes',
  kanban: 'Kanban',
  mechanic: 'Vista Mecánico',
  notifications: 'Notificaciones',
};

const PERMISSION_LABELS: Record<string, string> = {
  view: 'Ver',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
  change_status: 'Cambiar estado',
  assign: 'Asignar',
  stock_movements: 'Movimientos de stock',
  receive: 'Recibir',
  cancel: 'Cancelar',
  deactivate: 'Desactivar',
  export: 'Exportar',
  move: 'Mover',
  complete_tasks: 'Completar tareas',
  productivity: 'Productividad',
};

export function useRolePermissions() {
  return useQuery({
    queryKey: ['roles', 'permissions'],
    queryFn: async () => {
      const response = await rolesApi.getPermissions();
      const data = response.data;

      return Object.entries(data).map(([module, permissions]) => ({
        module: MODULE_LABELS[module] ?? module,
        moduleKey: module,
        permissions: permissions.map((p) => {
          const action = p.split('.').slice(1).join('.');
          return {
            key: p,
            label: PERMISSION_LABELS[action] ?? action,
          };
        }),
      }));
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleRequest) => {
      const response = await rolesApi.create(data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al crear rol');
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoleRequest }) => {
      const response = await rolesApi.update(id, data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al actualizar rol');
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await rolesApi.delete(id);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(response.message);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al eliminar rol');
    },
  });
}
