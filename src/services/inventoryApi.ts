import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type {
  InventoryMovement,
  ProductLot,
  ProductLotIdResponse,
  ProductLotRequest,
} from '../models/inventory.model';

import { getCurrentDate, nowUTC } from '../utils/dateUtils';

export const inventoryApi = {
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

  //Actualizar stock de un producto
  getStockByBarCode: (barcode: string) =>
    api
      .get<ApiResponse<ProductLot>>(`/product_lot/barcode/${barcode}`)
      .then((r) => r.data),

  updateStock: (
    id: number,
    productLotRequest: ProductLotRequest,
    typeOperation: string,
  ) => {
    const payload = { ...productLotRequest, createdAt: nowUTC() };
    return typeOperation === 'update'
      ? api
          .patch<ApiResponse<ProductLotIdResponse>>(`product_lot/${id}`, payload)
          .then((r) => r.data)
      : api
          .patch<ApiResponse<ProductLotIdResponse>>(
            `product_lot/adjust/${id}`,
            payload,
          )
          .then((r) => r.data);
  },
};
