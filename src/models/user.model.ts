export interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreate {
  id: 0;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  status: string;
  createdAt: string;
  updatedBy: string;
}

export interface UserUpdate {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  updatedBy: number;
}

export interface UserChangePassword {
  username: string;
  password: string;
}

export interface UserChangeStatus {
  status: string;
  username: string;
  updatedBy: number;
}
