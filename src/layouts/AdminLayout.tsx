import React from 'react';
import { Outlet } from 'react-router';
import Sidebar from '../components/shared/Sidebar';
import Topbar from '../components/shared/Topbar';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
