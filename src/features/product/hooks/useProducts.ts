import { useEffect } from 'react';
import { useProductStore } from '../store/ProductContext';

export function useProducts() {
  const store = useProductStore();

  useEffect(() => {
    store.fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}

export default useProducts;
