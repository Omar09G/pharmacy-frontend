export interface Discount {
  id: number;
  code?: string;
  name: string;
  description?: string;
  discountType: string;
  value: number;
  appliesTo: string;
  productId?: number;
  categoryId?: number;
  customerId?: number;
  minQty?: number;
  maxUses?: number;
  priority?: number;
  startAt: string;
  endAt: string;
  active: boolean;
  createdAt: string;
  createdBy: number;
}

export interface DiscountCreate {
  id: 0;
  code?: string;
  name: string;
  description?: string;
  discountType: string;
  value: number;
  appliesTo: string;
  productId?: number;
  categoryId?: number;
  customerId?: number;
  minQty?: number;
  maxUses?: number;
  priority?: number;
  startAt?: string;
  endAt?: string;
  active: boolean;
  createdAt: string;
  createdBy?: number;
}
