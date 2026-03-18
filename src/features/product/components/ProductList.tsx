import React, { useState } from 'react';
import { ProductRequest } from '../../../components/Product/Utils/UtilsProduct';
import Pagination from './Pagination';
import { useProductStore } from '../store/ProductContext';
import ProductForm from './ProductForm';

const ProductList: React.FC = () => {
  const {
    items,
    total,
    page,
    limit,
    loading,
    error,
    fetchPage,
    remove,
    edit,
    create,
    fetchPageProductDetail,
  } = useProductStore();
  const [editing, setEditing] = useState<ProductRequest | null>(null);
  const [showForm, setShowForm] = useState(false);

  const onEdit = (p: ProductRequest) => {
    setEditing(p);
    setShowForm(true);
  };
  const onDelete = (id: number) => {
    if (window.confirm('Eliminar producto?')) remove(id);
  };

  const [productName, setProductName] = useState('');
  const [isActivSearch, setIsActivSearch] = useState(false);

  const validaText = () => {
    if (productName.length === 0) {
      setIsActivSearch(false);
    } else {
      setIsActivSearch(true);
    }
  };

  return (
    <div>
      <div className=" w-full shadow flex justify-between items-center mb-4 px-6 py-3">
        <h3 className="text-lg font-semibold">Lista de Productos</h3>
        <button
          onClick={() => {
            fetchPage(1);
            setIsActivSearch(false);
            setProductName('');
          }}
          className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-full"
        >
          {loading ? 'Obteniendo..' : 'Get List'}
        </button>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="bg-cyan-600 hover:bg-cyan-600 text-white font-bold py-1 px-4 rounded-full"
        >
          Nuevo
        </button>
      </div>
      <div className=" w-full shadow flex justify-between mb-2 px-6 py-3">
        <h2> Buscar Producto: </h2>
        <input
          type="text"
          value={productName}
          onChange={(e) => {
            setProductName(e.target.value);
            validaText();
          }}
          placeholder="Nombre de Producto"
          className=" text-sm text-left text-gray-500"
        />
        <button
          className="bg-fuchsia-600 hover:bg-fuchsia-600 text-white font-bold py-1 px-4 rounded-full"
          onClick={() => fetchPageProductDetail(page, productName)}
        >
          Buscar
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <ProductForm
            initial={editing || undefined}
            onCancel={() => setShowForm(false)}
            onSave={async (data) => {
              if ((data as ProductRequest).productId) {
                await edit(
                  (data as ProductRequest).productId,
                  data as Partial<ProductRequest>,
                );
              } else {
                await create(data as Omit<ProductRequest, 'productId'>);
              }
              setShowForm(false);
              fetchPage(page);
            }}
          />
        </div>
      )}

      {error && <div className="text-danger mb-2">{error}</div>}
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-fuchsia-700 bg-gray-50">
            <tr className="text-left font-black">
              <th className="px-6 py-3">Cod Barras</th>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3 ">Stock</th>
              <th className="px-6 py-3">Precio</th>
              <th className="px-6 py-3">Lote</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((p) => (
              <tr key={p.productId} className="bg-white hover:bg-fuchsia-100">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {p.productCodeBar}
                </td>
                <td className="px-6 py-4 text-black">{p.productName}</td>
                <td className="px-6 py-4 font-bold text-black">
                  {p.productCount}
                </td>
                <td className="px-6 py-4 text-red-600 font-bold">
                  ${p.productPrice}
                </td>
                <td className="px-6 py-4">{p.productLote}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onEdit(p)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-4 rounded-full"
                  >
                    Editar
                  </button>
                  {'   '}
                  <button
                    onClick={() => onDelete(p.productId)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-4 rounded-full"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        total={total}
        limit={limit}
        onPage={(p) => {
          if (isActivSearch) {
            fetchPageProductDetail(p, productName);
          } else {
            fetchPage(p);
          }
        }}
      />
    </div>
  );
};

export default ProductList;
