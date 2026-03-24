export type User = {
  id: number;
  country: string | null;
  firstname: string | null;
  lastname: string;
  password: string | null;
  role: ROLE;
  username: string;
};

export type ROLE = 'ADMIN' | 'USER';

export type UserResponse = Omit<User, 'password' | 'country'>;

export type UserRequest = User;

export type UserUpdateRequest = Partial<UserRequest> & { id: number };

export type UserFormValues = {
  country: string;
  firstname: string;
  lastname: string;
  password: string;
  role: ROLE;
  username: string;
};

export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;
