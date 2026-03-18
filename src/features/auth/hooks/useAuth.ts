import { useCallback } from 'react';
import { useAuthContext } from '../store/authContext';

export const useAuth = () => {
  const { user, token, loading, error, login, logout } = useAuthContext();

  const signIn = useCallback(
    async (username: string, password: string) => {
      await login(username, password);
    },
    [login],
  );

  const signOut = useCallback(() => logout(), [logout]);

  return { user, token, loading, error, signIn, signOut };
};

export default useAuth;
