import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type {
  Supplier,
  SupplierCreate,
  SupplierUpdate,
} from '../models/supplier.model';

export const supplierApi = {
  getAll: (page = 1, limit = 10, total = 0, search?: string) =>
    api
      .get<
        ApiResponse<Supplier[]>
      >('/supplier', { params: { page, limit, total, ...(search ? { companyName: search } : {}) } })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<Supplier>>(`/supplier/${id}`).then((r) => r.data),

  create: (payload: SupplierCreate) =>
    api.put<ApiResponse<Supplier>>('/supplier', payload).then((r) => r.data),

  update: (id: number, payload: SupplierUpdate) =>
    api
      .patch<ApiResponse<Supplier>>(`/supplier/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/supplier/${id}`).then((r) => r.data),
};
