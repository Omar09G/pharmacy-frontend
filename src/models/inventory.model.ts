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

export interface InventoryStock {
  productId: number;
  productName: string;
  barcode: string;
  locationId: number;
  locationName: string;
  qtyOnHand: number;
  maxExpiryDate: string;
  lastMovementAt: string;
}
