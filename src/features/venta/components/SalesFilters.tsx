import React, { useState } from 'react';
import useSales from '../hooks/useSales';
import { showInfo } from '../../../components/Alerts/AlertsComponent';

const SalesFilters: React.FC = () => {
  const {
    fetchSalesByDate,
    fetchSalesByUser,
    searchSales,
    resetSalesSearchState,
    limit,
  } = useSales();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState<string>(today);
  const [username, setUsername] = useState('');
  const [dateIni, setDateIni] = useState<string>(today);
  const [dateFin, setDateFin] = useState<string>(today);

  const clearAll = (showToast = true) => {
    setDate(today);
    setDateIni(today);
    setDateFin(today);
    setUsername('');
    resetSalesSearchState();
    if (showToast) showInfo('Filtros', 'Se limpiaron los filtros');
  };

  const handleFetchByDate = async () => {
    try {
      await fetchSalesByDate({
        page: 1,
        limit,
        total: 0,
        dateInicio: date || null,
        dateFin: null,
        username: null,
      });
    } catch {
      clearAll(false);
    }
  };

  const handleFetchByUser = async () => {
    try {
      await fetchSalesByUser({
        page: 1,
        limit,
        total: 0,
        dateInicio: null,
        dateFin: null,
        username: username || null,
      });
    } catch {
      clearAll(false);
    }
  };

  const handleSearchByRange = async () => {
    try {
      await searchSales({
        page: 1,
        limit,
        total: 0,
        dateInicio: dateIni || null,
        dateFin: dateFin || null,
        username: null,
      });
    } catch {
      clearAll(false);
    }
  };

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
            onClick={() => void handleFetchByDate()}
            disabled={!date}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
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
            onClick={() => void handleFetchByUser()}
            disabled={!username}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                d="M5.121 17.804A4 4 0 018 16h8a4 4 0 012.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
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
            onClick={() => void handleSearchByRange()}
            disabled={!dateIni || !dateFin}
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Buscar por rango
          </button>
        </div>
      </div>
      <div className="mt-3 text-right">
        <button
          onClick={() => clearAll()}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-2 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
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
              d="M20 12H4M6 6h12M6 18h12"
            />
          </svg>
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default SalesFilters;
