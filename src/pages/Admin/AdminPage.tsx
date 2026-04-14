import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import { showError } from '../../utils/alerts';
import { ROLES } from '../../utils/constants';

const AdminPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== ROLES.ADMIN) {
      showError(
        'Acceso denegado. No tienes permisos para acceder a esta página.',
      );
      const t = setTimeout(
        () => navigate('/app/dashboard', { replace: true }),
        1,
      );
      return () => clearTimeout(t);
    }
  }, [user, navigate]);

  if (!user) return null;
  if (user.role !== ROLES.ADMIN) return null;

  return (
    <div className="min-h-screen flex flex-col ">
      <p>Admin</p>
    </div>
  );
};

export default AdminPage;
