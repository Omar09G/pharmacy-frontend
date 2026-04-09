export interface Product {
  id: number;
  sku?: string;
  name: string;
  barcode: string;
  barcodeType?: string;
  description?: string;
  lotNumber?: string;
  qtyOnHand: number;
  expiryDate?: string;
  purchaseId?: number;
  priceType: string;
  price: number;
  brand?: string;
  categoryId: number;
  unitId: number;
  isSellable?: boolean;
  trackBatches?: boolean;
  taxProfileId?: number;
  defaultCost?: number;
  purchasePrice?: number;
  wholesalePrice?: number;
  salePrice: number;
  defaultPrice: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface ProductCreate {
  id: 0;
  sku?: string;
  name: string;
  barcode: string;
  barcodeType?: string;
  description?: string;
  lotNumber?: string;
  qtyOnHand: number;
  expiryDate?: string;
  purchaseId?: number;
  priceType: string;
  price: number;
  brand?: string;
  categoryId: number;
  unitId: number;
  isSellable?: boolean;
  trackBatches?: boolean;
  taxProfileId?: number;
  defaultCost?: number;
  purchasePrice?: number;
  wholesalePrice?: number;
  salePrice: number;
  defaultPrice: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface AddProductRequest {
  id: 0;
  sku: string;
  name: string;
  barcode: string;
  description: string;
  qtyOnHand: string;
  price: string;
  taxProfileId: number;
  purchasePrice: string;
  wholesalePrice: string;
  salePrice: string;
  defaultPrice: string;
}

export interface AddProductResponse {
  id: number;
  productName: string;
  barcode: string;
  sellingPrice: number;
}
