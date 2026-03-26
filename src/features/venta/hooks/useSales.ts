import { useContext } from 'react';
import SaleContext from '../store/SaleContext';

export const useSaleContext = () => {
  const ctx = useContext(SaleContext);
  if (!ctx) throw new Error('useSaleContext must be used inside SaleProvider');
  return ctx;
};

export const useSales = () => {
  return useSaleContext();
};

export default useSales;
