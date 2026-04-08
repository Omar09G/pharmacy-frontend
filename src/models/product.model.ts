export interface Product {
  id: number;
  productName: string;
  genericName: string;
  barcode: string;
  presentation: string;
  categoryId: number;
  categoryName?: string;
  supplierId: number;
  supplierName?: string;
  purchasePrice: number;
  sellingPrice: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  expirationDate: string;
  requiresPrescription: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreate {
  id: 0;
  productName: string;
  genericName: string;
  barcode: string;
  presentation: string;
  categoryId: number;
  supplierId: number;
  purchasePrice: number;
  sellingPrice: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  expirationDate: string;
  requiresPrescription: boolean;
  active: boolean;
}

export interface AddProductRequest {
  id: 0;
  productName: string;
  genericName: string;
  barcode: string;
  presentation: string;
  categoryId: number;
  supplierId: number;
  purchasePrice: number;
  sellingPrice: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  expirationDate: string;
  requiresPrescription: boolean;
  active: boolean;
}

export interface AddProductResponse {
  id: number;
  productName: string;
  barcode: string;
  sellingPrice: number;
}
