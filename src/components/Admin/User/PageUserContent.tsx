export type UserRequest = {
  userId: number;
  name: string;
  email: string;
  role: string;
  active?: boolean;
  createdAt?: string;
};

export type UserResponse = {
  items: UserRequest[];
  total: number;
};

import React from 'react';
import UserPage from '../../../features/admin/user/UserPage';

const PageUserContent: React.FC = () => {
  return <UserPage />;
};

export default PageUserContent;
