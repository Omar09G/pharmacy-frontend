export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  rfc: string;
  creditLimit: number;
  balance: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCreate {
  id: 0;
  name: string;
  email: string;
  phone: string;
  address: string;
  rfc: string;
  creditLimit: number;
  active: boolean;
}

export interface CustomerUpdate {
  name: string;
  email: string;
  phone: string;
  address: string;
  rfc: string;
  creditLimit: number;
  active: boolean;
}

export interface CustomerCreditAccount {
  id: number;
  customerId: number;
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
}
