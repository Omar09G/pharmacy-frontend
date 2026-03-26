import React, { useState } from 'react';
import { SalesRequestDTO, SalesDetailRequestDTO } from '../ventaDto/ventaDto';
import useSales from '../hooks/useSales';

type Props = { onSaved?: (res?: unknown) => void };

const emptyDetail = (): SalesDetailRequestDTO => ({
  id: 0,
  dateSale: null,
  productCodeBar: null,
  productCount: 1,
  productId: 0,
  productPrice: 0,
  timeSale: null,
  idSale: 0,
});

const emptyForm = (): SalesRequestDTO => ({
  id: 0,
  dateSale: null,
  discount: 0,
  idSaleDetl: 0,
  iva: 0,
  msg: null,
  paymentMethod: 'CASH',
  paymentStatus: 'PENDING',
  status: 'ACTIVE',
  subTotal: 0,
  timeSale: null,
  total: 0,
  username: null,
  details: [emptyDetail()],
});

const SalesForm: React.FC<Props> = ({ onSaved }) => {
  const { createSale } = useSales();
  const [form, setForm] = useState<SalesRequestDTO>(emptyForm);

  const change = <K extends keyof SalesRequestDTO>(
    k: K,
    v: SalesRequestDTO[K],
  ) => setForm((s) => ({ ...s, [k]: v }));

  const changeDetail = (
    idx: number,
    key: keyof SalesDetailRequestDTO,
    value: SalesDetailRequestDTO[keyof SalesDetailRequestDTO],
  ) =>
    setForm((s) => {
      const d = [...s.details];
      d[idx] = { ...d[idx], [key]: value };
      return { ...s, details: d };
    });

  const addDetail = () =>
    setForm((s) => ({ ...s, details: [...s.details, emptyDetail()] }));
  const removeDetail = (idx: number) =>
    setForm((s) => ({ ...s, details: s.details.filter((_, i) => i !== idx) }));

  const calcTotals = () => {
    const sub = form.details.reduce(
      (acc, d) => acc + (d.productPrice || 0) * (d.productCount || 0),
      0,
    );
    const ivaVal = (sub * (form.iva || 0)) / 100;
    const total = sub - (form.discount || 0) + ivaVal;
    setForm((s) => ({ ...s, subTotal: sub, total, iva: ivaVal }));
  };

  return (
    <div className="w-full bg-white rounded-md shadow px-4 py-4">
      <h3 className="text-fuchsia-700 font-semibold text-lg mb-4">
        Nueva Venta
      </h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const res = await createSale(form);
            if (onSaved) onSaved(res);
            setForm(emptyForm());
          } catch (err) {
            console.error(err);
            alert('Error saving sale: ' + (err as Error).message);
          }
        }}
        className="grid grid-cols-1 gap-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-sm text-fuchsia-700 font-medium">
              Usuario
            </span>
            <input
              value={form.username ?? ''}
              onChange={(e) => change('username', e.target.value || null)}
              placeholder="Usuario"
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
            />
          </label>

          <label className="block">
            <span className="text-sm text-fuchsia-700 font-medium">
              Método pago
            </span>
            <select
              value={form.paymentMethod || 'CASH'}
              onChange={(e) => change('paymentMethod', e.target.value || null)}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
            >
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta</option>
              <option value="TRANSFER">Transferencia</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-fuchsia-700 font-medium">
              Estado pago
            </span>
            <select
              value={form.paymentStatus || 'PENDING'}
              onChange={(e) => change('paymentStatus', e.target.value || null)}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
            >
              <option value="PENDING">Pendiente</option>
              <option value="PAID">Pagada</option>
            </select>
          </label>
        </div>

        <div>
          <span className="text-sm text-fuchsia-700 font-medium">
            Productos
          </span>
          <div className="space-y-2 mt-2">
            {form.details.map((d, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end bg-gray-50 border border-gray-200 rounded-lg p-2"
              >
                <div>
                  <label className="text-xs text-fuchsia-700 font-medium">
                    Código barras
                  </label>
                  <input
                    value={d.productCodeBar ?? ''}
                    onChange={(e) =>
                      changeDetail(
                        idx,
                        'productCodeBar',
                        e.target.value || null,
                      )
                    }
                    placeholder="Código"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-fuchsia-700 font-medium">
                    Producto ID
                  </label>
                  <input
                    type="number"
                    value={d.productId}
                    onChange={(e) =>
                      changeDetail(idx, 'productId', Number(e.target.value))
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-fuchsia-700 font-medium">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    value={d.productCount || 0}
                    onChange={(e) =>
                      changeDetail(idx, 'productCount', Number(e.target.value))
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                  />
                </div>
                <div>
                  <label className="text-xs text-fuchsia-700 font-medium">
                    Precio
                  </label>
                  <input
                    type="number"
                    value={d.productPrice}
                    onChange={(e) =>
                      changeDetail(idx, 'productPrice', Number(e.target.value))
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeDetail(idx)}
                    className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-1.5 px-3 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-300 text-xs"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={addDetail}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-1.5 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-300 text-sm"
            >
              + Agregar producto
            </button>
            <button
              type="button"
              onClick={calcTotals}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
            >
              Calcular totales
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="block">
            <span className="text-sm text-fuchsia-700 font-medium">
              Descuento
            </span>
            <input
              type="number"
              value={form.discount}
              onChange={(e) => change('discount', Number(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
            />
          </label>

          <label className="block">
            <span className="text-sm text-fuchsia-700 font-medium">
              IVA (%)
            </span>
            <input
              type="number"
              value={form.iva}
              onChange={(e) => change('iva', Number(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
            />
          </label>

          <label className="block">
            <span className="text-sm text-fuchsia-700 font-medium">
              Subtotal
            </span>
            <input
              value={form.subTotal.toFixed(2)}
              readOnly
              className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 cursor-default"
            />
          </label>

          <label className="block">
            <span className="text-sm text-fuchsia-700 font-medium">Total</span>
            <input
              value={form.total.toFixed(2)}
              readOnly
              className="mt-1 block w-full border border-fuchsia-200 rounded-lg px-3 py-2 text-sm font-semibold text-fuchsia-700 bg-fuchsia-50 cursor-default"
            />
          </label>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            Crear Venta
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesForm;
