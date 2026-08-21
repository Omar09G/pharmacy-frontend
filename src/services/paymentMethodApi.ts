import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type {
  PaymentMethod,
  PaymentMethodCreate,
} from '../models/payment-method.model';

export const paymentMethodApi = {
  getAll: (page = 1, limit = 50, total = 0) =>
    api
      .get<
        ApiResponse<PaymentMethod[]>
      >('/payment_methods', { params: { page, limit, total } })
      .then((r) => r.data),

  getById: (id: number) =>
    api
      .get<ApiResponse<PaymentMethod>>(`/payment_methods/${id}`)
      .then((r) => r.data),

  create: (payload: PaymentMethodCreate) =>
    api
      .post<ApiResponse<PaymentMethod>>('/payment_methods', payload)
      .then((r) => r.data),

  update: (id: number, payload: Partial<PaymentMethod>) =>
    api
      .patch<ApiResponse<PaymentMethod>>(`/payment_methods/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/payment_methods/${id}`).then((r) => r.data),
};
