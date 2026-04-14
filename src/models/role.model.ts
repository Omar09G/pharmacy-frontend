export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface RoleCreate {
  id: 0;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface PermissionCreate {
  id: 0;
  name: string;
  description?: string;
}

export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
}

export interface UserRole {
  id: number;
  userId: number;
  roleId: number;
}
