import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type { Product, AddProductRequest } from '../models/product.model';

export const productApi = {
  getAll: (page = 0, limit = 10, total = 0, search?: string) =>
    api
      .get<
        ApiResponse<Product[]>
      >('/add_product', { params: { page, limit, total, ...(search ? { productName: search } : {}) } })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<Product>>(`/add_product/${id}`).then((r) => r.data),

  getByBarcode: (barcode: string) =>
    api
      .get<ApiResponse<Product>>(`/add_product/${barcode}`)
      .then((r) => r.data),

  create: (payload: AddProductRequest) =>
    api.put<ApiResponse<Product>>('/add_product', payload).then((r) => r.data),

  update: (id: number, payload: Partial<Product>) =>
    api
      .patch<ApiResponse<Product>>(`/add_product/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/add_product/${id}`).then((r) => r.data),
};
