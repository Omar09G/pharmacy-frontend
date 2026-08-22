import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type { Discount, DiscountCreate } from '../models/discount.model';

export const discountApi = {
  getAll: (page = 1, limit = 10, total = 0, active?: boolean) =>
    api
      .get<ApiResponse<Discount[]>>('/discount', {
        params: {
          page,
          limit,
          total,
          ...(active !== undefined ? { active } : {}),
        },
      })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<Discount>>(`/discount/${id}`).then((r) => r.data),

  create: (payload: DiscountCreate) =>
    api.post<ApiResponse<Discount>>('/discount', payload).then((r) => r.data),

  update: (id: number, payload: Partial<Discount>) =>
    api
      .patch<ApiResponse<Discount>>(`/discount/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/discount/${id}`).then((r) => r.data),
};
