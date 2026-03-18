import React from 'react';

const AppContent: React.FC = () => {
  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-10 shadow ">
      <div className="bg-surface rounded shadow p-6">
        <h1 className="text-2xl font-semibold mb-4 text-primary">
          Pharmacy Santo Niño
        </h1>
        <p className="text-muted mb-3 text-justify">
          Esta aplicación es el punto de venta de la farmacia
        </p>
        <p className="text-muted mb-3 text-justify">
          La interfaz está diseñada para agilizar el proceso de facturación y
          control de stock, con opciones para administrar usuarios y ver
          estadísticas relevantes del negocio.
        </p>
        <p className="text-muted">Imagen</p>
      </div>

      <div className="bg-surface rounded shadow p-6">
        <h2 className="font-semibold mb-4 text-primary">
          Venta de Medicamento
        </h2>
        <p className=" mb-3 text-justify">Genetico</p>
        <p className="text-muted mb-3 text-justify">Medicamento Generico</p>
        <p className="text-muted">Imagen</p>
      </div>

      <div className="bg-surface rounded shadow p-6">
        <h2 className="font-semibold mb-4 text-primary">
          Estamos ubicados en:
        </h2>
        <p className=" mb-3 text-justify">Genetico</p>
        <p className="text-muted mb-3 text-justify">Medicamento Generico</p>
        <p className="text-muted">Imagen</p>
      </div>
    </main>
  );
};

export default AppContent;
