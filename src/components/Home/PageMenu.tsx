import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import useAuth from '../../features/auth/hooks/useAuth';

const AppMenu: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  return (
    <header className="w-full shadow bg-fuchsia-500 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/pharmacy')}
          aria-label="Ir a inicio"
        >
          <div
            role="img"
            aria-label="Logo - pastilla"
            className="flex items-center justify-center bg-white rounded-full p-2 shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-8 h-8 text-fuchsia-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M21.41 11.58a2 2 0 010 2.83l-7.02 7.02a4 4 0 01-5.66 0l-1.06-1.06a4 4 0 010-5.66l7.02-7.02a2 2 0 012.83 0l1.89 1.89z" />
              <path d="M7.5 7.5l9 9" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-2xl text-white">
              Farmacia Santo Niño
            </div>
            <div className="text-xs text-white/90">Calidad y confianza</div>
          </div>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            className="p-2 rounded-md bg-fuchsia-500/90 hover:bg-fuchsia-600"
          >
            {open ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        <nav className={`hidden md:flex items-center gap-3`}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/pharmacy');
            }}
            className="inline-flex items-center gap-2 bg-gradient-to from-fuchsia-500 to-fuchsia-700 hover:from-fuchsia-600 hover:to-fuchsia-800 text-white font-semibold py-2 px-4 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 11.5L12 4l9 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 21V12h14v9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Home
          </a>

          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-2 bg-gradient-t from-fuchsia-500 to-fuchsia-700 hover:from-fuchsia-600 hover:to-fuchsia-800 text-white font-semibold py-2 px-4 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 7h18M7 11h10M10 15h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Orden
          </a>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/pharmacy/product');
            }}
            className="inline-flex items-center gap-2 bg-gradient-to from-fuchsia-500 to-fuchsia-700 hover:from-fuchsia-600 hover:to-fuchsia-800 text-white font-semibold py-2 px-4 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 3h18v4H3zM3 9h18v12H3z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Productos
          </a>

          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-2 bg-gradient-to from-fuchsia-500 to-fuchsia-700 hover:from-fuchsia-600 hover:to-fuchsia-800 text-white font-semibold py-2 px-4 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 7h18M6 11h12M9 15h6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Inventario
          </a>

          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-2 bg-gradient-to from-fuchsia-500 to-fuchsia-700 hover:from-fuchsia-600 hover:to-fuchsia-800 text-white font-semibold py-2 px-4 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 7h18M3 12h18M3 17h18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Reportes
          </a>

          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-2 bg-gradient-to from-fuchsia-500 to-fuchsia-700 hover:from-fuchsia-600 hover:to-fuchsia-800 text-white font-semibold py-2 px-4 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 7h18M3 12h18M3 17h18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Facturacion
          </a>

          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center gap-2 bg-gradient-to from-fuchsia-500 to-fuchsia-700 hover:from-fuchsia-600 hover:to-fuchsia-800 text-white font-semibold py-2 px-4 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 2v4M5 7l2 2M19 7l-2 2M4 13h16M8 19h8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Admin
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              signOut();
            }}
            className="inline-flex items-center gap-2 bg-white text-fuchsia-700 font-semibold py-2 px-4 rounded-full shadow-sm hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M16 17l5-5-5-5M21 12H9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 19H6a2 2 0 01-2-2V7a2 2 0 012-2h3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            SignOut
          </a>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-fuchsia-300 px-4 pb-4">
          <nav className="flex flex-col gap-3 py-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                navigate('/pharmacy');
              }}
              className="text-left inline-flex items-center gap-2 bg-fuchsia-500 text-white py-2 px-3 rounded"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 11.5L12 4l9 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 21V12h14v9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Home
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
              className="text-left inline-flex items-center gap-2 bg-fuchsia-500 text-white py-2 px-3 rounded"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 7h18M7 11h10M10 15h4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Orden
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                navigate('/pharmacy/product');
              }}
              className="text-left inline-flex items-center gap-2 bg-fuchsia-500 text-white py-2 px-3 rounded"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 3h18v4H3zM3 9h18v12H3z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Productos
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
              className="text-left inline-flex items-center gap-2 bg-fuchsia-500 text-white py-2 px-3 rounded"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 7h18M6 11h12M9 15h6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Inventario
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
              className="text-left inline-flex items-center gap-2 bg-fuchsia-500 text-white py-2 px-3 rounded"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 7h18M3 12h18M3 17h18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Reportes
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
              className="text-left inline-flex items-center gap-2 bg-fuchsia-500 text-white py-2 px-3 rounded"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 7h18M3 12h18M3 17h18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Facturacion
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
              className="text-left inline-flex items-center gap-2 bg-fuchsia-500 text-white py-2 px-3 rounded"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 2v4M5 7l2 2M19 7l-2 2M4 13h16M8 19h8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Admin
            </a>
            <div className="pt-2 border-t border-fuchsia-300 mt-2">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  signOut();
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-white text-fuchsia-700 py-2 rounded shadow-sm hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M16 17l5-5-5-5M21 12H9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 19H6a2 2 0 01-2-2V7a2 2 0 012-2h3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                SignOut
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default AppMenu;
