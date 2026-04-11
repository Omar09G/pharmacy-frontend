export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  brand: string;
  categoryId: number;
  unitId: number;
  isSellable: boolean;
  trackBatches: boolean;
  taxProfileId: number;
  defaultCost: number;
  purchasePrice: number;
  wholesalePrice: number;
  salePrice: number;
  defaultPrice: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  pricesDetail?: ProductPrice;
  lotsDetail?: ProductLot;
  barcodesDetail?: ProductBarcode;
}

export interface ProductCreate {
  sku: string;
  name: string;
  description: string;
  brand: string;
  categoryId: number;
  unitId: number;
  isSellable: boolean;
  trackBatches: boolean;
  taxProfileId: number;
  defaultCost: number;
  purchasePrice: number;
  wholesalePrice: number;
  salePrice: number;
  defaultPrice: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  pricesDetail?: ProductPriceCreate;
  lotsDetail?: ProductLotCreate;
  barcodesDetail?: ProductBarcodeCreate;
}

export type ProductUpdate = Partial<Product>;

export interface ProductPrice {
  id: number;
  productId: number;
  priceType: string;
  price: number;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

export type ProductPriceCreate = Omit<ProductPrice, 'id' | 'productId'>;

export type ProductPriceUpdate = Partial<ProductPriceCreate>;

export interface ProductLot {
  id: number;
  productId: number;
  lotNumber: string;
  qtyOnHand: number;
  expiryDate: string;
  purchaseId: number;
  createdAt: string;
}

export type ProductLotCreate = Omit<ProductLot, 'id' | 'productId'>;

export type ProductLotUpdate = Partial<ProductLotCreate>;

export interface ProductBarcode {
  id: number;
  productId: number;
  barcode: string;
  barcodeType: string;
  createdAt: string;
}

export type ProductBarcodeCreate = Omit<ProductBarcode, 'id' | 'productId'>;

export type ProductBarcodeUpdate = Partial<ProductBarcodeCreate>;

export interface UnitDetail {
  id: number;
  name: string;
  code: string;
  precision: number;
}

export interface TaxProfileDetail {
  id: number;
  name: string;
  rate: number;
  isInclusive: boolean;
  description?: string;
}
