export interface Discount {
  id: number;
  name: string;
  description: string;
  percentage: number;
  value: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCreate {
  id: 0;
  name: string;
  description: string;
  percentage: number;
  value: number;
  startDate: string;
  endDate: string;
  active: boolean;
}
