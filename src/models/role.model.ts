export interface Role {
  id: number;
  roleName: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleCreate {
  id: 0;
  roleName: string;
  description: string;
  active: boolean;
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
