import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from 'react';
import { ProductRequest } from '../../../components/Product/Utils/UtilsProduct';
import productService from '../services/productService';

type State = {
  items: ProductRequest[];
  itemsFilter: ProductRequest[];
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
      payload: {
        items: ProductRequest[];
        itemsFilter: ProductRequest[];
        total: number;
        page: number;
      };
    }
  | { type: 'setLimit'; payload: number }
  | { type: 'setItems'; payload: ProductRequest[] }
  | { type: 'clear' }
  | { type: 'add'; payload: ProductRequest }
  | { type: 'update'; payload: ProductRequest }
  | { type: 'remove'; payload: number }
  | { type: 'clearError' };

const initial: State = {
  items: [],
  itemsFilter: [],
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
        itemsFilter: action.payload.items,
        total: action.payload.total,
        page: action.payload.page,
      };
    case 'setLimit':
      return { ...state, limit: action.payload };
    case 'setItems':
      return { ...state, items: action.payload };
    case 'clear':
      return { ...initial };
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
        items: state.items.map((p) =>
          p.productId === action.payload.productId ? action.payload : p,
        ),
      };
    case 'remove':
      return {
        ...state,
        loading: false,
        items: state.items.filter((p) => p.productId !== action.payload),
        total: Math.max(0, state.total - 1),
      };
    case 'clearError':
      return { ...state, error: null };
    default:
      return state;
  }
}

type ContextType = State & {
  fetchPage: (page?: number) => Promise<void>;
  create: (data: Omit<ProductRequest, 'productId'>) => Promise<void>;
  edit: (id: number, data: Partial<ProductRequest>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  setLimit: (limit: number) => void;
  setError: () => void;
  setItems: () => void;
  clearVista: () => void;
  buscarProducto: (productName: string) => void;
  fetchPageProductDetail: (page: number, productName: string) => Promise<void>;
};

const ProductContext = createContext<ContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initial);

  const fetchPage = useCallback(
    async (page = 1, limitParam?: number) => {
      console.count('product.fetchPage');
      try {
        dispatch({ type: 'loading' });
        const limitToUse =
          typeof limitParam === 'number' ? limitParam : state.limit;
        const res = await productService.fetchProducts(
          page,
          limitToUse,
          state.total,
        );
        dispatch({
          type: 'set',
          payload: {
            items: res.items,
            itemsFilter: res.items,
            total: res.total,
            page,
          },
        });
      } catch (err: unknown) {
        let message = 'Fetch error';
        if (err instanceof Error) message = err.message;
        dispatch({ type: 'error', payload: message });
      }
    },
    [state.limit, state.total],
  );

  const fetchPageProductDetail = useCallback(
    async (page = 1, productName: string) => {
      try {
        dispatch({ type: 'loading' });
        const res = await productService.getProductDetails(
          page,
          state.limit,
          state.total,
          productName,
        );
        dispatch({
          type: 'set',
          payload: {
            items: res.items,
            itemsFilter: res.items,
            total: res.total,
            page,
          },
        });
      } catch (err: unknown) {
        let message = 'Fetch error';
        if (err instanceof Error) message = err.message;
        dispatch({ type: 'error', payload: 'Product not Found  ' + message });
      }
    },
    [state.limit, state.total],
  );

  const create = useCallback(
    async (data: Omit<ProductRequest, 'productId'>) => {
      console.count('product.create');
      try {
        dispatch({ type: 'loading' });
        const created = await productService.createProduct(data);
        dispatch({ type: 'add', payload: created });
      } catch (err: unknown) {
        let message = 'Create error';
        if (err instanceof Error) message = err.message;
        dispatch({ type: 'error', payload: message });
      }
    },
    [],
  );

  const edit = useCallback(
    async (id: number, data: Partial<ProductRequest>) => {
      console.count('product.edit');
      try {
        dispatch({ type: 'loading' });
        const updated = await productService.updateProduct(id, data);
        dispatch({ type: 'update', payload: updated });
      } catch (err: unknown) {
        let message = 'Update error';
        if (err instanceof Error) message = err.message;
        dispatch({ type: 'error', payload: message });
      }
    },
    [],
  );

  const remove = useCallback(async (id: number) => {
    console.count('product.remove');
    try {
      dispatch({ type: 'loading' });
      await productService.deleteProduct(id);
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
      // fetch page with new limit
      fetchPage(1, limit);
    },
    [fetchPage],
  );

  const setError = useCallback(() => {
    dispatch({ type: 'clearError' });
  }, []);

  const setItems = useCallback(() => {
    dispatch({ type: 'setItems', payload: [] });
  }, []);

  // removed unused setItemsProduct to satisfy lint rules

  const clearVista = useCallback(() => {
    dispatch({ type: 'clear' });
  }, []);

  const buscarProducto = useCallback(
    (productName: string) => {
      const newItems = state.itemsFilter.filter((p) =>
        p.productName.startsWith(productName),
      );
      dispatch({ type: 'setItems', payload: newItems });
    },
    [state.itemsFilter],
  );

  return (
    <ProductContext.Provider
      value={{
        ...state,
        fetchPage,
        create,
        edit,
        remove,
        setLimit,
        setError,
        setItems,
        clearVista,
        fetchPageProductDetail,
        buscarProducto,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductStore = () => {
  const ctx = useContext(ProductContext);
  if (!ctx)
    throw new Error('useProductStore must be used within ProductProvider');
  return ctx;
};

export default ProductContext;
