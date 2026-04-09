export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  billingAddress: string;
  documentId: string;
  creditLimit: number;
  balance: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  termsDays: number;
}

export interface CustomerCreate {
  id: 0;
  name: string;
  email: string;
  phone: string;
  billingAddress: string;
  documentId: string;
  creditLimit: number;
  status: string;
  termsDays: number;
}

export interface CustomerUpdate {
  name: string;
  email: string;
  phone: string;
  billingAddress: string;
  documentId: string;
  creditLimit: number;
  status: string;
  termsDays: number;
}

export interface CustomerCreditAccount {
  id: number;
  customerId: number;
  balance: number;
  limitAmount: number;
  lastOverdueDate: string;
}

export interface CustomerCreditAccountCreate {
  customerId: number;
  balance: number;
  limitAmount: number;
  lastOverdueDate: string;
}

export interface CustomerCreditAccountUpdate {
  customerId: number;
  balance: number;
  limitAmount: number;
  lastOverdueDate: string;
}
