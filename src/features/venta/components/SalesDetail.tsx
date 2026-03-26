import React, { useEffect, useState } from 'react';
import { SalesDetailResponseDTO } from '../ventaDto/ventaDto';
import saleService from '../services/saleService';
import useSales from '../hooks/useSales';
import { showError } from '../../../components/Alerts/AlertsComponent';

const SalesDetail: React.FC = () => {
  const { selected } = useSales();
  const [details, setDetails] = useState<SalesDetailResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!selected) return setDetails([]);
      setLoading(true);
      try {
        const res = await saleService.getSaleDetailsById(selected.id);
        setDetails(res || []);
      } catch (e) {
        showError((e as Error)?.message ?? 'Error al cargar detalles de venta');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [selected]);

  if (!selected)
    return (
      <div className="w-full bg-white rounded-md shadow px-4 py-6 text-sm text-gray-500 text-center">
        Seleccione una venta para ver sus detalles
      </div>
    );

  return (
    <div className="w-full bg-white rounded-md shadow px-4 py-4">
      <h3 className="text-fuchsia-700 font-semibold text-lg mb-2">
        Detalle Venta #{selected.id}
      </h3>
      <div className="text-sm text-gray-600 mb-0.5">
        <span className="font-medium text-fuchsia-700">Usuario:</span>{' '}
        {selected.username}
      </div>
      <div className="text-sm text-gray-600 mb-3">
        <span className="font-medium text-fuchsia-700">Total:</span> $
        {selected.total.toFixed(2)}
      </div>

      {loading && (
        <div className="text-sm text-fuchsia-700 py-2">
          Cargando productos...
        </div>
      )}
      {!loading && details.length === 0 && (
        <div className="text-sm text-gray-500">Sin productos registrados</div>
      )}
      {!loading && details.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-fuchsia-50 text-fuchsia-700 text-left">
                <th className="px-2 py-1.5 font-semibold">Código</th>
                <th className="px-2 py-1.5 font-semibold">Producto</th>
                <th className="px-2 py-1.5 font-semibold text-right">Cant.</th>
                <th className="px-2 py-1.5 font-semibold text-right">Precio</th>
                <th className="px-2 py-1.5 font-semibold text-right">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {details.map((d) => (
                <tr
                  key={d.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-2 py-1.5">{d.productCodeBar ?? '-'}</td>
                  <td className="px-2 py-1.5">{d.productId}</td>
                  <td className="px-2 py-1.5 text-right">{d.productCount}</td>
                  <td className="px-2 py-1.5 text-right">
                    ${(d.productPrice ?? 0).toFixed(2)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-medium">
                    $
                    {((d.productPrice ?? 0) * (d.productCount ?? 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesDetail;
