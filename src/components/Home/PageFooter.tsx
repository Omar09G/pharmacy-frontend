import React from 'react';

const AppFooter: React.FC = () => {
  return (
    <footer className="w-full bg-fuchsia-700 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="font-bold text-lg">
              Farmacia Santo Niño S.A. de C.V.
            </div>
            <div className="text-sm mt-2">
              Av Presas, Tezontepec de Aldama Hidalgo
            </div>
            <div className="text-sm">Tel: (772) 124-8765</div>
          </div>

          <div>
            <div className="font-semibold mb-2">Enlaces</div>
            <ul className="text-sm space-y-1">
              <li>
                <a className="hover:underline" href="/pharmacy">
                  Home
                </a>
              </li>
              <li>
                <a className="hover:underline" href="/pharmacy/product">
                  Productos
                </a>
              </li>
              <li>
                <a className="hover:underline" href="#">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-2">Horario</div>
            <div className="text-sm">Lunes - Viernes: 8:00 - 20:00</div>
            <div className="text-sm">Sábado: 9:00 - 14:00</div>
          </div>
        </div>

        <div className="mt-6 border-t border-fuchsia-600 pt-4 text-sm text-center md:text-left">
          © {new Date().getFullYear()} Farmacia Santo Niño — Todos los derechos
          reservados
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
