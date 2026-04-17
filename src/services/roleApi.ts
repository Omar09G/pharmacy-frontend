import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type {
  Role,
  RoleCreate,
  Permission,
  PermissionCreate,
} from '../models/role.model';

export const roleApi = {
  getAll: (page = 0, limit = 10, total = 0) =>
    api
      .get<ApiResponse<Role[]>>('/role', { params: { page, limit, total } })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<Role>>(`/role/${id}`).then((r) => r.data),

  getByName: (name: string, page = 0, limit = 10, total = 0) =>
    api
      .get<
        ApiResponse<Role[]>
      >('/role/name', { params: { name, page, limit, total } })
      .then((r) => r.data),

  create: (payload: RoleCreate) =>
    api.post<ApiResponse<Role>>('/role', payload).then((r) => r.data),

  update: (id: number, payload: Partial<Role>) =>
    api.patch<ApiResponse<Role>>(`/role/${id}`, payload).then((r) => r.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/role/${id}`).then((r) => r.data),
};

export const permissionApi = {
  getAll: (page = 0, limit = 10, total = 0) =>
    api
      .get<
        ApiResponse<Permission[]>
      >('/permission', { params: { page, limit, total } })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<Permission>>(`/permission/${id}`).then((r) => r.data),

  getByName: (name: string, page = 0, limit = 10, total = 0) => {
    if (name.trim().length === 0) {
      return api
        .get<
          ApiResponse<Permission[]>
        >('/permission', { params: { page, limit, total } })
        .then((r) => r.data);
    }
    return api
      .get<
        ApiResponse<Permission[]>
      >('/permission/name', { params: { name, page, limit, total } })
      .then((r) => r.data);
  },

  create: (payload: PermissionCreate) =>
    api
      .put<ApiResponse<Permission>>('/permission', payload)
      .then((r) => r.data),

  update: (id: number, payload: Partial<Permission>) =>
    api
      .patch<ApiResponse<Permission>>(`/permission/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/permission/${id}`).then((r) => r.data),
};
