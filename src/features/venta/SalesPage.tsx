import React, { useState } from 'react';
import { SaleProvider } from './store/SaleContext';
import SalesForm from './components/SalesForm';
import SalesFilters from './components/SalesFilters';
import SalesList from './components/SalesList';
import SalesDetail from './components/SalesDetail';
import AppMenu from '../../components/Home/PageMenu';
import AppFooter from '../../components/Home/PageFooter';

const SalesPage: React.FC = () => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <SaleProvider>
      <div className="min-h-screen flex flex-col">
        <AppMenu />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h1 className="text-2xl md:text-3xl font-bold text-fuchsia-700">
              Punto de Venta
            </h1>
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block w-4 h-4 mr-2 -mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Busqueda
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <SalesForm />
            </div>
          </div>

          {historyOpen && (
            <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
              <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Busqueda</h2>
                  <button
                    type="button"
                    onClick={() => setHistoryOpen(false)}
                    className="text-slate-500 hover:text-slate-700 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline-block w-4 h-4 mr-2 -mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cerrar
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <SalesFilters />
                  <SalesList
                    onViewDetail={() => {
                      setDetailOpen(true);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {detailOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
                    Detalle de Venta
                  </h2>
                  <button
                    type="button"
                    onClick={() => setDetailOpen(false)}
                    className="text-slate-500 hover:text-slate-700 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline-block w-4 h-4 mr-2 -mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cerrar
                  </button>
                </div>
                <div className="p-5">
                  <SalesDetail />
                </div>
              </div>
            </div>
          )}
        </main>
        <AppFooter />
      </div>
    </SaleProvider>
  );
};

export default SalesPage;
