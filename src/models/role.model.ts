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
  permissionName: string;
  resource: string;
  action: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCreate {
  id: 0;
  permissionName: string;
  resource: string;
  action: string;
  description: string;
  active: boolean;
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
