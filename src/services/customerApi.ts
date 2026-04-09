import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type {
  Customer,
  CustomerCreate,
  CustomerCreditAccount,
  CustomerCreditAccountCreate,
  CustomerCreditAccountUpdate,
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

  //Lineas de credito
  getByIdCreditAccount: (id: number | undefined) =>
    api
      .get<ApiResponse<CustomerCreditAccount>>(`/customer_credit_account/${id}`)
      .then((r) => r.data),

  createCreditAccount: (payload?: CustomerCreditAccountCreate) =>
    api
      .put<
        ApiResponse<CustomerCreditAccount>
      >(`/customer_credit_account`, payload)
      .then((r) => r.data),

  updateCreditAccount: (
    customerId: number,
    payload: CustomerCreditAccountUpdate,
  ) =>
    api
      .patch<
        ApiResponse<CustomerCreditAccount>
      >(`/customer_credit_account/${customerId}`, payload)
      .then((r) => r.data),

  deleteCreditAccount: (id: number) =>
    api
      .delete<ApiResponse<null>>(`/customer_credit_account/${id}`)
      .then((r) => r.data),
};
