import { createContext, useContext } from 'react';
import { AuthContextValue } from '../utils/Utils';

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
