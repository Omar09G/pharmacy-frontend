import React, { useState, useMemo } from 'react';
import useUsers from '../hooks/useUsers';
import {
  showError,
  showSuccess,
} from '../../../../components/Alerts/AlertsComponent';

const UserList: React.FC = () => {
  const {
    items,
    total,
    loading,
    error,
    fetchPage,
    remove,
    page,
    limit,
    setLimit,
    setSelectedUser,
  } = useUsers();
  const [localPage, setLocalPage] = useState(page || 1);
  const [q, setQ] = useState('');

  const handleDelete = async (id: number) => {
    try {
      await remove(id);
      showSuccess(
        'Usuario eliminado',
        'El usuario fue eliminado correctamente.',
      );
      // after delete, ensure we are not on an empty page
      const newTotal = Math.max(0, total - 1);
      const newTotalPages = Math.max(1, Math.ceil(newTotal / (limit || 10)));
      if (localPage > newTotalPages) {
        setLocalPage(newTotalPages);
        await fetchPage(newTotalPages);
      } else {
        await fetchPage(localPage);
      }
    } catch (err: unknown) {
      showError((err instanceof Error && err.message) || 'No se pudo eliminar');
    }
  };

  const filtered = useMemo(() => {
    if (!q) return items;
    return items.filter((u) => {
      const s = `${u.username} ${u.firstname} ${u.lastname}`.toLowerCase();
      return s.includes(q.toLowerCase());
    });
  }, [items, q]);

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const totalPages = Math.max(1, Math.ceil(total / (limit || 10)));

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <h3 className="text-2xl text-fuchsia-700 font-semibold">Usuarios</h3>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => {
            fetchPage(1);
            setQ('');
          }}
          className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-300"
          title="Listar Usuarios"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v6h6M20 20v-6h-6"
            />
          </svg>
          Listar
        </button>

        <button
          onClick={() => {
            setSelectedUser(null);
          }}
          className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          title="Nuevo Usuario"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nuevo
        </button>

        <button
          onClick={() => {
            setSelectedUser(null);
            fetchPage(1);
            setQ('');
          }}
          className="inline-flex items-center gap-2 bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
          title="Clear"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Clear
        </button>
      </div>

      <div className="w-full shadow mb-4 px-4 py-3 rounded-md bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-fuchsia-500">Buscar Usuario:</h2>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="username/nombre/apellido"
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-48 md:w-64"
            />
            <button
              className="inline-flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-2 px-4 rounded-md"
              onClick={() => fetchPage(1)}
              title="Buscar Usuario"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </button>
            <label className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mostrar:</span>
              <select
                value={limit}
                onChange={(e) => {
                  const v = Number(e.target.value) || 10;
                  setLimit(v);
                  setLocalPage(1);
                }}
                className="border border-gray-200 rounded-md px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto shadow-md sm:rounded-lg bg-white">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-fuchsia-700 bg-gray-50">
            <tr className=" font-bold">
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((u) => (
              <tr key={u.id} className="bg-white hover:bg-fuchsia-50">
                <td className="px-4 py-3 text-gray-900 text-left w-40 font-bold">
                  {u.username}
                </td>
                <td className="px-4 py-3 text-black text-left">
                  {u.firstname} {u.lastname}
                </td>
                <td className="px-4 py-3 font-semibold text-black text-left">
                  {u.role}
                </td>
                <td className="px-4 py-3 flex gap-2 justify-center">
                  <button
                    onClick={() =>
                      setSelectedUser({ ...u, password: '', country: null })
                    }
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-md shadow-sm"
                    title={`Editar ${u.username}`}
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md shadow-sm"
                    title={`Eliminar ${u.username}`}
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 6h18"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 11v6M14 11v6"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {total}</div>
        <div className="space-x-2">
          <button
            disabled={localPage <= 1}
            onClick={() => setLocalPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Anterior
          </button>
          <span className="px-3 font-bold text-gray-700 bg-gray-200 rounded-md">
            {localPage}/{totalPages}
          </span>
          <button
            disabled={localPage >= totalPages}
            onClick={() => setLocalPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserList;
