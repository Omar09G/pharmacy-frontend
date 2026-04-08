export interface Category {
  id: number;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreate {
  id: 0;
  name: string;
  description: string;
  active: boolean;
}
