import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type {
  Customer,
  CustomerCreate,
  CustomerUpdate,
} from '../models/customer.model';

export const customerApi = {
  getAll: (page = 0, limit = 10, total = 0, search?: string) =>
    api
      .get<
        ApiResponse<Customer[]>
      >('/customer', { params: { page, limit, total, ...(search ? { fullName: search } : {}) } })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<Customer>>(`/customer/${id}`).then((r) => r.data),

  create: (payload: CustomerCreate) =>
    api.put<ApiResponse<Customer>>('/customer', payload).then((r) => r.data),

  update: (id: number, payload: CustomerUpdate) =>
    api
      .patch<ApiResponse<Customer>>(`/customer/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/customer/${id}`).then((r) => r.data),
};
