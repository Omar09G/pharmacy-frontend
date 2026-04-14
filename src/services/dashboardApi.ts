import api from '../api/axiosInstance';
import type { ApiResponse } from '../utils/Utils';
import type {
  SalesDailySummary,
  DailyCashCut,
  BestSeller30d,
  CustomerInvoiceAging,
  CustomerAccountSummary,
  DashboardInventoryStock,
  CashJournalBalance,
  SalesWithPayments,
  SaleItemsDetail,
} from '../models/dashboard.model';
import { getCurrentDate } from '../utils/dateUtils';

export const dashboardApi = {
  getSalesDailySummary: (
    page = 0,
    limit = 31,
    total = 0,
    dateInit: string = getCurrentDate(),
    dateEnd: string = getCurrentDate(),
  ) =>
    api
      .get<ApiResponse<SalesDailySummary[]>>('/vw_sales_daily_summary', {
        params: { page, limit, total, dateInit, dateEnd },
      })
      .then((r) => r.data),

  getBestSellers30d: (
    page = 0,
    limit = 100,
    total = 0,
    dateInit?: string,
    dateEnd?: string,
  ) =>
    api
      .get<ApiResponse<BestSeller30d[]>>('/vw_best_sellers_30d', {
        params: { page, limit, total, dateInit, dateEnd },
      })
      .then((r) => r.data),

  getInventoryStock: (page = 0, limit = 10, total = 0, productId?: number) =>
    api
      .get<ApiResponse<DashboardInventoryStock[]>>('/vw_inventory_stock', {
        params: { page, limit, total, productId },
      })
      .then((r) => r.data),

  getCashJournalBalance: (
    page = 0,
    limit = 100,
    total = 0,
    dateInit?: string,
    dateEnd?: string,
  ) =>
    api
      .get<ApiResponse<CashJournalBalance[]>>('/vw_cash_journal_balance', {
        params: { page, limit, total, dateInit, dateEnd },
      })
      .then((r) => r.data),

  getDailyCashCut: (
    page = 0,
    limit = 100,
    total = 0,
    dateInit: string = getCurrentDate(),
    dateEnd: string = getCurrentDate(),
  ) =>
    api
      .get<ApiResponse<DailyCashCut[]>>('/vw_daily_cash_cut', {
        params: { page, limit, total, dateInit, dateEnd },
      })
      .then((r) => r.data),

  getCustomerAccountSummary: (
    page = 0,
    limit = 100,
    total = 0,
    customerId?: number,
    dateInit?: string,
    dateEnd?: string,
  ) =>
    api
      .get<
        ApiResponse<CustomerAccountSummary[]>
      >('/vw_customer_account_summary', { params: { page, limit, total, customerId, dateInit, dateEnd } })
      .then((r) => r.data),

  getCustomerInvoiceAging: (
    page = 0,
    limit = 100,
    total = 0,
    customerId?: number,
  ) =>
    api
      .get<ApiResponse<CustomerInvoiceAging[]>>('/vw_customer_invoice_aging', {
        params: { page, limit, total, customerId },
      })
      .then((r) => r.data),

  getSalesWithPayments: (
    page = 0,
    limit = 100,
    total = 0,
    dateInit?: string,
    dateEnd?: string,
    customerId?: number,
    status?: string,
  ) =>
    api
      .get<ApiResponse<SalesWithPayments[]>>('/vw_sales_with_payments', {
        params: { page, limit, total, dateInit, dateEnd, customerId, status },
      })
      .then((r) => r.data),

  getSaleItemsDetail: (
    page = 0,
    limit = 100,
    total = 0,
    saleId?: number,
    productId?: number,
    dateInit?: string,
    dateEnd?: string,
  ) =>
    api
      .get<ApiResponse<SaleItemsDetail[]>>('/vw_sale_items_detail', {
        params: { page, limit, total, saleId, productId, dateInit, dateEnd },
      })
      .then((r) => r.data),
};
