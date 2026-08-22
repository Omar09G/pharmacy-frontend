import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type {
  InventoryMovement,
  InventoryStock,
  ProductLot,
  ProductLotIdResponse,
  ProductLotRequest,
} from '../models/inventory.model';

import { getCurrentDate } from '../utils/dateUtils';

export const inventoryApi = {
  getStock: (page = 1, limit = 10, total = 0, search?: string) =>
    api
      .get<ApiResponse<InventoryStock[]>>('/inventory/stock', {
        params: {
          page,
          limit,
          total,
          ...(search ? { productName: search } : {}),
        },
      })
      .then((r) => r.data),

  getMovements: (
    page = 1,
    limit = 10,
    total = 0,
    dateInit: string = getCurrentDate(),
    dateEnd: string = getCurrentDate(),
  ) =>
    api
      .get<ApiResponse<InventoryMovement[]>>('/inventory_movement', {
        params: { page, limit, total, dateInit, dateEnd },
      })
      .then((r) => r.data),

  createMovement: (payload: Partial<InventoryMovement>) =>
    api
      .put<ApiResponse<InventoryMovement>>('inventory_movement', payload)
      .then((r) => r.data),
  //Actualizar stock de un producto
  getStockByBarCode: (barcode: string) =>
    api
      .get<ApiResponse<ProductLot>>(`/product_lot/barcode/${barcode}`)
      .then((r) => r.data),

  updateStock: (
    id: number,
    productLotRequest: ProductLotRequest,
    typeOperation: string,
  ) =>
    typeOperation === 'update'
      ? api
          .patch<ApiResponse<ProductLotIdResponse>>(
            `product_lot/${id}`,
            productLotRequest,
          )
          .then((r) => r.data)
      : api
          .patch<ApiResponse<ProductLotIdResponse>>(
            `product_lot/adjust/${id}`,
            productLotRequest,
          )
          .then((r) => r.data),
  //Actualizar stock de un producto
  updateStockSimple: (id: number, productLotRequest: ProductLotRequest) =>
    api
      .patch<ApiResponse<ProductLotIdResponse>>(
        `product_lot/${id}`,
        productLotRequest,
      )
      .then((r) => r.data),
  //Ajustar stock de un producto
  adjustStock: (id: number, productLotRequest: ProductLotRequest) =>
    api
      .patch<ApiResponse<ProductLotIdResponse>>(
        `product_lot/adjust/${id}`,
        productLotRequest,
      )
      .then((r) => r.data),
};
