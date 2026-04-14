import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type { Sale, AddSaleRequest, SaleItem } from '../models/sale.model';
import { getCurrentDate } from '../utils/dateUtils';

export const saleApi = {
  getAll: (
    page = 0,
    limit = 10,
    total = 0,
    dateInit: string = getCurrentDate(),
    dateEnd: string = getCurrentDate(),
  ) =>
    api
      .get<
        ApiResponse<Sale[]>
      >('/sale', { params: { page, limit, total, dateInit, dateEnd } })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<ApiResponse<Sale>>(`/sale/${id}`).then((r) => r.data),

  getByDate: (date: string, page = 0, limit = 10, total = 0) =>
    api
      .get<
        ApiResponse<Sale[]>
      >('/sale/date', { params: { date, page, limit, total } })
      .then((r) => r.data),

  search: (params: Record<string, unknown>) =>
    api.get<ApiResponse<Sale[]>>('/sale', { params }).then((r) => r.data),

  create: (payload: AddSaleRequest) =>
    api.post<ApiResponse<Sale>>('/add_sale', payload).then((r) => r.data),

  cancel: (id: number) =>
    api.patch<ApiResponse<null>>(`/add_sale/${id}`, {}).then((r) => r.data),

  getSaleDetails: (saleId: number, page = 0, limit = 1000, total = 0) =>
    api
      .get<
        ApiResponse<SaleItem[]>
      >(`/sale_item`, { params: { page, limit, total, saleId } })
      .then((r) => r.data),
};
