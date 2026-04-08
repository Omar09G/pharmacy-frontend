export interface Purchase {
  id: number;
  supplierId: number;
  supplierName?: string;
  userId: number;
  userName?: string;
  date: string;
  invoiceNo: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  id: 0;
  productId: number;
  productName?: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchasePayment {
  id: 0;
  paymentMethodId: number;
  amount: number;
  reference: string;
}

export interface PurchaseCreate {
  id: 0;
  supplierId: number;
  userId: number;
  date: string;
  invoiceNo: string;
  notes: string;
  items: PurchaseItem[];
  payment: PurchasePayment;
}
