import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type { User, UserCreate, UserUpdate } from '../models/user.model';

export const userApi = {
  getAll: (page = 0, limit = 10, total = 0, search?: string) =>
    api
      .get<
        ApiResponse<User[]>
      >('/user', { params: { page, limit, total, ...(search ? { fullName: search } : {}) } })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<User>>(`/user/${id}`).then((r) => r.data),

  create: (payload: UserCreate) =>
    api.put<ApiResponse<User>>('/user', payload).then((r) => r.data),

  update: (id: number, payload: UserUpdate) =>
    api.patch<ApiResponse<User>>(`/user/${id}`, payload).then((r) => r.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/user/${id}`).then((r) => r.data),

  changePassword: (
    id: number,
    payload: { oldPassword: string; newPassword: string },
  ) =>
    api
      .patch<ApiResponse<null>>(`/user/${id}/password`, payload)
      .then((r) => r.data),

  changeStatus: (id: number, active: boolean) =>
    api
      .patch<ApiResponse<null>>(`/user/${id}/status`, { active })
      .then((r) => r.data),
};
