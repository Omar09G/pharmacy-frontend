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
    if (initial) {
      setForm((s) => ({ ...s, ...(initial as ProductRequestDto) }));
    }
  }, [initial]);

  const change = (k: keyof typeof form, v: textProduct) =>
    setForm({ ...form, [k]: v });

  return (
    <div className="p-4 bg-surface rounded shadow">
      <label className="block mb-2">
        <span className="text-sm">Nombre</span>
        <input
          value={form.productName}
          onChange={(e) => change('productName', e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm">Catalog</span>
        <input
          type="number"
          value={form.productCatalog}
          onChange={(e) => change('productCatalog', Number(e.target.value))}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm">Cantidad</span>
        <input
          type="number"
          value={form.productCount}
          onChange={(e) => change('productCount', Number(e.target.value))}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm">Código de barra</span>
        <input
          value={form.productCodeBar}
          onChange={(e) => change('productCodeBar', e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm">Precio</span>
        <input
          type="number"
          value={form.productPrice}
          onChange={(e) => change('productPrice', Number(e.target.value))}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm">Descripción</span>
        <textarea
          value={form.productDesc}
          onChange={(e) => change('productDesc', e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm">Lote</span>
        <input
          value={form.productLote}
          onChange={(e) => change('productLote', e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </label>

      <div className="flex gap-2">
        <button
          onClick={() => onSave(form)}
          className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-full"
        >
          Guardar
        </button>
        <button
          onClick={onCancel}
          className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-full"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default ProductForm;
