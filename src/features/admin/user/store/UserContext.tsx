import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useState,
  useEffect,
} from 'react';

import userService from '../services/userService';
import {
  UserRequest,
  UserResponse,
} from '../../../../components/Admin/User/Utils/utils';

// Declare global setter on window to avoid `any` casts and satisfy ESLint
declare global {
  interface Window {
    __USER_CTX_SETTER__?: (u: UserRequest | null) => void;
  }
}

type State = {
  items: UserResponse[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error?: string | null;
};

type Actions =
  | { type: 'loading' }
  | { type: 'error'; payload: string }
  | {
      type: 'set';
      payload: { items: UserResponse[]; total: number; page: number };
    }
  | { type: 'setLimit'; payload: number }
  | { type: 'add'; payload: UserRequest }
  | { type: 'update'; payload: UserRequest }
  | { type: 'remove'; payload: number }
  | { type: 'clear' }
  | { type: 'clearError' };

const initial: State = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
};

function reducer(state: State, action: Actions): State {
  switch (action.type) {
    case 'loading':
      return { ...state, loading: true, error: null };
    case 'error':
      return { ...state, loading: false, error: action.payload };
    case 'set':
      return {
        ...state,
        loading: false,
        items: action.payload.items,
        total: action.payload.total,
        page: action.payload.page,
      };
    case 'setLimit':
      return {
        ...state,
        limit: action.payload,
      };
    case 'add':
      return {
        ...state,
        loading: false,
        items: [action.payload, ...state.items],
        total: state.total + 1,
      };
    case 'update':
      return {
        ...state,
        loading: false,
        items: state.items.map((u) =>
          u.id === action.payload.id ? action.payload : u,
        ),
      };
    case 'remove':
      return {
        ...state,
        loading: false,
        items: state.items.filter((u) => u.id !== action.payload),
        total: Math.max(0, state.total - 1),
      };
    case 'clear':
      return { ...initial };
    case 'clearError':
      return { ...state, error: null };
    default:
      return state;
  }
}

type ContextType = State & {
  fetchPage: (page?: number) => Promise<void>;
  create: (data: UserRequest) => Promise<void>;
  edit: (id: number, data: Partial<UserRequest>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  setLimit: (limit: number) => void;
  clearError: () => void;
  clearAll: () => void;
  selectedUser: UserRequest | null;
  setSelectedUser: (u: UserRequest | null) => void;
};

const UserContext = createContext<ContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initial);
  const [selectedUser, setSelectedUser] = useState<UserRequest | null>(null);

  const fetchPage = useCallback(
    async (page = 1, limitParam?: number) => {
      try {
        dispatch({ type: 'loading' });
        const limitToUse =
          typeof limitParam === 'number' ? limitParam : state.limit;
        const res = await userService.fetchUsers(page, limitToUse, state.total);
        dispatch({
          type: 'set',
          payload: { items: res.items, total: res.total, page },
        });
      } catch (err: unknown) {
        let message = 'Fetch error';
        if (err instanceof Error) message = err.message;
        dispatch({ type: 'error', payload: message });
      }
    },
    [state.limit, state.total],
  );

  const create = useCallback(async (data: UserRequest) => {
    try {
      dispatch({ type: 'loading' });
      const created = await userService.createUser(data);
      dispatch({ type: 'add', payload: created });
    } catch (err: unknown) {
      let message = 'Create error';
      if (err instanceof Error) message = err.message;
      dispatch({ type: 'error', payload: message });
    }
  }, []);

  useEffect(() => {
    // expose a small bridge for lightweight selection from components
    if (typeof window !== 'undefined') {
      window.__USER_CTX_SETTER__ = setSelectedUser;
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.__USER_CTX_SETTER__ = undefined;
      }
    };
  }, [setSelectedUser]);

  const edit = useCallback(async (id: number, data: Partial<UserRequest>) => {
    try {
      dispatch({ type: 'loading' });
      const updated = await userService.updateUser(id, data);
      dispatch({ type: 'update', payload: updated });
    } catch (err: unknown) {
      let message = 'Update error';
      if (err instanceof Error) message = err.message;
      dispatch({ type: 'error', payload: message });
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'loading' });
      await userService.deleteUser(id);
      dispatch({ type: 'remove', payload: id });
    } catch (err: unknown) {
      let message = 'Delete error';
      if (err instanceof Error) message = err.message;
      dispatch({ type: 'error', payload: message });
    }
  }, []);

  const setLimit = useCallback(
    (limit: number) => {
      dispatch({ type: 'setLimit', payload: limit });
      // reset to first page when changing limit
      fetchPage(1, limit);
    },
    [fetchPage],
  );

  const clearError = useCallback(() => dispatch({ type: 'clearError' }), []);
  const clearAll = useCallback(() => dispatch({ type: 'clear' }), []);

  return (
    <UserContext.Provider
      value={{
        ...state,
        fetchPage,
        create,
        edit,
        remove,
        setLimit,
        clearError,
        clearAll,
        selectedUser,
        setSelectedUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserStore = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUserStore must be used within UserProvider');
  return ctx;
};

export default UserContext;
