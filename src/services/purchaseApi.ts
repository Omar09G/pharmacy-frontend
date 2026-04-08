import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type { Purchase, PurchaseCreate } from '../models/purchase.model';

export const purchaseApi = {
  getAll: (page = 0, limit = 10, total = 0) =>
    api
      .get<
        ApiResponse<Purchase[]>
      >('/purchase', { params: { page, limit, total } })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<Purchase>>(`/purchase/${id}`).then((r) => r.data),

  create: (payload: PurchaseCreate) =>
    api.put<ApiResponse<Purchase>>('/purchase', payload).then((r) => r.data),

  update: (id: number, payload: Partial<Purchase>) =>
    api
      .patch<ApiResponse<Purchase>>(`/purchase/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/purchase/${id}`).then((r) => r.data),
};
