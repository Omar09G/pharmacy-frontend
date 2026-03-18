import React from 'react';
import { useNavigate } from 'react-router';
import useAuth from '../../features/auth/hooks/useAuth';

const AppMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full shadow bg-fuchsia-300 text-white p-4">
      <div className="max-w-6xl mx-auto px-2 py-0 flex items-center justify-between gap-6">
        <div
          className="lex items-center text-center font-bold text-2xl"
          onClick={() => navigate('/pharmacy')}
        >
          Farmacia Santo Niño
        </div>
        <nav className="flex items-center gap-5">
          <button
            className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-full"
            onClick={() => navigate('/pharmacy')}
          >
            Home
          </button>
          <button className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-full">
            Orden
          </button>
          <button
            onClick={() => navigate('/pharmacy/product')}
            className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-full"
          >
            Productos
          </button>
          <button className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-full">
            Inventario
          </button>
          <button className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-full">
            Reportes
          </button>
          <button className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-full">
            Facturacion
          </button>
          <button className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-full">
            Admin
          </button>
        </nav>

        <div className="flex items-center gap-2 text-white py-2 px-4 ">
          <div className="text-center">
            <div className="text-balance font-sans font-bold text-white">
              Hola {user?.name || user?.username}!!!
            </div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="bg-fuchsia-500 hover:bg-fuchsia-900 text-white font-bold py-2 px-4 rounded-full"
        >
          SignOut
        </button>
      </div>
    </header>
  );
};

export default AppMenu;
