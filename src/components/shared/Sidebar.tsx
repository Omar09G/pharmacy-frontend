import React from 'react';
import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
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
}

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const isAdmin = user?.role === ROLES.ADMIN;

  const mainItems: NavItem[] = [
    {
      to: '/app/dashboard',
      label: t('nav.dashboard'),
      icon: <LayoutDashboard size={20} />,
    },
    { to: '/app/pos', label: t('nav.pos'), icon: <ShoppingCart size={20} /> },
    {
      to: '/app/products',
      label: t('nav.products'),
      icon: <Package size={20} />,
    },
    {
      to: '/app/customers',
      label: t('nav.customers'),
      icon: <Users size={20} />,
    },
    {
      to: '/app/suppliers',
      label: t('nav.suppliers'),
      icon: <Truck size={20} />,
    },
    {
      to: '/app/categories',
      label: t('nav.categories'),
      icon: <FolderOpen size={20} />,
    },
    { to: '/app/sales', label: t('nav.sales'), icon: <Receipt size={20} /> },
    {
      to: '/app/purchases',
      label: t('nav.purchases'),
      icon: <ShoppingBag size={20} />,
    },
    {
      to: '/app/discounts',
      label: t('nav.discounts'),
      icon: <Tags size={20} />,
    },
    {
      to: '/app/payment-methods',
      label: t('nav.paymentMethods'),
      icon: <CreditCard size={20} />,
    },
    {
      to: '/app/cash-journal',
      label: t('nav.cashJournal'),
      icon: <Landmark size={20} />,
    },
    {
      to: '/app/inventory',
      label: t('nav.inventory'),
      icon: <Warehouse size={20} />,
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

  const renderLink = (item: NavItem) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700',
        )
      }
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 flex flex-col transition-transform duration-200',
          'md:translate-x-0 md:static md:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <NavLink to="/app/dashboard" className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <Pill size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg text-neutral-900 dark:text-white">
              Farmacia
            </span>
          </NavLink>
          <button
            className="md:hidden p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {mainItems.map(renderLink)}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2 px-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  <Settings size={12} className="inline mr-1" />
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
