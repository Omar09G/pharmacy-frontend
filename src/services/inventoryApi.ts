import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type {
  InventoryMovement,
  InventoryStock,
} from '../models/inventory.model';

export const inventoryApi = {
  getStock: (page = 0, limit = 10, total = 0, search?: string) =>
    api
      .get<
        ApiResponse<InventoryStock[]>
      >('/inventory/stock', { params: { page, limit, total, ...(search ? { productName: search } : {}) } })
      .then((r) => r.data),

  getMovements: (page = 0, limit = 10, total = 0, productId?: number) =>
    api
      .get<
        ApiResponse<InventoryMovement[]>
      >('/inventory/movements', { params: { page, limit, total, ...(productId ? { productId } : {}) } })
      .then((r) => r.data),

  createMovement: (payload: Partial<InventoryMovement>) =>
    api
      .put<ApiResponse<InventoryMovement>>('/inventory/movements', payload)
      .then((r) => r.data),
};
