import React from 'react';
import heroImg from '../../assets/imagen/pharmacy-front.jpg';
import img2 from '../../assets/imagen/pharmacy-2.jpg';
import img3 from '../../assets/imagen/pharmacy-3.jpeg';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
const AppContent: React.FC = () => {
  const position: [number, number] = [20.158410801292955, -99.26221931349626];
  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
      <section className="bg-white rounded shadow overflow-hidden mb-6">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img
              src={heroImg}
              alt="Farmacia Santo Niño"
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold mb-3 text-fuchsia-700">
              Farmacia Santo Niño
            </h1>
            <p className="text-muted mb-3">
              Bienvenido a nuestra aplicación de punto de venta, diseñada para
              facilitar la gestión de ventas y el control de inventarios.
            </p>
            <p className="text-muted mb-3">
              Nuestra interfaz es rápida, intuitiva y accesible desde
              dispositivos móviles para que pueda atender a sus clientes desde
              cualquier lugar.
            </p>
            <div className="mt-4">
              <button
                onClick={() =>
                  window.scrollTo({ top: 400, behavior: 'smooth' })
                }
                className="bg-fuchsia-500 text-white py-2 px-4 rounded"
              >
                Conocer más
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded shadow p-6">
          <img
            src={img2}
            alt="Objetivo"
            className="w-full h-40 object-cover rounded mb-4"
          />
          <h3 className="font-semibold mb-2 text-fuchsia-700">Objetivo</h3>
          <p className="text-muted text-justify">
            Brindar un servicio farmacéutico eficiente mediante un sistema de
            ventas confiable y fácil de usar que permita gestionar inventarios y
            facturación con rapidez.
          </p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <img
            src={img3}
            alt="Misión"
            className="w-full h-40 object-cover rounded mb-4"
          />
          <h3 className="font-semibold mb-2 text-fuchsia-700">Misión</h3>
          <p className="text-muted text-justify">
            Proveer medicamentos y atención de calidad, apoyados por tecnología
            para mejorar la experiencia del cliente y optimizar procesos
            internos.
          </p>
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="w-full h-40 bg-fuchsia-100 rounded mb-4 flex items-center justify-center text-fuchsia-700 font-semibold">
            Visión
          </div>
          <h3 className="font-semibold mb-2 text-fuchsia-700">Visión</h3>
          <p className="text-muted text-justify">
            Ser una farmacia reconocida por su servicio humano y por emplear
            soluciones digitales que modernicen la atención sanitaria en la
            comunidad.
          </p>
        </div>
      </section>

      <section className="bg-white rounded shadow p-6 mb-6">
        <h2 className="font-semibold mb-4 text-fuchsia-700">Servicios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold">Venta de medicamentos</h4>
            <p className="text-muted">
              Ofrecemos genéricos y de patente con asesoramiento farmacéutico.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Control de inventario</h4>
            <p className="text-muted">
              Gestión de stock con alertas para evitar faltantes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Reportes</h4>
            <p className="text-muted">
              Generación de informes detallados para análisis y toma de
              decisiones.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Facturación</h4>
            <p className="text-muted">
              Generación de facturas precisas y rápidas para una gestión
              eficiente.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Control de Usuarios</h4>
            <p className="text-muted">
              Gestión de usuarios con permisos y roles para una administración
              segura.
            </p>
          </div>
        </div>
      </section>
      <section className="bg-white rounded shadow p-6 mb-6">
        <h2 className="font-semibold mb-4 text-fuchsia-700">Mapa</h2>
        <div>
          <h4 className="font-semibold">Ubicación</h4>

          <MapContainer
            center={position}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '400px', width: '100%' }} // Required: Map must have a height
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                Nos encontramos en Av Presas, Tezontepec de Aldama Hidalgo, a un
                costado de la plaza central.
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </section>
    </main>
  );
};

export default AppContent;
