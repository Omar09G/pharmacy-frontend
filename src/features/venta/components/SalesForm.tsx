import React, { useMemo, useState } from 'react';
import { SalesRequestDTO, SalesDetailRequestDTO } from '../ventaDto/ventaDto';
import useSales from '../hooks/useSales';
import { showError } from '../../../components/Alerts/AlertsComponent';
import productService from '../../product/services/productService';
import useAuth from '../../auth/hooks/useAuth';

type Props = { onSaved?: (res?: unknown) => void };

type CartItem = {
  productId: number;
  productCodeBar: string;
  productName: string;
  stock: number;
  quantity: number;
  price: number;
};

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
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [discount, setDiscount] = useState(0);
  const [ivaPercent, setIvaPercent] = useState(0);
  const [cashReceived, setCashReceived] = useState(0);

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity * item.price, 0),
    [cart],
  );
  const ivaAmount = useMemo(
    () => (subtotal * Math.max(ivaPercent, 0)) / 100,
    [subtotal, ivaPercent],
  );
  const total = useMemo(
    () => Math.max(0, subtotal - Math.max(discount, 0) + ivaAmount),
    [subtotal, discount, ivaAmount],
  );
  const changeAmount = useMemo(
    () => Math.max(0, Math.max(cashReceived, 0) - total),
    [cashReceived, total],
  );

  const setQty = (productId: number, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const safeQty = Number.isFinite(quantity) ? Math.max(1, quantity) : 1;
        if (safeQty > (item.stock || 0)) {
          showError('No hay suficiente existencia');
          return { ...item, quantity: Math.max(1, item.stock || 0) };
        }
        return {
          ...item,
          quantity: Math.min(safeQty, Math.max(1, item.stock || 1)),
        };
      }),
    );
  };

  const removeItem = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const addProductByBarcode = async () => {
    const code = barcode.trim();
    if (!code) {
      showError('Ingrese un código de barras');
      return;
    }

    try {
      const result = await productService.getProductDetails(1, 10, 0, code);
      const found = (result.items || []).find((p) => p.productCodeBar === code);
      const product = found ?? result.items?.[0];

      if (!product) {
        showError('No se encontró producto con ese código');
        return;
      }

      if ((product.productCount ?? 0) <= 0) {
        showError('Producto sin existencia');
        return;
      }

      setCart((prev) => {
        const idx = prev.findIndex((p) => p.productId === product.productId);
        if (idx >= 0) {
          const copy = [...prev];
          const nextQty = copy[idx].quantity + 1;
          if (nextQty > (copy[idx].stock || 0)) {
            showError('No hay producto en existencia');
            return copy;
          }
          copy[idx] = {
            ...copy[idx],
            quantity: Math.min(nextQty, Math.max(1, copy[idx].stock || 1)),
          };
          return copy;
        }

        return [
          ...prev,
          {
            productId: product.productId,
            productCodeBar: product.productCodeBar,
            productName: product.productName,
            stock: product.productCount,
            quantity: 1,
            price: product.productPrice,
          },
        ];
      });

      setBarcode('');
    } catch (err) {
      console.error(err);
      showError((err as Error)?.message ?? 'Error buscando producto');
    }
  };

  const buildPayload = (): SalesRequestDTO => {
    const now = new Date();
    const dateSale = now.toISOString().slice(0, 10);
    const timeSale = now.toTimeString().slice(0, 8);
    const details: SalesDetailRequestDTO[] = cart.map((item) => ({
      id: 0,
      dateSale,
      productCodeBar: item.productCodeBar,
      productCount: item.quantity,
      productId: item.productId,
      productPrice: item.price,
      timeSale,
      idSale: 0,
    }));

    return {
      ...emptyForm(),
      dateSale,
      timeSale,
      paymentMethod,
      paymentStatus,
      discount: Math.max(0, discount),
      iva: ivaAmount,
      subTotal: subtotal,
      total,
      username: user?.username ?? null,
      details,
    };
  };

  return (
    <div className="w-full bg-white rounded-xl shadow border border-slate-200 p-4 md:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-fuchsia-700 font-semibold text-lg">Nueva Venta</h3>
        <div className="text-sm text-slate-600">
          Usuario:{' '}
          <span className="font-semibold">{user?.username ?? '-'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mb-4">
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void addProductByBarcode();
            }
          }}
          placeholder="Escanear código de barras"
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
        />
        <button
          type="button"
          onClick={() => void addProductByBarcode()}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
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
              d="M12 4v16M4 12h16"
            />
          </svg>
          Agregar
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-2 text-center text-fuchsia-400 font-semibold">
                Código de Barras
              </th>
              <th className="px-3 py-2 text-center text-fuchsia-400 font-semibold">
                Nombre Producto
              </th>
              <th className="px-3 py-2 text-center text-fuchsia-400 font-semibold">
                Cantidad
              </th>
              <th className="px-3 py-2 text-center text-fuchsia-400 font-semibold">
                Existencia
              </th>
              <th className="px-3 py-2 text-center text-fuchsia-400 font-semibold">
                Precio
              </th>
              <th className="px-3 py-2 text-center text-fuchsia-400 font-semibold">
                Subtotal
              </th>
              <th className="px-3 py-2 text-center text-fuchsia-400 font-semibold">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {cart.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-slate-500"
                >
                  Escanee un producto para iniciar la venta
                </td>
              </tr>
            )}
            {cart.map((item) => (
              <tr
                key={item.productId}
                className="border-t border-slate-100 hover:bg-slate-50 transition "
              >
                <td className="px-3 py-2 text-center">{item.productCodeBar}</td>
                <td className="px-3 py-2 text-center">{item.productName}</td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="number"
                    min={1}
                    max={item.stock || 1}
                    value={item.quantity}
                    onChange={(e) =>
                      setQty(item.productId, Number(e.target.value || 1))
                    }
                    className="w-20 text-right border border-slate-300 rounded px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  {Math.max(0, item.stock - item.quantity)}
                </td>
                <td className="px-3 py-2 text-right">
                  ${item.price.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-red-700 hover:bg-red-700 hover:text-white font-semibold py-2 px-4 rounded-lg transition flex items-center text-left"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline-block w-4 h-4 mr-2"
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
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 border-t border-slate-200">
            <tr>
              <td
                colSpan={1}
                className="px-3 py-3 text-1xl text-left font-semibold text-fuchsia-700"
              >
                Num: {cart.length}
              </td>
              <td
                colSpan={5}
                className="px-3 py-3 text-1xl text-right font-semibold text-fuchsia-700"
              >
                Sub Total
              </td>
              <td className="px-3 py-3 text-1xl  text-right font-bold text-fuchsia-700">
                ${subtotal.toFixed(2)}
              </td>
              <td className="px-3 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex justify-end items-center gap-3 pt-4">
        <button
          type="button"
          onClick={() => {
            // Clear cart, inputs and modal state
            setCart([]);
            setBarcode('');
            setDiscount(0);
            setIvaPercent(0);
            setCashReceived(0);
            setPaymentMethod('CASH');
            setPaymentStatus('PENDING');
            setCheckoutOpen(false);
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline-block w-4 h-4 mr-2"
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

        <button
          type="button"
          disabled={cart.length === 0}
          onClick={() => {
            if (cart.length === 0) {
              showError('Agregue al menos un producto');
              return;
            }
            setCheckoutOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline-block w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-3 0-4 1-4 3s1 3 4 3 4 1 4 3-1 3-4 3"
            />
          </svg>
          Cobrar
        </button>
      </div>

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-900">Cobrar venta</h4>
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                Cerrar
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Usuario
                </span>
                <input
                  value={user?.username ?? ''}
                  readOnly
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Metodo de Pago
                </span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="CASH">Efectivo</option>
                  <option value="CARD">Tarjeta</option>
                  <option value="TRANSFER">Transferencia</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Estado de Pago
                </span>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="PAID">Pagada</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Descuento
                </span>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value || 0))}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  IVA (%)
                </span>
                <input
                  type="number"
                  min={0}
                  value={ivaPercent}
                  onChange={(e) => setIvaPercent(Number(e.target.value || 0))}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Efectivo recibido
                </span>
                <input
                  type="number"
                  min={0}
                  value={cashReceived}
                  onChange={(e) => setCashReceived(Number(e.target.value || 0))}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </label>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div>
                  <div className="text-xs text-slate-500">SubTotal</div>
                  <div className="text-sm font-semibold text-slate-900">
                    ${subtotal.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">IVA</div>
                  <div className="text-sm font-semibold text-slate-900">
                    ${ivaAmount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">TOTAL</div>
                  <div className="text-sm font-bold text-emerald-700">
                    ${total.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">CAMBIO</div>
                  <div className="text-sm font-bold text-sky-700">
                    ${changeAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="bg-white border border-slate-300 text-slate-700 font-medium py-2 px-4 rounded-lg flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline-block w-4 h-4 mr-2"
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
              <button
                type="button"
                onClick={async () => {
                  if (cart.length === 0) {
                    showError('La venta debe contener productos');
                    return;
                  }

                  if (paymentMethod === 'CASH' && cashReceived < total) {
                    showError('El efectivo recibido debe cubrir el total');
                    return;
                  }

                  try {
                    const res = await createSale(buildPayload());
                    if (res) {
                      if (onSaved) onSaved(res);
                      setCart([]);
                      setBarcode('');
                      setDiscount(0);
                      setIvaPercent(0);
                      setCashReceived(0);
                      setPaymentMethod('CASH');
                      setPaymentStatus('PENDING');
                      setCheckoutOpen(false);
                    }
                  } catch (err) {
                    console.error(err);
                    showError(
                      (err as Error)?.message ?? 'Error al crear venta',
                    );
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-lg flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline-block w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Confirmar cobro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesForm;
