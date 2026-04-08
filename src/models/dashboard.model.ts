export interface SalesDailySummary {
  day: string;
  salesCount: number;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  totalCredit: number;
}

export interface DailyCashCut {
  day: string;
  salesCash: number;
  salesNonCash: number;
  cashEntriesIn: number;
  cashEntriesOut: number;
  netCash: number;
}

export interface BestSeller30d {
  productId: number;
  productName: string;
  qtySold: number;
  revenue: number;
  salesCount: number;
}

export interface CustomerAccountSummary {
  customerId: number;
  customerName: string;
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
}

export interface CustomerInvoiceAging {
  saleId: number;
  customerId: number;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  outstanding: number;
  invoiceStatus: 'paid' | 'open' | 'overdue';
  daysOverdue: number;
}

export interface DashboardInventoryStock {
  productId: number;
  productName: string;
  barcode: string;
  qtyOnHand: number;
  maxExpiryDate: string;
  lastMovementAt: string;
}

export interface CashJournalBalance {
  journalId: number;
  openingAmount: number;
  inflow: number;
  outflow: number;
  balance: number;
}
