import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type { Category, CategoryCreate } from '../models/category.model';

export const categoryApi = {
  getAll: (page = 1, limit = 10, total = 0, search?: string) =>
    api
      .get<
        ApiResponse<Category[]>
      >('/category', { params: { page, limit, total, ...(search ? { categoryName: search } : {}) } })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<Category>>(`/category/${id}`).then((r) => r.data),

  create: (payload: CategoryCreate) =>
    api.put<ApiResponse<Category>>('/category', payload).then((r) => r.data),

  update: (id: number, payload: Partial<Category>) =>
    api
      .patch<ApiResponse<Category>>(`/category/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/category/${id}`).then((r) => r.data),
};
