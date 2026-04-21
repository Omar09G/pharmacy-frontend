import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type {
  Product,
  ProductCreate,
  TaxProfileDetail,
  UnitDetail,
} from '../models/product.model';

const unitApiPath = '/units';
const taxApiPath = '/tax_profiles';

export const productApi = {
  getAll: (page = 1, limit = 10, total = 0, search?: string) =>
    api
      .get<
        ApiResponse<Product[]>
      >('/product', { params: { page, limit, total, ...(search ? { name: search } : {}) } })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<Product>>(`/add_product/${id}`).then((r) => r.data),

  getByBarcode: (barcode: string) =>
    api
      .get<ApiResponse<Product>>(`/add_product/${barcode}`)
      .then((r) => r.data),

  create: (payload: ProductCreate) =>
    api.put<ApiResponse<Product>>('/add_product', payload).then((r) => r.data),

  update: (id: number, payload: Partial<Product>) =>
    api
      .patch<ApiResponse<Product>>(`/add_product/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/add_product/${id}`).then((r) => r.data),

  getAllUnits: (page: number, limit: number, total?: number) =>
    api
      .get<
        ApiResponse<UnitDetail[]>
      >(unitApiPath, { params: { page, limit, total } })
      .then((r) => r.data),

  getAllTaxProfiles: (page: number, limit: number, total?: number) =>
    api
      .get<
        ApiResponse<TaxProfileDetail[]>
      >(taxApiPath, { params: { page, limit, total } })
      .then((r) => r.data),
};
