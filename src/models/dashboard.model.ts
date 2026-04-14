export interface SalesDailySummary {
  day: string;
  salesCount: number | null;
  subtotal: number | null;
  taxTotal: number | null;
  discountTotal: number | null;
  total: number | null;
  totalCredit: number | null;
}

export interface DailyCashCut {
  day: string;
  salesCash: number | null;
  salesNonCash: number | null;
  cashEntriesIn: number | null;
  cashEntriesOut: number | null;
  netCash: number | null;
}

export interface BestSeller30d {
  productId: number;
  sku: string | null;
  productName: string | null;
  qtySold: number | null;
  revenue: number | null;
  salesCount: number | null;
}

export interface CustomerAccountSummary {
  customerId: number;
  customerName: string | null;
  totalInvoiced: number | null;
  totalPaid: number | null;
  balance: number | null;
}

export interface CustomerInvoiceAging {
  invoiceId: number;
  invoiceNo: string | null;
  customerId: number | null;
  customerName: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  paidAmount: number | null;
  outstanding: number | null;
  invoiceStatus: string | null;
  daysOverdue: number | null;
}

export interface DashboardInventoryStock {
  productId: number;
  sku: string | null;
  productName: string | null;
  qtyOnHand: number | null;
  maxExpiryDate: string | null;
  lastMovementAt: string | null;
}

export interface CashJournalBalance {
  cashJournalId: number;
  name: string | null;
  openingAmount: number | null;
  openedAt: string | null;
  closedAt: string | null;
  inflow: number | null;
  outflow: number | null;
  balance: number | null;
}

export interface SalesWithPayments {
  id: number;
  invoiceNo: string | null;
  date: string | null;
  customerId: number | null;
  customerName: string | null;
  userId: number | null;
  userName: string | null;
  subtotal: number | null;
  taxTotal: number | null;
  discountTotal: number | null;
  total: number | null;
  status: string | null;
  isCredit: boolean | null;
  paidAmount: number | null;
  allocatedAmount: number | null;
  outstanding: number | null;
}

export interface SaleItemsDetail {
  saleItemId: number;
  saleId: number | null;
  productId: number | null;
  productName: string | null;
  lotId: number | null;
  qty: number | null;
  unitPrice: number | null;
  discount: number | null;
  taxAmount: number | null;
  lineTotal: number | null;
}
