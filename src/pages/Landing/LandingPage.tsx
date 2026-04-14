import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import { Pill, Stethoscope, Truck, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../services/productApi';
import type { Product } from '../../models/product.model';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: productsData } = useQuery({
    queryKey: ['landing-products'],
    queryFn: () => productApi.getAll(0, 12),
  });
  const products: Product[] = Array.isArray(productsData?.data)
    ? productsData.data
    : [];

  const services = [
    {
      icon: <Pill size={32} />,
      title: 'Medicamentos',
      desc: 'Amplio catálogo de genéricos y de patente',
    },
    {
      icon: <Stethoscope size={32} />,
      title: 'Asesoría',
      desc: 'Atención farmacéutica profesional',
    },
    {
      icon: <Truck size={32} />,
      title: 'Entregas',
      desc: 'Servicio a domicilio en la zona',
    },
    {
      icon: <Clock size={32} />,
      title: 'Horario extendido',
      desc: 'Lun-Vie 8:00-20:00 | Sáb 9:00-14:00',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-linear-to-br from-blue-600 to-blue-800 text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {t('landing.hero')}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            {t('landing.heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() =>
                navigate(isAuthenticated ? '/app/dashboard' : '/login')
              }
              className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              {t('landing.enterSystem')}
            </button>
            <a
              href="#products"
              className="px-8 py-3 border-2 border-white/50 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              {t('landing.viewProducts')}
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white dark:from-neutral-950" />
      </section>

      {/* Services */}
      <section className="py-16 bg-white dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-12">
            {t('landing.services')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((s, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl mb-4">
                  {s.icon}
                </div>
                <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section
        id="products"
        className="py-16 bg-neutral-50 dark:bg-neutral-900"
      >
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-12">
            {t('landing.featuredProducts')}
          </h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="w-full h-24 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                    <Pill size={32} className="text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mb-2">
                    {p.description}
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    ${p.defaultPrice}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-500">
              Cargando productos...
            </p>
          )}
        </div>
      </section>

      {/* About */}
      <section className="py-16 bg-white dark:bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
            {t('landing.aboutUs')}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed">
            {t('landing.aboutText')}
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
            {t('landing.contact')}
          </h2>
          <div className="space-y-2 text-neutral-600 dark:text-neutral-400">
            <p>{t('landing.address')}</p>
            <p>{t('landing.phone')}</p>
            <p>{t('landing.schedule')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
