export interface PaymentMethod {
  id: number;
  name: string;
  methodType: string;
  active: boolean;
}

export interface PaymentMethodCreate {
  id: 0;
  name: string;
  methodType: string;
  active: boolean;
}
