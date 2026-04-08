export interface Sale {
  id: number;
  customerId: number;
  customerName?: string;
  userId: number;
  userName?: string;
  discountId: number | null;
  saleDate: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: 0;
  productId: number;
  productName?: string;
  qty: number;
  unitPrice: number;
  discountAmount: number;
}

export interface SalePayment {
  id: 0;
  paymentMethodId: number;
  paymentMethodName?: string;
  amount: number;
  reference: string;
}

export interface SaleCreate {
  id: 0;
  customerId: number;
  userId: number;
  discountId: number | null;
  saleDate: string;
  notes: string;
  items: SaleItem[];
  payment: SalePayment;
}

export interface AddSaleRequest {
  id: 0;
  customerId: number;
  userId: number;
  discountId: number | null;
  date: string;
  notes: string;
  items: SaleItem[];
  paymentMethodId: number;
  paymentMethodName?: string;
  total: number;
  subtotal: number;
  reference: string;
  taxTotal: number;
  discountTotal: number;
  status: string;
  isCredit: boolean;
  createdAt: string;
}
