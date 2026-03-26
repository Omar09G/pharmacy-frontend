import React from 'react';
import { SalesResponse } from '../ventaDto/ventaDto';
import useSales from '../hooks/useSales';

type Props = {
  onViewDetail?: () => void;
};

const SalesList: React.FC<Props> = ({ onViewDetail }) => {
  const {
    sales,
    loading,
    selectSale,
    cancelSale,
    deleteSale,
    page,
    limit,
    total,
    goToPage,
  } = useSales();

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (loading)
    return (
      <div className="w-full bg-white rounded-md shadow px-4 py-6 text-center text-fuchsia-700 font-medium">
        Cargando ventas...
      </div>
    );

  return (
    <div className="w-full bg-white rounded-md shadow px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-fuchsia-700 font-semibold text-lg">Ventas</h3>
        {total > 0 && (
          <span className="text-sm text-gray-500">
            {total} resultado{total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {sales.length === 0 ? (
        <div className="text-sm text-gray-500 py-4 text-center">
          No hay ventas para mostrar. Use los filtros para buscar.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {sales.map((s: SalesResponse) => (
              <div
                key={s.id}
                className={`flex items-start justify-between border rounded-lg p-3 ${
                  s.status === 'CANCEL'
                    ? 'opacity-60 bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-gray-800">
                    Venta #{s.id}
                    {s.status === 'CANCEL' && (
                      <span className="ml-2 text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                        CANCELADA
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-fuchsia-700">
                      Usuario:
                    </span>{' '}
                    {s.username ?? '-'}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-fuchsia-700">Total:</span>{' '}
                    ${s.total.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-fuchsia-700">Fecha:</span>{' '}
                    {s.dateSale + ' ' + s.timeSale}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-fuchsia-700">Pago:</span>{' '}
                    {s.paymentMethod ?? '-'} / {s.paymentStatus ?? '-'}
                  </div>
                </div>

                <div className="flex flex-col gap-1 ml-3 shrink-0">
                  <button
                    onClick={() => {
                      selectSale(s);
                      if (onViewDetail) onViewDetail();
                    }}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1 px-3 rounded-lg shadow-sm transition text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Ver detalle
                  </button>
                  {s.status !== 'CANCEL' && (
                    <button
                      onClick={() => void cancelSale(s.id)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1 px-3 rounded-lg shadow-sm transition text-xs focus:outline-none focus:ring-2 focus:ring-yellow-300"
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
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={() => void deleteSale(s.id)}
                    className="bg-red-700 hover:bg-red-800 text-white font-semibold py-1 px-3 rounded-lg shadow-sm transition text-xs focus:outline-none focus:ring-2 focus:ring-red-300"
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
                        d="M19 7l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7m5 4v6m4-6v6M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"
                      />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 text-sm">
            <button
              onClick={() => void goToPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-semibold py-1.5 px-4 rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-fuchsia-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Anterior
            </button>
            <span className="text-gray-600 font-medium">
              Página {page} / {totalPages}
            </span>
            <button
              onClick={() => void goToPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-semibold py-1.5 px-4 rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-fuchsia-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
            >
              Siguiente
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block w-4 h-4 ml-2 -mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesList;
