import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type {
  User,
  UserChangePassword,
  UserChangeStatus,
  UserCreate,
  UserUpdate,
} from '../models/user.model';

export const userApi = {
  getAll: (page = 1, limit = 10, total = 0, search?: string) =>
    api
      .get<
        ApiResponse<User[]>
      >('/user', { params: { page, limit, total, ...(search ? { fullName: search } : {}) } })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<User>>(`/user/${id}`).then((r) => r.data),

  create: (payload: UserCreate) =>
    api.post<ApiResponse<User>>('/user', payload).then((r) => r.data),

  update: (id: number, payload: UserUpdate) =>
    api.patch<ApiResponse<User>>(`/user/${id}`, payload).then((r) => r.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/user/${id}`).then((r) => r.data),

  changePassword: (payload: { username: string; password: string }) =>
    api
      .patch<ApiResponse<UserChangePassword>>(`/user/password`, payload)
      .then((r) => r.data),

  changeStatus: (payload: {
    username: string;
    status: string;
    updatedBy: number;
  }) =>
    api
      .patch<ApiResponse<UserChangeStatus>>(`/user/status`, payload)
      .then((r) => r.data),
};
