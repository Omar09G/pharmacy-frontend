import React, { useState } from 'react';
import useAuth from '../../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router';

const LoginForm: React.FC = () => {
  const { signIn, loading, error } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!username || !password)
      return setLocalError('Username y contraseña son requeridos');
    try {
      await signIn(username, password);
      const from = '/pharmacy';
      navigate(from, { replace: true });
    } catch (err) {
      // error will be provided by context
      console.log(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm mx-auto p-6 bg-fuchsia-300 text-black rounded shadow"
    >
      <h2 className="text-2xl font-semibold mb-4">Iniciar sesión Farmacia</h2>

      <label className="block mb-2">
        <span className="text-sm">Username</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
          required
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
          required
        />
      </label>

      {(localError || error) && (
        <p className="text-danger mb-3">{localError || error}</p>
      )}

      <button
        type="submit"
        className="w-full bg-accent bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-full"
        disabled={loading}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
};

export default LoginForm;
