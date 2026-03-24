import React, { useState, useEffect } from 'react';
import { ProductRequest } from '../../../components/Product/Utils/UtilsProduct';

type Props = {
  initial?: Partial<ProductRequest>;
  onCancel: () => void;
  onSave: (data: Omit<ProductRequest, 'productId'> | ProductRequest) => void;
};

type textProduct = string | number;

type ProductRequestDto = Omit<ProductRequest, 'productId'>;

const ProductForm: React.FC<Props> = ({ initial = {}, onCancel, onSave }) => {
  const [form, setForm] = useState<Omit<ProductRequest, 'productId'>>({
    productName: initial.productName || '',
    productCatalog: initial.productCatalog || 0,
    productCount: initial.productCount || 0,
    productCodeBar: initial.productCodeBar || '',
    productPrice: initial.productPrice || 0,
    productDesc: initial.productDesc || '',
    productLote: initial.productLote || '',
  });

  useEffect(() => {
    try {
      const incoming = {
        productName: initial.productName || '',
        productCatalog: initial.productCatalog || 0,
        productCount: initial.productCount || 0,
        productCodeBar: initial.productCodeBar || '',
        productPrice: initial.productPrice || 0,
        productDesc: initial.productDesc || '',
        productLote: initial.productLote || '',
      };
      const current = {
        productName: form.productName || '',
        productCatalog: form.productCatalog || 0,
        productCount: form.productCount || 0,
        productCodeBar: form.productCodeBar || '',
        productPrice: form.productPrice || 0,
        productDesc: form.productDesc || '',
        productLote: form.productLote || '',
      };
      const different = JSON.stringify(incoming) !== JSON.stringify(current);
      if (different) {
        setForm((s) => ({ ...s, ...(initial as ProductRequestDto) }));
      }
    } catch (e) {
      console.warn('Error comparing form state with incoming initial data', e);
      // swallow potential stringify errors
    }
    // only depend on `initial` reference so we guard against repeated setState
  }, [initial]);

  const change = (k: keyof typeof form, v: textProduct) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const canSave = form.productName.trim().length > 0;

  return (
    <div className="p-4 bg-surface rounded shadow">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) onSave(form);
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <label className="block">
          <span className="text-sm text-fuchsia-700">Nombre:</span>
          <input
            value={form.productName}
            onChange={(e) => change('productName', e.target.value)}
            placeholder="Nombre del Producto"
            className="mt-1 block w-full border rounded-md px-3 py-2 text-sm text-gray-700"
          />
        </label>

        <label className="block">
          <span className="text-sm text-fuchsia-700">Catálogo:</span>
          <input
            type="number"
            placeholder="Catálogo"
            value={form.productCatalog}
            onChange={(e) => change('productCatalog', Number(e.target.value))}
            className="mt-1 block w-full border rounded-md px-3 py-2 text-sm text-gray-700"
          />
        </label>

        <label className="block">
          <span className="text-sm text-fuchsia-700">Cantidad:</span>
          <input
            type="number"
            placeholder="Cantidad"
            value={form.productCount}
            onChange={(e) => change('productCount', Number(e.target.value))}
            className="mt-1 block w-full border rounded-md px-3 py-2 text-sm text-gray-700"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm text-fuchsia-700">Código de barra:</span>
          <input
            value={form.productCodeBar}
            placeholder="Código de barra"
            onChange={(e) => change('productCodeBar', e.target.value)}
            className="mt-1 block w-full border rounded-md px-3 py-2 text-sm text-gray-700"
          />
        </label>

        <label className="block">
          <span className="text-sm text-fuchsia-700">Precio:</span>
          <input
            type="number"
            value={form.productPrice}
            onChange={(e) => change('productPrice', Number(e.target.value))}
            className="mt-1 block w-full border rounded-md px-3 py-2 text-sm text-gray-700"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm text-fuchsia-700">Descripción:</span>
          <textarea
            value={form.productDesc}
            placeholder="Descripción"
            onChange={(e) => change('productDesc', e.target.value)}
            className="mt-1 block w-full border rounded-md px-3 py-2 text-sm text-gray-700"
          />
        </label>

        <label className="block">
          <span className="text-sm text-fuchsia-700">Lote:</span>
          <input
            value={form.productLote}
            placeholder="Lote"
            onChange={(e) => change('productLote', e.target.value)}
            className="mt-1 block w-full border rounded-md px-3 py-2 text-sm text-gray-700"
          />
        </label>

        <div className="md:col-span-2 flex items-center gap-3 justify-end mt-2">
          <button
            type="submit"
            disabled={!canSave}
            className={`bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-60 disabled:cursor-not-allowed ${!canSave ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <svg
              className="inline-block w-4 h-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            Guardar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            <svg
              className="inline-block w-4 h-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
