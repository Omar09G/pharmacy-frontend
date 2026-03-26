import React from 'react';
import { SaleProvider } from './store/SaleContext';
import SalesForm from './components/SalesForm';
import SalesFilters from './components/SalesFilters';
import SalesList from './components/SalesList';
import SalesDetail from './components/SalesDetail';
import AppMenu from '../../components/Home/PageMenu';
import AppFooter from '../../components/Home/PageFooter';

const SalesPage: React.FC = () => {
  return (
    <SaleProvider>
      <div className="min-h-screen flex flex-col">
        <AppMenu />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
          <h1 className="text-2xl font-bold text-fuchsia-700 mb-6">Ventas</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <SalesFilters />
              <SalesList />
            </div>
            <div className="space-y-5">
              <SalesForm />
              <SalesDetail />
            </div>
          </div>
        </main>
        <AppFooter />
      </div>
    </SaleProvider>
  );
};

export default SalesPage;
