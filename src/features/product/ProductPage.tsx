import React from 'react';
import { ProductProvider } from './store/ProductContext';
import ProductList from './components/ProductList';
import AppFooter from '../../components/Home/PageFooter';
import AppMenu from '../../components/Home/PageMenu';

const ProductPage: React.FC = () => {
  return (
    <ProductProvider>
      <div className="min-h-screen flex flex-col ">
        <AppMenu />
        <div className="max-w-6xl mx-auto px-4 py-6 flex-1 flex">
          <ProductList />
        </div>
        <AppFooter />
      </div>
      ;
    </ProductProvider>
  );
};

export default ProductPage;
