import React from 'react';
import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { hasPermission, useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { ROLES } from '../../utils/constants';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  FolderOpen,
  Receipt,
  ShoppingBag,
  Tags,
  CreditCard,
  Landmark,
  Warehouse,
  Shield,
  KeyRound,
  Settings,
  FileText,
  Ruler,
  Calculator,
  MapPin,
  X,
  Pill,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  /** Permission required to see the link (mirrors backend authz middleware). */
  permission?: string;
}

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const isAdmin = user?.role === ROLES.ADMIN;

  //Get env variables NAME, VERSION, ENV
  const appName = import.meta.env.VITE_APP_NAME || 'Pharmacy App';
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
  const appEnv = import.meta.env.VITE_APP_ENV || 'production';

  const mainItems: NavItem[] = [
    {
      to: '/app/dashboard',
      label: t('nav.dashboard'),
      icon: <LayoutDashboard size={20} />,
    },
    {
      to: '/app/pos',
      label: t('nav.pos'),
      icon: <ShoppingCart size={20} />,
      permission: 'SALES_MANAGER',
    },
    {
      to: '/app/products',
      label: t('nav.products'),
      icon: <Package size={20} />,
      permission: 'PRODUCT_MANAGEMENT',
    },
    {
      to: '/app/customers',
      label: t('nav.customers'),
      icon: <Users size={20} />,
      permission: 'SALES_MANAGER',
    },
    {
      to: '/app/suppliers',
      label: t('nav.suppliers'),
      icon: <Truck size={20} />,
      permission: 'PRODUCT_MANAGEMENT',
    },
    {
      to: '/app/categories',
      label: t('nav.categories'),
      icon: <FolderOpen size={20} />,
      permission: 'PRODUCT_MANAGEMENT',
    },
    {
      to: '/app/sales',
      label: t('nav.sales'),
      icon: <Receipt size={20} />,
      permission: 'SALES_MANAGER',
    },
    {
      to: '/app/purchases',
      label: t('nav.purchases'),
      icon: <ShoppingBag size={20} />,
      permission: 'PRODUCT_MANAGEMENT',
    },
    {
      to: '/app/discounts',
      label: t('nav.discounts'),
      icon: <Tags size={20} />,
      permission: 'PRODUCT_MANAGEMENT',
    },
    {
      to: '/app/payment-methods',
      label: t('nav.paymentMethods'),
      icon: <CreditCard size={20} />,
      permission: 'PRODUCT_MANAGEMENT',
    },
    {
      to: '/app/cash-journal',
      label: t('nav.cashJournal'),
      icon: <Landmark size={20} />,
      permission: 'SALES_MANAGER',
    },
    {
      to: '/app/inventory',
      label: t('nav.inventory'),
      icon: <Warehouse size={20} />,
      permission: 'PRODUCT_MANAGEMENT',
    },
  ];

  const adminItems: NavItem[] = [
    {
      to: '/app/admin/users',
      label: t('nav.users'),
      icon: <Users size={20} />,
      adminOnly: true,
    },
    {
      to: '/app/admin/roles',
      label: t('nav.roles'),
      icon: <Shield size={20} />,
      adminOnly: true,
    },
    {
      to: '/app/admin/permissions',
      label: t('nav.permissions'),
      icon: <KeyRound size={20} />,
      adminOnly: true,
    },
    {
      to: '/app/admin/audit-log',
      label: t('nav.auditLog'),
      icon: <FileText size={20} />,
      adminOnly: true,
    },
    {
      to: '/app/admin/config/units',
      label: t('nav.units'),
      icon: <Ruler size={20} />,
      adminOnly: true,
    },
    {
      to: '/app/admin/config/taxes',
      label: t('nav.taxes'),
      icon: <Calculator size={20} />,
      adminOnly: true,
    },
    {
      to: '/app/admin/config/locations',
      label: t('nav.locations'),
      icon: <MapPin size={20} />,
      adminOnly: true,
    },
  ];

  const visibleMainItems = mainItems.filter(
    (item) => !item.permission || hasPermission(user, item.permission),
  );

  const renderLink = (item: NavItem) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors outline-offset-2',
          isActive
            ? 'bg-brand-soft text-brand'
            : 'text-muted hover:bg-raised hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              aria-hidden="true"
              className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-brand"
            />
          )}
          {item.icon}
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 bg-surface border-r border-line flex flex-col transition-transform duration-200',
          'md:translate-x-0 md:static md:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-line">
          <NavLink
            to="/app/dashboard"
            className="flex items-center gap-2.5 min-w-0"
          >
            <div className="bg-brand text-on-brand rounded-xl p-1.5 shrink-0">
              <Pill size={20} aria-hidden="true" />
            </div>
            <span className="min-w-0">
              <span className="block truncate font-display font-semibold text-base leading-tight text-ink">
                {appName}
              </span>
              <span className="block text-[11px] font-mono text-muted">
                v{appVersion} · {appEnv}
              </span>
            </span>
          </NavLink>
          <button
            title={t('tooltips.closeSidebar')}
            aria-label={t('tooltips.closeSidebar')}
            className="md:hidden p-2 inline-flex items-center justify-center rounded-lg hover:bg-raised text-muted"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Main">
          {visibleMainItems.map(renderLink)}

          {isAdmin && (
            <>
              <div className="pt-5 pb-2 px-3">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted/80">
                  <Settings
                    size={12}
                    className="inline mr-1"
                    aria-hidden="true"
                  />
                  {t('nav.admin')}
                </span>
              </div>
              {adminItems.map(renderLink)}
            </>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
