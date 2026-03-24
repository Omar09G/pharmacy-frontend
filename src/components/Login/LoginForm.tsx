import React, { useEffect, useState } from 'react';
import useAuth from '../../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import { showSuccess } from '../Alerts/AlertsComponent';

const LoginForm: React.FC = () => {
  const { signIn, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(username, password);
      showSuccess('Bienvenido: ', username);
      navigate('/pharmacy', { replace: true });
    } catch (err) {
      // error will be provided by context
      console.log(err);
    }
  };

  useEffect(() => {
    if (error) {
      Swal.fire({
        title: 'Ocurrio un Error',
        html: error,
        icon: 'error',
        iconColor: 'red',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'custom-popup',
          confirmButton: 'custom-button',
        },
      }).then(() => {
        setError('');
        setUsername('');
        setPassword('');
      });
    }
  }, [error, setError]);

  return (
    <div className="min-h-screen bg-gradient from-fuchsia-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-fuchsia-100 rounded-full p-3 mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-10 h-10 text-fuchsia-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M21.41 11.58a2 2 0 010 2.83l-7.02 7.02a4 4 0 01-5.66 0l-1.06-1.06a4 4 0 010-5.66l7.02-7.02a2 2 0 012.83 0l1.89 1.89z" />
              <path d="M7.5 7.5l9 9" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
          <p className="text-sm text-gray-500">
            Farmacia Santo Niño — Calidad y confianza
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="py-2">Username:</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-all"
              required
              placeholder="Username"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="py-2">Password:</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-all pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-fuchsia-600"
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.958 9.958 0 012.175-5.675" />
                    <path
                      d="M3 3l18 18"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-fuchsia-300 text-fuchsia-600 focus:ring-fuchsia-500"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a
              href="#"
              className="text-sm text-fuchsia-600 hover:text-fuchsia-500"
            >
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2.5 rounded-full shadow-md transition transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M12 5l7 7-7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?
          <a
            href="#"
            className="text-fuchsia-600 hover:text-fuchsia-500 font-medium ml-2"
          >
            Regístrate
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
