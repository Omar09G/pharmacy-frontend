export interface PaymentMethod {
  id: number;
  name: string;
  methodType: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodCreate {
  id: 0;
  name: string;
  methodType: string;
  active: boolean;
}
