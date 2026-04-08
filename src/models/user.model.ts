export interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  active: string;
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
  active: string;
}

export interface UserUpdate {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  active: string;
}

export interface UserChangePassword {
  oldPassword: string;
  newPassword: string;
}

export interface UserChangeStatus {
  active: string;
}
