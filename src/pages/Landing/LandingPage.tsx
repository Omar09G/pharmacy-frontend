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
    queryFn: () => productApi.getAll(1, 12),
  });
  const products: Product[] = Array.isArray(productsData?.data)
    ? productsData.data
    : [];

  const services = [
    {
      icon: <Pill size={28} aria-hidden="true" />,
      title: 'Medicamentos',
      desc: 'Amplio catálogo de genéricos y de patente',
    },
    {
      icon: <Stethoscope size={28} aria-hidden="true" />,
      title: 'Asesoría',
      desc: 'Atención farmacéutica profesional',
    },
    {
      icon: <Truck size={28} aria-hidden="true" />,
      title: 'Entregas',
      desc: 'Servicio a domicilio en la zona',
    },
    {
      icon: <Clock size={28} aria-hidden="true" />,
      title: 'Horario extendido',
      desc: 'Lun-Vie 8:00-20:00 | Sáb 9:00-14:00',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-brand-strong dark:bg-surface overflow-hidden grain">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-16 h-80 w-80 rounded-full bg-brand/25 blur-3xl"
        />
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-36 text-center text-on-brand">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm backdrop-blur mb-6 animate-rise">
            <Pill size={16} aria-hidden="true" />
            Farmacia Santo Niño
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95] max-w-3xl mx-auto animate-rise [animation-delay:60ms]">
            {t('landing.hero')}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl mx-auto animate-rise [animation-delay:120ms]">
            {t('landing.heroSubtitle')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-rise [animation-delay:180ms]">
            <button
              onClick={() =>
                navigate(isAuthenticated ? '/app/dashboard' : '/login')
              }
              title={t('tooltips.enterSystem')}
              className="min-h-11 px-8 py-3 rounded-lg bg-canvas text-brand font-semibold hover:bg-raised active:scale-[0.98] transition-all shadow-lg"
            >
              {t('landing.enterSystem')}
            </button>
            <a
              href="#products"
              className="min-h-11 px-8 py-3 rounded-lg border border-white/40 font-semibold hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              {t('landing.viewProducts')}
            </a>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-canvas"
        />
      </section>

      {/* Services */}
      <section className="py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-center text-ink mb-12">
            {t('landing.services')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <div
                key={i}
                className="group p-6 rounded-xl border border-line bg-surface hover:border-brand/40 hover:-translate-y-0.5 transition-all animate-rise"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-brand-soft text-brand group-hover:bg-brand group-hover:text-on-brand transition-colors mb-4">
                  {s.icon}
                </div>
                <h3 className="font-display font-semibold text-lg text-ink mb-1">
                  {s.title}
                </h3>
                <p className="text-sm text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="py-20 bg-raised/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-center text-ink mb-12">
            {t('landing.featuredProducts')}
          </h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p, i) => (
                <article
                  key={p.id}
                  className="rounded-xl border border-line bg-surface p-5 hover:shadow-md hover:-translate-y-0.5 transition-all animate-rise"
                  style={{ animationDelay: `${(i % 12) * 50}ms` }}
                >
                  <div className="w-full h-24 rounded-lg bg-brand-soft flex items-center justify-center mb-4">
                    <Pill size={32} className="text-brand" aria-hidden="true" />
                  </div>
                  <h3 className="font-display font-semibold text-ink text-sm mb-1 line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-muted mb-2 line-clamp-2 min-h-8">
                    {p.description}
                  </p>
                  <p className="text-lg font-semibold font-mono tabular-nums tracking-tight text-brand">
                    ${p.defaultPrice}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">{t('common.loading')}</p>
          )}
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-canvas">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-ink mb-6">
            {t('landing.aboutUs')}
          </h2>
          <p className="text-muted text-lg leading-relaxed">
            {t('landing.aboutText')}
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-raised/50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-ink mb-6">
            {t('landing.contact')}
          </h2>
          <address className="not-italic space-y-2 text-muted">
            <p>{t('landing.address')}</p>
            <p className="font-mono tabular-nums">{t('landing.phone')}</p>
            <p>{t('landing.schedule')}</p>
          </address>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
