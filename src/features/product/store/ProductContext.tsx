import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ProductRequest } from '../../../components/Product/Utils/UtilsProduct';
import productService from '../services/productService';

type State = {
  items: ProductRequest[];
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
      payload: { items: ProductRequest[]; total: number; page: number };
    }
  | { type: 'add'; payload: ProductRequest }
  | { type: 'update'; payload: ProductRequest }
  | { type: 'remove'; payload: number };

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
  fetchPageProductDetail: (page: number, productName: string) => Promise<void>;
};

const ProductContext = createContext<ContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initial);

  const fetchPage = async (page = 1) => {
    try {
      dispatch({ type: 'loading' });
      const res = await productService.fetchProducts(
        page,
        state.limit,
        state.total,
      );
      // expecting { items, total }

      dispatch({
        type: 'set',
        payload: { items: res.items, total: res.total, page },
      });
    } catch (err: any) {
      dispatch({ type: 'error', payload: err.message || 'Fetch error' });
    }
  };

  const fetchPageProductDetail = async (page = 1, productName: string) => {
    try {
      dispatch({ type: 'loading' });
      const res = await productService.getProductDetails(
        page,
        state.limit,
        state.total,
        productName,
      );
      // expecting { items, total }

      dispatch({
        type: 'set',
        payload: { items: res.items, total: res.total, page },
      });
    } catch (err: any) {
      dispatch({ type: 'error', payload: err.message || 'Fetch error' });
    }
  };

  const create = async (data: Omit<ProductRequest, 'productId'>) => {
    try {
      dispatch({ type: 'loading' });
      const created = await productService.createProduct(data);
      dispatch({ type: 'add', payload: created });
    } catch (err: any) {
      dispatch({ type: 'error', payload: err.message || 'Create error' });
    }
  };

  const edit = async (id: number, data: Partial<ProductRequest>) => {
    try {
      dispatch({ type: 'loading' });
      const updated = await productService.updateProduct(id, data);
      dispatch({ type: 'update', payload: updated });
    } catch (err: any) {
      dispatch({ type: 'error', payload: err.message || 'Update error' });
    }
  };

  const remove = async (id: number) => {
    try {
      dispatch({ type: 'loading' });
      await productService.deleteProduct(id);
      dispatch({ type: 'remove', payload: id });
    } catch (err: any) {
      dispatch({ type: 'error', payload: err.message || 'Delete error' });
    }
  };

  const setLimit = (limit: number) => {
    state.limit = limit;
    fetchPage(state.page);
  };

  return (
    <ProductContext.Provider
      value={{
        ...state,
        fetchPage,
        create,
        edit,
        remove,
        setLimit,
        fetchPageProductDetail,
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
