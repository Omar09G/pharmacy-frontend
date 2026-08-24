import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import PrivateRoute from './components/shared/PrivateRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useInactivityLogout } from './hooks/useInactivityLogout';
import { showError } from './utils/alerts';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/Landing/LandingPage'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage'));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const POSPage = lazy(() => import('./pages/POS/POSPage'));
const ProductsPage = lazy(() => import('./pages/Products/ProductsPage'));
const CustomersPage = lazy(() => import('./pages/Customers/CustomersPage'));
const SuppliersPage = lazy(() => import('./pages/Suppliers/SuppliersPage'));
const CategoriesPage = lazy(() => import('./pages/Categories/CategoriesPage'));
const SalesPage = lazy(() => import('./pages/Sales/SalesPage'));
const PurchasesPage = lazy(() => import('./pages/Purchases/PurchasesPage'));
const DiscountsPage = lazy(() => import('./pages/Discounts/DiscountsPage'));
const PaymentMethodsPage = lazy(
  () => import('./pages/PaymentMethods/PaymentMethodsPage'),
);
const CashJournalPage = lazy(
  () => import('./pages/CashJournal/CashJournalPage'),
);
const InventoryPage = lazy(() => import('./pages/Inventory/InventoryPage'));
const UsersPage = lazy(() => import('./pages/Admin/Users/UsersPage'));
const RolesPage = lazy(() => import('./pages/Admin/Roles/RolesPage'));
const PermissionsPage = lazy(
  () => import('./pages/Admin/Permissions/PermissionsPage'),
);
const AuditLogPage = lazy(() => import('./pages/Admin/AuditLog/AuditLogPage'));
const UnitsPage = lazy(() => import('./pages/Admin/Config/Units/UnitsPage'));
const TaxProfilesPage = lazy(
  () => import('./pages/Admin/Config/Taxes/TaxProfilesPage'),
);
const LocationsPage = lazy(
  () => import('./pages/Admin/Config/Locations/LocationsPage'),
);

const Fallback = () => <LoadingSpinner className="min-h-screen" size="lg" />;

/** Route guard mirroring the backend authz middleware permissions. */
const guarded = (permission: string, element: React.ReactNode) => (
  <PrivateRoute requiredPermission={permission}>{element}</PrivateRoute>
);

const App: React.FC = () => {
  // A-5 + M-9: Logout after 15 min of inactivity; warn at 13 min
  useInactivityLogout({
    logoutAfterMs: 15 * 60 * 1000,
    warningAfterMs: 13 * 60 * 1000,
    onWarning: () =>
      showError('Tu sesión expirará en 2 minutos por inactividad.'),
  });

  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route
            path="pos"
            element={guarded('SALES_MANAGER', <POSPage />)}
          />
          <Route
            path="products"
            element={guarded('PRODUCT_MANAGEMENT', <ProductsPage />)}
          />
          <Route
            path="customers"
            element={guarded('SALES_MANAGER', <CustomersPage />)}
          />
          <Route
            path="suppliers"
            element={guarded('PRODUCT_MANAGEMENT', <SuppliersPage />)}
          />
          <Route
            path="categories"
            element={guarded('PRODUCT_MANAGEMENT', <CategoriesPage />)}
          />
          <Route
            path="sales"
            element={guarded('SALES_MANAGER', <SalesPage />)}
          />
          <Route
            path="purchases"
            element={guarded('PRODUCT_MANAGEMENT', <PurchasesPage />)}
          />
          <Route
            path="discounts"
            element={guarded('PRODUCT_MANAGEMENT', <DiscountsPage />)}
          />
          <Route
            path="payment-methods"
            element={guarded('PRODUCT_MANAGEMENT', <PaymentMethodsPage />)}
          />
          <Route
            path="cash-journal"
            element={guarded('SALES_MANAGER', <CashJournalPage />)}
          />
          <Route
            path="inventory"
            element={guarded('PRODUCT_MANAGEMENT', <InventoryPage />)}
          />

          {/* Admin only */}
          <Route
            path="admin/users"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <UsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/roles"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <RolesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/permissions"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <PermissionsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/audit-log"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AuditLogPage />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/config/units"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <UnitsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/config/taxes"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <TaxProfilesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/config/locations"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <LocationsPage />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Legacy redirects */}
        <Route
          path="/pharmacy"
          element={<Navigate to="/app/dashboard" replace />}
        />
        <Route
          path="/pharmacy/*"
          element={<Navigate to="/app/dashboard" replace />}
        />

        {/* Catch-all — 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
