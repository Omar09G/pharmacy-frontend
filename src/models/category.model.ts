export interface Category {
  id: number;
  name: string;
  description: string;
  parentId?: number;
}

export interface CategoryCreate {
  id: 0;
  name: string;
  description: string;
  parentId?: number;
}
