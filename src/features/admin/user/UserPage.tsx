import React from 'react';
import { UserProvider } from './store/UserContext';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import AppMenu from '../../../components/Home/PageMenu';
import AppFooter from '../../../components/Home/PageFooter';

const UserPage: React.FC = () => {
  return (
    <UserProvider>
      <div className="min-h-screen flex flex-col ">
        <AppMenu />
        <div className="max-w-6xl mx-auto px-4 py-6 flex-1 grid grid-cols-2 gap-6">
          <UserForm />
          <UserList />
        </div>
        <AppFooter />
      </div>
    </UserProvider>
  );
};

export default UserPage;
