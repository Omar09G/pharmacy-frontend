export interface Purchase {
  id: number;
  supplierId: number;
  invoiceNo: string;
  date: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  status: string;
  createdAt: string;
  createdBy: number;
}

export interface PurchaseItem {
  id: 0;
  purchaseId: number;
  productId: number;
  lotId?: number;
  qty: number;
  unitCost: number;
  discount?: number;
  taxAmount?: number;
  lineTotal: number;
}

export interface PurchasePayment {
  id: 0;
  purchaseId: number;
  amount: number;
  methodId?: number;
  paidAt: string;
  reference?: string;
}

export interface PurchasePaymentCreate {
  purchaseId: number;
  amount: number;
  methodId?: number;
  paidAt: string;
  reference?: string;
}

export interface PurchaseCreate {
  supplierId: number;
  invoiceNo: string;
  date: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  status: string;
  createdAt: string;
  createdBy: number;
  payment: PurchasePaymentCreate;
}

export interface PurchaseUpdate {
  id: number;
  status: string;
}
