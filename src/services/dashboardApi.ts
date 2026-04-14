import api from '../api/axiosInstance';
import type {
  SalesDailySummary,
  DailyCashCut,
  BestSeller30d,
  CustomerInvoiceAging,
  DashboardInventoryStock,
  CashJournalBalance,
} from '../models/dashboard.model';

const MOCK_ENABLED = import.meta.env.VITE_MOCK_DASHBOARD === 'true';

// ---------- Mock data generators ----------
function mockDailySales(): SalesDailySummary[] {
  const days: SalesDailySummary[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      day: d.toISOString().slice(0, 10),
      salesCount: Math.floor(Math.random() * 40) + 10,
      subtotal: Math.random() * 8000 + 2000,
      taxTotal: Math.random() * 1200 + 300,
      discountTotal: Math.random() * 400,
      total: Math.random() * 9000 + 2500,
      totalCredit: Math.random() * 1000,
    });
  }
  return days;
}

function mockBestSellers(): BestSeller30d[] {
  const names = [
    'Paracetamol 500mg',
    'Ibuprofeno 400mg',
    'Amoxicilina 500mg',
    'Omeprazol 20mg',
    'Loratadina 10mg',
    'Metformina 850mg',
  ];
  return names.map((n, i) => ({
    productId: i + 1,
    productName: n,
    qtySold: Math.floor(Math.random() * 200) + 50,
    revenue: Math.random() * 5000 + 1000,
    salesCount: Math.floor(Math.random() * 80) + 20,
  }));
}

function mockOverdueInvoices(): CustomerInvoiceAging[] {
  return [
    {
      saleId: 101,
      customerId: 1,
      customerName: 'Juan Pérez',
      invoiceDate: '2024-11-01T10:00:00Z',
      dueDate: '2024-11-30T10:00:00Z',
      outstanding: 1500,
      invoiceStatus: 'overdue',
      daysOverdue: 45,
    },
    {
      saleId: 102,
      customerId: 2,
      customerName: 'María García',
      invoiceDate: '2024-11-15T10:00:00Z',
      dueDate: '2024-12-15T10:00:00Z',
      outstanding: 800,
      invoiceStatus: 'overdue',
      daysOverdue: 30,
    },
    {
      saleId: 103,
      customerId: 3,
      customerName: 'Carlos López',
      invoiceDate: '2024-12-01T10:00:00Z',
      dueDate: '2025-01-01T10:00:00Z',
      outstanding: 2200,
      invoiceStatus: 'open',
      daysOverdue: 0,
    },
  ];
}

function mockLowStock(): DashboardInventoryStock[] {
  return [
    {
      productId: 1,
      productName: 'Paracetamol 500mg',
      barcode: '7501001164720',
      qtyOnHand: 5,
      maxExpiryDate: '2025-06-15T00:00:00Z',
      lastMovementAt: '2025-01-10T08:00:00Z',
    },
    {
      productId: 4,
      productName: 'Omeprazol 20mg',
      barcode: '7501001164721',
      qtyOnHand: 3,
      maxExpiryDate: '2025-04-20T00:00:00Z',
      lastMovementAt: '2025-01-08T10:00:00Z',
    },
    {
      productId: 7,
      productName: 'Aspirina 100mg',
      barcode: '7501001164722',
      qtyOnHand: 2,
      maxExpiryDate: '2025-03-01T00:00:00Z',
      lastMovementAt: '2025-01-05T14:00:00Z',
    },
  ];
}

function mockCashCut(): DailyCashCut {
  return {
    day: new Date().toISOString().slice(0, 10),
    salesCash: 4500,
    salesNonCash: 3200,
    cashEntriesIn: 500,
    cashEntriesOut: 800,
    netCash: 4200,
  };
}

function mockCashJournalBalance(): CashJournalBalance {
  return {
    journalId: 1,
    openingAmount: 2000,
    inflow: 5000,
    outflow: 800,
    balance: 6200,
  };
}

// ---------- Public API ----------
export const dashboardApi = {
  getDailySales: async (): Promise<SalesDailySummary[]> => {
    if (MOCK_ENABLED) return mockDailySales();
    const r = await api.get<SalesDailySummary[]>('/dashboard/daily-sales');
    return r.data;
  },
  getBestSellers: async (): Promise<BestSeller30d[]> => {
    if (MOCK_ENABLED) return mockBestSellers();
    const r = await api.get<BestSeller30d[]>('/dashboard/best-sellers');
    return r.data;
  },
  getOverdueInvoices: async (): Promise<CustomerInvoiceAging[]> => {
    if (MOCK_ENABLED) return mockOverdueInvoices();
    const r = await api.get<CustomerInvoiceAging[]>(
      '/dashboard/overdue-invoices',
    );
    return r.data;
  },
  getLowStock: async (): Promise<DashboardInventoryStock[]> => {
    if (MOCK_ENABLED) return mockLowStock();
    const r = await api.get<DashboardInventoryStock[]>('/dashboard/low-stock');
    return r.data;
  },
  getCashCut: async (): Promise<DailyCashCut> => {
    if (MOCK_ENABLED) return mockCashCut();
    const r = await api.get<DailyCashCut>('/dashboard/cash-cut');
    return r.data;
  },
  getCashJournalBalance: async (): Promise<CashJournalBalance> => {
    if (MOCK_ENABLED) return mockCashJournalBalance();
    const r = await api.get<CashJournalBalance>(
      '/dashboard/cash-journal-balance',
    );
    return r.data;
  },
};
