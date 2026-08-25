export interface InventoryMovement {
  id: number;
  productId: number;
  productName?: string;
  locationId: number;
  locationName?: string;
  movementType: string;
  quantity: number;
  referenceId: number;
  referenceType: string;
  notes: string;
  createdAt: string;
}

export interface InventoryLocation {
  id: number;
  locationName: string;
  locationType: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductLotRequest {
  productId: number;
  lotNumber: string;
  qtyOnHand: number;
  expiryDate: string | null;
  purchaseId: number | null;
  createdAt?: string;
}

export interface ProductLot {
  id: number;
  productId: number;
  lotNumber: string | null;
  qtyOnHand: number;
  expiryDate: string | null;
  purchaseId: number | null;
  createdAt: string;
}

export interface ProductLotIdResponse {
  id: number;
}
