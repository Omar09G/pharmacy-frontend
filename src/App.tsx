import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import AuthPage from './features/auth/AuthPage';
import RequireAuth from './features/auth/components/RequireAuth';
import ProductPage from './features/product/ProductPage';
import HomePage from './pages/Home/HomePage';
import AdminPage from './pages/Admin/AdminPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/pharmacy"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
      <Route
        path="/pharmacy/product"
        element={
          <RequireAuth>
            <ProductPage />
          </RequireAuth>
        }
      />

      <Route
        path="/pharmacy/admin"
        element={
          <RequireAuth>
            <AdminPage />
          </RequireAuth>
        }
      />
      <Route path="/login" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/pharmacy" replace />} />
    </Routes>
  );
};

export default App;
