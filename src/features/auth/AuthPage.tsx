import React from 'react';
import useAuth from './hooks/useAuth';
import LoginForm from '../../components/Login/LoginForm';

const AuthContent: React.FC = () => {
  const { user, signOut } = useAuth();

  if (user) {
    return (
      <div className="max-w-md mx-auto p-6 bg-surface rounded shadow text-center">
        <h2 className="text-2xl mb-2">
          Bienvenido, {user.name || user.username}
        </h2>
        <p className="mb-4">Has iniciado sesión correctamente.</p>
        <button
          onClick={signOut}
          className="bg-danger text-white px-4 py-2 rounded"
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return <LoginForm />;
};

const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <AuthContent />
    </div>
  );
};

export default AuthPage;
