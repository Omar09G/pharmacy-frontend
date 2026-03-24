import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { showError } from '../../components/Alerts/AlertsComponent';
import { ADMIN_ROLE } from '../../utils/Utils';
import UserPage from '../../features/admin/user/UserPage';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== ADMIN_ROLE) {
      showError(
        'Acceso denegado. No tienes permisos para acceder a esta página.',
      );
      const t = setTimeout(() => navigate('/pharmacy', { replace: true }), 1);
      return () => clearTimeout(t);
    }
  }, [user, navigate]);

  if (!user) return null;
  if (user.role !== ADMIN_ROLE) return null;

  return (
    <div className="min-h-screen flex flex-col ">
      <UserPage />
    </div>
  );
};

export default AdminPage;
