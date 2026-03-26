import React from 'react';
import { SalesResponse } from '../ventaDto/ventaDto';
import useSales from '../hooks/useSales';

const SalesList: React.FC = () => {
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
                    {s.dateSale ?? '-'}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-fuchsia-700">Pago:</span>{' '}
                    {s.paymentMethod ?? '-'} / {s.paymentStatus ?? '-'}
                  </div>
                </div>

                <div className="flex flex-col gap-1 ml-3 shrink-0">
                  <button
                    onClick={() => selectSale(s)}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1 px-3 rounded-lg shadow-sm transition text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Ver detalle
                  </button>
                  {s.status !== 'CANCEL' && (
                    <button
                      onClick={() => void cancelSale(s.id)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1 px-3 rounded-lg shadow-sm transition text-xs focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={() => void deleteSale(s.id)}
                    className="bg-red-700 hover:bg-red-800 text-white font-semibold py-1 px-3 rounded-lg shadow-sm transition text-xs focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
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
              className="bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-semibold py-1.5 px-4 rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-fuchsia-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-gray-600 font-medium">
              Página {page} / {totalPages}
            </span>
            <button
              onClick={() => void goToPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-semibold py-1.5 px-4 rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-fuchsia-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesList;
