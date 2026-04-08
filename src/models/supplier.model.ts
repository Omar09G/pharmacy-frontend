export interface Supplier {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  rfc: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierCreate {
  id: 0;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  rfc: string;
  active: boolean;
}

export interface SupplierUpdate {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  rfc: string;
  active: boolean;
}
