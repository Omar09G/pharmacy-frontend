import React, { useState } from 'react';
import useSales from '../hooks/useSales';

const SalesFilters: React.FC = () => {
  const { fetchSalesByDate, fetchSalesByUser, searchSales, page, limit } =
    useSales();
  const [date, setDate] = useState('');
  const [username, setUsername] = useState('');
  const [dateIni, setDateIni] = useState('');
  const [dateFin, setDateFin] = useState('');

  return (
    <div className="w-full bg-white rounded-md shadow px-4 py-4">
      <h3 className="text-fuchsia-700 font-semibold text-lg mb-4">
        Buscar Ventas
      </h3>

      {/* Row 1: date + user */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <label className="block">
          <span className="text-sm text-fuchsia-700 font-medium">
            Fecha exacta
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
          />
        </label>
        <div>
          <button
            onClick={() =>
              fetchSalesByDate({
                page,
                limit,
                total: 0,
                dateInicio: date || null,
                dateFin: null,
                username: null,
              })
            }
            disabled={!date}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buscar por fecha
          </button>
        </div>
        <label className="block">
          <span className="text-sm text-fuchsia-700 font-medium">Usuario</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nombre de usuario"
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
          />
        </label>
        <div>
          <button
            onClick={() =>
              fetchSalesByUser({
                page,
                limit,
                total: 0,
                dateInicio: null,
                dateFin: null,
                username: username || null,
              })
            }
            disabled={!username}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buscar por usuario
          </button>
        </div>
      </div>

      {/* Row 2: date range */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <label className="block">
          <span className="text-sm text-fuchsia-700 font-medium">
            Fecha inicio
          </span>
          <input
            type="date"
            value={dateIni}
            onChange={(e) => setDateIni(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
          />
        </label>
        <label className="block">
          <span className="text-sm text-fuchsia-700 font-medium">
            Fecha fin
          </span>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
          />
        </label>
        <div className="md:col-span-3">
          <button
            onClick={() =>
              searchSales({
                page,
                limit,
                total: 0,
                dateInicio: dateIni || null,
                dateFin: dateFin || null,
                username: null,
              })
            }
            disabled={!dateIni || !dateFin}
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buscar por rango
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesFilters;
