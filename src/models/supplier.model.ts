export interface Supplier {
  id: number;
  name: string;
  taxId: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
}

export interface SupplierCreate {
  name: string;
  taxId: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
}

export interface SupplierUpdate {
  name: string;
  taxId: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}
