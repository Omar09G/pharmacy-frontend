import React from 'react';

const AppFooter: React.FC = () => {
  return (
    <footer className="w-full bg-surface border-t border-primary-600 shadow  bg-fuchsia-300 text-white p-4">
      <div className="font-black max-w-6xl mx-auto px-4 py-6 text-sm text-text flex flex-col md:flex-row md:justify-between">
        <div>
          <div className="font-black">Farmacia Santo Niño S.A. de C.V.</div>
          <div className="text-muted">
            Av Presas, Tezontepec de Aldama Hidalgo
          </div>
          <div className="text-muted">Tel: (772) 124-8765</div>
        </div>
        <div className="mt-4 md:mt-0 text-muted">
          © {new Date().getFullYear()} Farmacia Santo Niño
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
