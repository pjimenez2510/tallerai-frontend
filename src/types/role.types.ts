export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
  createdAt: string;
}

export interface PermissionGroup {
  module: string;
  permissions: { key: string; label: string }[];
}

export interface CreateRoleRequest {
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}
