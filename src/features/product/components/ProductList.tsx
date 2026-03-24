import React, { useState, useEffect } from 'react';
import { ProductRequest } from '../../../components/Product/Utils/UtilsProduct';
import Pagination from './Pagination';
import { useProductStore } from '../store/ProductContext';
import ProductForm from './ProductForm';
import Swal from 'sweetalert2';
import {
  showError,
  showSuccess,
} from '../../../components/Alerts/AlertsComponent';

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
    setLimit,
    setError,
    clearVista,
    buscarProducto,
  } = useProductStore();
  const [editing, setEditing] = useState<ProductRequest | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (error) {
      showError(error);
      setError();
      clearVista();
      setProductName('');
      setIsActivSearch(false);
    }
  }, [error, setError, clearVista]);

  const onEdit = (p: ProductRequest) => {
    setEditing(p);
    setShowForm(true);
  };
  const onDelete = (nameProduct: string, id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Esta seguro que desea eliminar: ' + nameProduct,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        remove(id);
        if (error == null) {
          showSuccess(
            'Producto Eliminado',
            'El producto se ha eliminado correctamente',
          );
        }
      }
    });
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

  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <h3 className="text-2xl text-fuchsia-700 font-semibold">Productos</h3>
      </div>
      <div className="w-full shadow flex flex-col md:flex-row md:items-center md:justify-between mb-4 px-4 py-3 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              clearVista();
              fetchPage(1);
              setIsActivSearch(false);
              setProductName('');
            }}
            className="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-60 disabled:cursor-not-allowed"
            title="Listar Productos"
          >
            <svg
              className="inline-block w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 4v4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 20v-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 12h-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 12H4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {loading ? 'Obteniendo..' : 'Listar'}
          </button>

          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            title="Nuevo Producto"
          >
            <svg
              className="inline-block w-4 h-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Nuevo
          </button>

          <button
            onClick={() => {
              clearVista();
              setEditing(null);
              setShowForm(false);
              setProductName('');
              setIsActivSearch(false);
            }}
            className="bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
            title="Clear"
          >
            <svg
              className="inline-block w-4 h-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M6.707 6.707a1 1 0 00-1.414-1.414L2 8.586 1.293 7.879A1 1 0 00-.121 9.293l1.414 1.414L.293 12.879A1 1 0 101.707 14.293L3.121 12.88l1.414 1.414A1 1 0 106.293 12.293L4.88 10.879l1.414-1.414a1 1 0 000-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Clear
          </button>
        </div>
      </div>
      <div className="w-full shadow mb-4 px-4 py-3 rounded-md bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-fuchsia-500">Buscar Producto:</h2>
            <input
              type="text"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                buscarProducto(e.target.value);
                validaText();
              }}
              placeholder="Nombre/Código de Barras Producto"
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-48 md:w-64"
            />
            <button
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-2 px-4 rounded-md"
              onClick={() => fetchPageProductDetail(page, productName)}
              title={`Buscar ${productName}`}
            >
              Buscar
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold text-black">{total}</span>
          </div>
        </div>
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

      <div className="flex justify-center">
        <div className="w-full md:w-[99%]">
          <div className="overflow-x-auto shadow-md sm:rounded-lg bg-white">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-fuchsia-700 bg-gray-50">
                <tr className="text-center font-bold">
                  <th className="px-4 py-3">Cod Barras</th>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Lote</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((p) => (
                  <tr
                    key={p.productId}
                    className="bg-white hover:bg-fuchsia-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 text-right w-24">
                      {p.productCodeBar}
                    </td>
                    <td className="px-4 py-3 text-black text-left">
                      {p.productName}
                    </td>
                    <td className="px-4 py-3 font-semibold text-black text-right">
                      {p.productCount}
                    </td>
                    <td className="px-4 py-3 text-red-600 font-semibold text-right">
                      {formatter.format(p.productPrice)}
                    </td>
                    <td className="px-4 py-3">{p.productLote}</td>
                    <td className="px-4 py-3 flex gap-2 justify-center">
                      <button
                        onClick={() => onEdit(p)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-md shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        title={`Editar ${p.productName}`}
                      >
                        <svg
                          className="inline-block w-4 h-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M4 13.5V16h2.5L16.873 5.627a1 1 0 00-1.414-1.414L5 14.586V13.5z" />
                          <path d="M17.207 4.793a1 1 0 010 1.414l-2 2-2.414-2.414 2-2a1 1 0 011.828 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(p.productName, p.productId)}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-red-300"
                        title={`Eliminar ${p.productName}`}
                      >
                        <svg
                          className="inline-block w-4 h-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 7a1 1 0 011-1h6a1 1 0 011 1v8a2 2 0 01-2 2H8a2 2 0 01-2-2V7zM5 5a1 1 0 011-1h8a1 1 0 011 1v1H5V5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
        changeLimit={setLimit}
      />
    </div>
  );
};

export default ProductList;
