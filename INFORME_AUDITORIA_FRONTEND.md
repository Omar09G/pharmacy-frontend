# 📋 Informe de Auditoría — Pharmacy Frontend

> **Fecha:** 14 de abril de 2026
> **Proyecto:** pharmacy-frontend (React + Vite + TypeScript + Tailwind CSS)
> **Alcance:** Rendimiento, seguridad, lógica de negocio, componentes, API, login, validaciones, vulnerabilidades y flujo de trabajo.
> **Tipo:** Solo lectura — ningún archivo fue modificado.

---

## Tabla de contenido

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Rendimiento](#2-rendimiento)
3. [Seguridad y vulnerabilidades](#3-seguridad-y-vulnerabilidades)
4. [Login y autenticación](#4-login-y-autenticación)
5. [Llamados a API y servicios](#5-llamados-a-api-y-servicios)
6. [Validaciones de formularios](#6-validaciones-de-formularios)
7. [Lógica de negocio](#7-lógica-de-negocio)
8. [Componentes y UI](#8-componentes-y-ui)
9. [Mejora visual](#9-mejora-visual)
10. [Flujo de trabajo](#10-flujo-de-trabajo)
11. [Dependencias y configuración](#11-dependencias-y-configuración)
12. [Resumen de hallazgos por prioridad](#12-resumen-de-hallazgos-por-prioridad)
13. [Plan de acción recomendado](#13-plan-de-acción-recomendado)

---

## 1. Resumen ejecutivo

| Categoría         | Estado                                                |
| ----------------- | ----------------------------------------------------- |
| Rendimiento       | 🟡 Bueno con mejoras puntuales                        |
| Seguridad         | 🔴 Requiere atención inmediata                        |
| Login/Auth        | 🔴 Dos sistemas paralelos — riesgo alto               |
| API/Servicios     | 🟡 Funcional pero con inconsistencias                 |
| Validaciones      | 🟠 Esquemas Zod con `.catch()` anulan protecciones    |
| Lógica de negocio | 🟡 POS funcional, dashboard con mock permanente       |
| Componentes/UI    | 🟢 Bien diseñados, accesibilidad mejorable            |
| Flujo de trabajo  | 🟡 Rutas protegidas pero permisos granulares ausentes |

**Archivos revisados:** ~50 archivos principales
**Issues críticos:** 7 | **Altos:** 8 | **Medios:** 12

---

## 2. Rendimiento

### 2.1 ✅ Lo que está bien

| Área           | Detalle                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------- |
| Code splitting | Todas las páginas usan `React.lazy()` con `Suspense` en `App.tsx`                                   |
| React Query    | `staleTime: 2min`, `retry: 1`, `refetchOnWindowFocus: false` configurados globalmente en `main.tsx` |
| Memoización    | Los arrays derivados en POS usan `useMemo` correctamente                                            |
| Bundle         | Usa `@vitejs/plugin-react-swc` (compilación rápida)                                                 |

### 2.2 🟠 Mejoras necesarias

| #   | Hallazgo                                                                                            | Archivo                         | Mejora                                                                                              |
| --- | --------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------- |
| P-1 | **POS carga 100 productos de golpe** sin paginación virtual                                         | `pages/POS/POSPage.tsx` L90     | Implementar búsqueda en servidor con debounce en lugar de cargar 100 productos y filtrar en cliente |
| P-2 | **POS carga 100 clientes** al montar                                                                | `pages/POS/POSPage.tsx` L94     | Usar combobox con búsqueda en servidor                                                              |
| P-3 | **`getTotal()`, `getSubtotal()`, `getTotalDiscount()`** son funciones que recalculan en cada render | `store/posStore.ts` L188-191    | Convertir a valores derivados con `useMemo` o selectors de Zustand                                  |
| P-4 | **Landing page carga productos** para usuarios no autenticados                                      | `pages/Landing/LandingPage.tsx` | Limitar a 6 productos con paginación en servidor                                                    |
| P-5 | **`saleApi.getSaleDetails`** tiene límite hardcodeado de 1000                                       | `services/saleApi.ts` L39       | Implementar paginación real o scroll virtual                                                        |
| P-6 | **`useCrudModal`** usa `setTimeout(0)` para forzar re-render                                        | `hooks/useCrudModal.ts` L15     | Refactorizar con `useCallback` y key de React en vez de hack con timeout                            |
| P-7 | **No hay Error Boundaries** — un error en un componente hijo crashea toda la app                    | Ninguno existe                  | Agregar `react-error-boundary` a nivel de layout y página                                           |

---

## 3. Seguridad y vulnerabilidades

### 3.1 🔴 Críticos

| #   | Vulnerabilidad                                              | Archivo                                                                                | Descripción                                                                                                                                                                                                               |
| --- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S-1 | **Token JWT en localStorage**                               | `store/authStore.ts`, `features/auth/store/AuthProvider.tsx`                           | Vulnerable a ataques XSS. Un script malicioso inyectado puede leer `localStorage.getItem('pharmacy_auth')` y robar el token. **Recomendación:** Usar HttpOnly cookies o al menos encriptar el token en memoria.           |
| S-2 | **Sin protección CSRF**                                     | Todos los servicios                                                                    | No se envían tokens CSRF en las peticiones de mutación. Si el backend no valida origin/referer, es vulnerable.                                                                                                            |
| S-3 | **Tres instancias de axios diferentes**                     | `api/axiosInstance.ts`, `services/Service.ts`, `features/auth/services/authService.ts` | Cada una tiene su propia URL base y manejo de tokens. `Service.ts` lee token de `localStorage('auth_token_pharm')` mientras `axiosInstance.ts` lee de Zustand. Un atacante podría explotar la inconsistencia entre ambos. |
| S-4 | **No hay validación de entrada en el servidor de búsqueda** | `services/productApi.ts` L15, `services/customerApi.ts` L14                            | El parámetro de búsqueda se envía tal cual al backend sin sanitizar. Si el backend no escapa el input, hay riesgo de SQL injection desde el frontend.                                                                     |

### 3.2 🟠 Altos

| #   | Vulnerabilidad                                          | Archivo                       | Descripción                                                                                                                                                     |
| --- | ------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S-5 | **Sin token refresh**                                   | `store/authStore.ts`          | El JWT se almacena sin renovación. Cuando expira, el usuario es redirigido a login sin posibilidad de refresh transparente.                                     |
| S-6 | **401 handler hace logout y redirect sin confirmación** | `api/axiosInstance.ts` L26-30 | Un endpoint que falle con 401 por razones no relacionadas al token (error del backend) deslogueará al usuario.                                                  |
| S-7 | **Rol hardcodeado en `getMethodName()`**                | `store/posStore.ts` L198-204  | Los IDs de métodos de pago `{6: 'Efectivo', 7: 'Tarjeta de Crédito'}` están hardcodeados. Si los IDs cambian en la BD se rompe la lógica de cambio en efectivo. |
| S-8 | **Sin rate limiting en login**                          | `pages/Auth/LoginPage.tsx`    | No hay control de intentos fallidos del lado del frontend (deshabilitación temporal del botón, captcha).                                                        |

### 3.3 🟡 Medios

| #    | Vulnerabilidad                                               | Archivo                    |
| ---- | ------------------------------------------------------------ | -------------------------- |
| S-9  | Sin política de contraseña fuerte en el frontend             | `pages/Auth/LoginPage.tsx` |
| S-10 | Sin `autoComplete="current-password"` en input de contraseña | `pages/Auth/LoginPage.tsx` |
| S-11 | URL de API fallback a localhost en producción                | `utils/constants.ts` L2-3  |

---

## 4. Login y autenticación

### 4.1 🔴 CRÍTICO: Dos sistemas de autenticación en paralelo

El proyecto tiene **dos sistemas de auth independientes** que operan simultáneamente:

| Sistema                          | Archivos                                                                                                              | Método                           | Usado por                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| **Zustand** (authStore)          | `store/authStore.ts`                                                                                                  | Zustand con `persist` middleware | `LoginPage.tsx`, `PrivateRoute.tsx`, `Sidebar.tsx`, `Topbar.tsx`, todas las páginas |
| **React Context** (AuthProvider) | `features/auth/store/AuthProvider.tsx`, `features/auth/store/authContext.ts`, `features/auth/services/authService.ts` | Context API con useState         | `LoginForm.tsx` (feature), envuelve toda la app en `main.tsx`                       |

**Problemas generados:**

- `AuthProvider` se monta en `main.tsx` (línea 39) y ejecuta `fetchProfile()` con el token
- `restoreSession()` del Zustand store también ejecuta `GET /auth/profile` en `main.tsx` (línea 20)
- **Resultado: Al iniciar la app se hacen DOS llamadas a `/auth/profile`** — una del Context y otra del Zustand

**Recomendación:** Eliminar el sistema de React Context (`features/auth/`) y consolidar todo en `store/authStore.ts` que ya es el que usan todos los componentes activos.

### 4.2 Flujo de login actual

```
1. Usuario ingresa credenciales en LoginPage.tsx
2. Se llama authStore.login() → POST /auth/login
3. Token se guarda en Zustand (persist → localStorage key 'pharmacy_auth')
4. AL MISMO TIEMPO: AuthProvider guarda en localStorage key 'auth_token_pharm'
5. Redirect a /app/dashboard
6. PrivateRoute valida isAuthenticated del Zustand store
```

### 4.3 Sesión y recuperación

| Aspecto                  | Estado | Detalle                                                                                    |
| ------------------------ | ------ | ------------------------------------------------------------------------------------------ |
| Persistencia del token   | ✅     | `zustand/persist` con key `pharmacy_auth`                                                  |
| Restauración al recargar | ⚠️     | Se llama `restoreSession()` pero también AuthProvider ejecuta `fetchProfile()` (duplicado) |
| Logout                   | ✅     | Limpia state, localStorage y redirige a `/login`                                           |
| Expiración de token      | 🔴     | No hay manejo. El token se usa hasta que falla con 401                                     |
| Refresh token            | 🔴     | No implementado                                                                            |
| Timeout de inactividad   | 🔴     | No existe                                                                                  |

---

## 5. Llamados a API y servicios

### 5.1 🔴 Llamadas API duplicadas

| #     | Duplicación                                                       | Archivos                                                                                            | Impacto                                          |
| ----- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| API-1 | **Doble llamada a `/auth/profile` al iniciar**                    | `main.tsx` L20 (Zustand restoreSession) + `AuthProvider.tsx` L30 (Context fetchProfile)             | 2 peticiones HTTP al backend en cada carga       |
| API-2 | **`saleApi.getById` y `saleApi.getDetailById`** son idénticos     | `services/saleApi.ts` L17 y L19                                                                     | Confusión — ambas llaman a `GET /sale/{id}`      |
| API-3 | **`getAllTaxProfiles` existe en `productApi` Y en `purchaseApi`** | `services/productApi.ts`, `services/purchaseApi.ts`                                                 | Código duplicado que puede divergir              |
| API-4 | **Tres archivos axios con URL base diferente**                    | `axiosInstance.ts` (usa constant), `Service.ts` (hardcoded 8080), `authService.ts` (hardcoded 8080) | Mantenimiento complejo, riesgo de inconsistencia |

### 5.2 🟠 Inconsistencias en servicios

| #     | Problema                                    | Detalle                                                                                                                                                                                         |
| ----- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API-5 | **PUT para crear, PATCH para actualizar**   | Todos los servicios usan `api.put()` para create — esto es correcto pero no estándar REST. PUT debería ser idempotente (crear O actualizar con el mismo ID). Lo estándar es `POST` para create. |
| API-6 | **Sin manejo de errores en servicios**      | Ningún servicio tiene `try-catch`. Todos propagan errores crudos al componente.                                                                                                                 |
| API-7 | **Naming inconsistente en customerApi**     | `getByIdCreditAccount`, `createCreditAccount`, `updateCreditAccount` — deberían estar en un sub-objeto `credit`                                                                                 |
| API-8 | **dashboardApi retorna datos mock SIEMPRE** | `MOCK_ENABLED = true` en `services/dashboardApi.ts` L10 — nunca llama a endpoints reales del backend                                                                                            |

### 5.3 Tabla de servicios y estado

| Servicio         | Archivo                        | Create | Read    | Update            | Delete    | Estado                            |
| ---------------- | ------------------------------ | ------ | ------- | ----------------- | --------- | --------------------------------- |
| productApi       | `services/productApi.ts`       | ✅ PUT | ✅ GET  | ✅ PATCH          | ✅ DELETE | ⚠️ Incluye units y taxProfiles    |
| saleApi          | `services/saleApi.ts`          | ✅ PUT | ✅ GET  | ✅ PATCH (cancel) | ❌        | ⚠️ Método duplicado getDetailById |
| customerApi      | `services/customerApi.ts`      | ✅ PUT | ✅ GET  | ✅ PATCH          | ✅ DELETE | ⚠️ Naming inconsistente en credit |
| supplierApi      | `services/supplierApi.ts`      | ✅     | ✅      | ✅                | ✅        | ✅ OK                             |
| cashApi          | `services/cashApi.ts`          | ✅     | ✅      | ✅                | ✅        | ✅ OK                             |
| dashboardApi     | `services/dashboardApi.ts`     | ❌     | ⚠️ MOCK | ❌                | ❌        | 🔴 Solo datos ficticios           |
| inventoryApi     | `services/inventoryApi.ts`     | ✅     | ✅      | ✅                | ✅        | ✅ OK                             |
| purchaseApi      | `services/purchaseApi.ts`      | ✅     | ✅      | ✅                | ✅        | ⚠️ Duplica taxProfiles            |
| roleApi          | `services/roleApi.ts`          | ✅     | ✅      | ✅                | ✅        | ✅ OK                             |
| userApi          | `services/userApi.ts`          | ✅     | ✅      | ✅                | ✅        | ✅ OK                             |
| discountApi      | `services/discountApi.ts`      | ✅     | ✅      | ✅                | ✅        | ✅ OK                             |
| paymentMethodApi | `services/paymentMethodApi.ts` | ✅     | ✅      | ✅                | ✅        | ✅ OK                             |
| categoryApi      | `services/categoryApi.ts`      | ✅     | ✅      | ✅                | ✅        | ✅ OK                             |

---

## 6. Validaciones de formularios

### 6.1 🟠 Problema generalizado: `.catch()` en esquemas Zod

Múltiples esquemas Zod usan `.catch('')` o `.catch(0)` que **silencian los errores de validación**:

```typescript
// Ejemplo en ProductsPage.tsx
sku: z.string().catch(''),        // ⚠️ Acepta cualquier valor inválido
barcode: z.string().catch(''),    // ⚠️ Siempre pasa validación
purchasePrice: z.coerce.number().catch(0),  // ⚠️ Precio 0 aceptado
```

**Impacto:** Datos inválidos llegan al backend porque el frontend no los detiene.

### 6.2 Validaciones faltantes por módulo

| Módulo        | Validación faltante                                     | Impacto                                                           |
| ------------- | ------------------------------------------------------- | ----------------------------------------------------------------- |
| **Productos** | `salePrice > purchasePrice` no se valida                | Se puede crear un producto con precio de venta menor al de compra |
| **Productos** | No hay detección de SKU/barcode duplicado               | Registros duplicados en la BD                                     |
| **Productos** | `expiryDate` hardcodeado a `nowUTC()`                   | Los lotes se crean con fecha de expiración = hoy                  |
| **Clientes**  | `email: z.string().email().or(z.literal('')).catch('')` | Email vacío y email inválido son ambos aceptados                  |
| **Clientes**  | Límite de crédito no se valida contra balance actual    | Se puede asignar crédito menor al saldo                           |
| **POS**       | No se valida precio unitario > 0 al agregar al carrito  | Producto con precio $0.00 se puede vender                         |
| **POS**       | No se valida que el descuento no exceda el precio       | Subtotal negativo posible                                         |
| **Login**     | Solo usa HTML `required`, sin validación JS             | Sin trimming, sin formato de username                             |
| **Ventas**    | No hay validación de monto de pago ≥ total para tarjeta | Solo se valida para "Efectivo"                                    |

---

## 7. Lógica de negocio

### 7.1 POS (Punto de Venta)

| #    | Problema                                                                 | Archivo                          | Línea aprox.                                                                                                              |
| ---- | ------------------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| BL-1 | **`getMethodName()` usa IDs hardcodeados** `{6:'Efectivo', 7:'Tarjeta'}` | `store/posStore.ts` L198-204     | Si los IDs cambian en BD, la validación de cambio en efectivo se rompe                                                    |
| BL-2 | **Descuento calculado con index del array** en vez de ID real            | `pages/POS/POSPage.tsx` L177     | `discounts[discountId ?? 0]?.value` — usa `discountId` como índice del array, no como ID de la entidad                    |
| BL-3 | **`clearCart()` no resetea `payAmountAt`**                               | `store/posStore.ts` L184         | Después de completar venta, payAmountAt mantiene el valor anterior                                                        |
| BL-4 | **Referencia siempre `'EFECTIVO'`** en payload de venta                  | `pages/POS/POSPage.tsx` L265     | Se debería usar el nombre real del método de pago seleccionado                                                            |
| BL-5 | **`confirmSale()` usa SweetAlert DESPUÉS del payload**                   | `pages/POS/POSPage.tsx` L271-274 | El usuario ve un segundo modal de confirmación (SweetAlert) después del modal de confirmación propio — doble confirmación |

### 7.2 Dashboard

| #    | Problema                                           | Impacto                                                                             |
| ---- | -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| BL-6 | **`MOCK_ENABLED = true` en `dashboardApi.ts`**     | El dashboard NUNCA muestra datos reales. Siempre muestra ventas y stock aleatorios. |
| BL-7 | `totalCustomers: 156` hardcodeado en el componente | El conteo de clientes no refleja la realidad                                        |

### 7.3 Inventario y Productos

| #    | Problema                                                   | Impacto                                                                                                     |
| ---- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| BL-8 | Fecha de expiración de lote = `nowUTC()` al crear producto | Todos los lotes se crean expirados o expirando hoy                                                          |
| BL-9 | No hay validación de stock mínimo configurable             | El alerta de stock bajo usa el valor que traiga `products.minStock` pero no se puede configurar desde la UI |

---

## 8. Componentes y UI

### 8.1 ✅ Fortalezas

| Componente           | Fortaleza                                                                 |
| -------------------- | ------------------------------------------------------------------------- |
| `Modal.tsx`          | Cierre con Escape, click en backdrop, previene scroll del body, 4 tamaños |
| `Button.tsx`         | 5 variantes, estado de carga con spinner, focus ring                      |
| `DataTable.tsx`      | Integración con @tanstack/react-table, skeleton loading, estados vacíos   |
| `Card.tsx`           | Simple, reutilizable, soporte dark mode                                   |
| `LoadingSpinner.tsx` | Tres tamaños, colores configurables                                       |
| `ReceiptPrint.tsx`   | Formato 80mm, forwardRef para react-to-print                              |

### 8.2 🟡 Mejoras necesarias

| #    | Componente         | Problema                                                              | Mejora                                                     |
| ---- | ------------------ | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| UI-1 | `Modal.tsx`        | **Sin ARIA roles** (`role="dialog"`, `aria-modal`, `aria-labelledby`) | Agregar atributos ARIA para lectores de pantalla           |
| UI-2 | `Modal.tsx`        | **No atrapa el foco** (focus trap)                                    | Usar `focus-trap-react` o implementar manualmente          |
| UI-3 | `DataTable.tsx`    | `<th>` sin `scope="col"`                                              | Agregar para accesibilidad                                 |
| UI-4 | Botones de icono   | **Sin `aria-label`** en botones de +/- cantidad, eliminar, etc.       | Agregar aria-label descriptivo a cada botón de solo icono  |
| UI-5 | `ReceiptPrint.tsx` | Ancho hardcodeado a 280px                                             | Hacer configurable para diferentes impresoras              |
| UI-6 | `ReceiptPrint.tsx` | No muestra folio/número de venta                                      | Agregar campo de folio                                     |
| UI-7 | `Input.tsx`        | Wrapper siempre `w-full`                                              | Dificulta layouts inline — agregar prop `wrapperClassName` |

---

## 9. Mejora visual

| #   | Área                            | Mejora propuesta                                                                                                                                           |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V-1 | **POS — modal de confirmación** | Los separadores `--------` y `=` deberían ser líneas `<hr>` con estilos de Tailwind (`border-dashed`, `border-dotted`)                                     |
| V-2 | **Landing page — productos**    | Los productos muestran un div azul vacío en lugar de imagen. Agregar placeholders SVG o imágenes reales                                                    |
| V-3 | **Sidebar**                     | No hay indicador visual de la sección activa más allá del color de texto. Agregar barra lateral de acento o fondo sutil                                    |
| V-4 | **Tablas**                      | El estado hover en filas no es consistente. Agregar `hover:bg-neutral-50 dark:hover:bg-neutral-800/50` en `<tr>`                                           |
| V-5 | **Formularios**                 | Los inputs en modo oscuro podrían tener un borde más visible. Usar `dark:border-neutral-500` en vez de `dark:border-neutral-600`                           |
| V-6 | **Dashboard**                   | Los cards de métricas no tienen animación de entrada. Agregar `animate-fade-in` sutil                                                                      |
| V-7 | **POS — resultado de búsqueda** | El dropdown de productos tiene max-height de 48 (192px). Para pantallas grandes, considerar aumentar a max-h-64                                            |
| V-8 | **Toast/Alerts**                | SweetAlert tiene timer de 2 segundos para success — considerar reducir a 1.5s para velocidad de operación en POS                                           |
| V-9 | **Badges de estado**            | Unificar colores de badge: ventas "completed" en verde, "cancelled" en rojo, "pending" en amarillo — validar que todos los módulos usen los mismos colores |

---

## 10. Flujo de trabajo

### 10.1 Rutas y protección

```
/                   → PublicLayout → LandingPage (sin auth)
/login              → LoginPage (sin auth)
/app/*              → PrivateRoute → AdminLayout → {Página}
/app/admin/*        → PrivateRoute(requiredRole="ADMIN") → AdminLayout → {Página admin}
```

| #    | Hallazgo                                              | Detalle                                                                                                                                                  |
| ---- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WF-1 | **Solo se verifica rol ADMIN**                        | No hay roles intermedios (CAJERO, INVENTARIO, etc.). Todos los usuarios no-admin ven exactamente el mismo menú                                           |
| WF-2 | **Sin permisos granulares**                           | El backend tiene tabla `permissions` y `role_permissions` pero el frontend no las consulta ni aplica                                                     |
| WF-3 | **Protección solo en `<Route>`**                      | Los botones de acción (crear, eliminar, editar) NO verifican permisos. Un usuario sin permiso ve todos los botones pero el backend rechazará la petición |
| WF-4 | **Redirect de `/app` a `/app/dashboard`** es correcto | ✅                                                                                                                                                       |
| WF-5 | **Sin página 404**                                    | Rutas no encontradas no muestran error — simplemente no renderizan nada                                                                                  |
| WF-6 | **Sin breadcrumbs**                                   | El usuario no tiene contexto visual de dónde está en la jerarquía                                                                                        |

### 10.2 Flujo POS

```
1. Buscar producto → Agregar al carrito → Repetir
2. Seleccionar cliente, método de pago, descuento
3. Click "Cobrar" → Abre modal de confirmación
4. Si efectivo: Ingresar monto pagado → Muestra cambio
5. Click "Confirmar" → SweetAlert de confirmación (SEGUNDA confirmación)
6. Sale se envía al backend → Si éxito: SweetAlert éxito + limpiar carrito
```

**Problemas del flujo:**

- **Doble confirmación** (paso 5): El modal ya muestra el detalle, luego SweetAlert pide confirmar otra vez
- **payAmountAt no se resetea** al limpiar el carrito
- **Si el print falla**, no hay fallback — silenciosamente se ignora el error

### 10.3 Flujo de CRUD genérico

```
1. Página lista datos con DataTable + paginación
2. Botón "Crear" → Modal con form (useCrudModal hook)
3. Submit → React Query mutation → Invalidate queries → Cerrar modal
4. Editar → useCrudModal.openEdit(item) → setTimeout(0) hack → Modal
5. Eliminar → confirmDelete (SweetAlert) → Mutation
```

**Problema en `useCrudModal`:** El `setTimeout(0)` en `openEdit` es un workaround para un bug de sincronización del estado `editing`. Debería resolverse con una key en el form o mejor manejo de estado.

---

## 11. Dependencias y configuración

### 11.1 Dependencias no utilizadas

| Paquete                     | Motivo                                                                  |
| --------------------------- | ----------------------------------------------------------------------- |
| `@reduxjs/toolkit`          | No se usa — el state management es con Zustand                          |
| `react-redux`               | No se usa — no hay providers de Redux                                   |
| `eslint-plugin-react-redux` | No se usa — relacionado a Redux                                         |
| `react-leaflet`             | Solo se detecta en package.json — verificar si se usa en landing o mapa |

### 11.2 Configuración inconsistente

| #   | Inconsistencia                                                    | Detalle                                                                                                                                           |
| --- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-1 | **Puerto del proxy Vite: 8000** vs **API_BASE_URL: 8080**         | `vite.config.ts` L25 usa 8000, `constants.ts` usa 8080. Los componentes usan `axiosInstance` que apunta a 8080 directamente, ignorando el proxy   |
| C-2 | **`Service.ts` es un axiosInstance duplicado**                    | `services/Service.ts` crea su propio cliente axios con URL hardcodeada. No usa `constants.ts`                                                     |
| C-3 | **Dos keys de localStorage para auth**                            | `pharmacy_auth` (Zustand persist) y `auth_token_pharm` (AuthProvider). Al hacer logout del Zustand, el token en `auth_token_pharm` queda huérfano |
| C-4 | **Nombre del proyecto en `package.json`** es `"using-react-vite"` | Debería ser `"pharmacy-frontend"`                                                                                                                 |

### 11.3 Stack de dependencias actual — Evaluación

| Categoría     | Paquete               | Versión                         | Evaluación |
| ------------- | --------------------- | ------------------------------- | ---------- |
| UI Framework  | React                 | ^19.0.0                         | ✅ Actual  |
| Routing       | react-router          | ^7.1.5                          | ✅ Actual  |
| State         | zustand               | ^5.0.12                         | ✅ Actual  |
| Data fetching | @tanstack/react-query | ^5.96.2                         | ✅ Actual  |
| Tables        | @tanstack/react-table | ^8.21.3                         | ✅ Actual  |
| Forms         | react-hook-form + zod | ^7.72.1 + ^4.3.6                | ✅ Actual  |
| HTTP          | axios                 | ^1.13.6                         | ✅ Actual  |
| CSS           | tailwindcss           | ^4.0.6                          | ✅ Actual  |
| i18n          | i18next               | ^26.0.3                         | ✅ Actual  |
| Charts        | recharts              | ^3.8.1                          | ✅ Actual  |
| Build         | Vite + SWC            | vite + @vitejs/plugin-react-swc | ✅ Actual  |

---

## 12. Resumen de hallazgos por prioridad

### 🔴 Críticos (corregir de inmediato)

| ID    | Hallazgo                                                    | Categoría         |
| ----- | ----------------------------------------------------------- | ----------------- |
| S-1   | Token JWT almacenado en localStorage (XSS)                  | Seguridad         |
| S-3   | Tres instancias axios con URLs diferentes                   | Seguridad/API     |
| API-1 | Doble llamada a `/auth/profile` al iniciar la app           | API duplicada     |
| AUTH  | Dos sistemas de autenticación paralelos (Zustand + Context) | Autenticación     |
| BL-6  | Dashboard con MOCK_ENABLED = true permanente                | Lógica de negocio |
| BL-1  | IDs de métodos de pago hardcodeados en posStore             | Lógica de negocio |
| BL-8  | Fecha de expiración de lote = hoy al crear producto         | Lógica de negocio |

### 🟠 Alto (planificar para próximo sprint)

| ID    | Hallazgo                                            | Categoría    |
| ----- | --------------------------------------------------- | ------------ |
| S-2   | Sin protección CSRF                                 | Seguridad    |
| S-5   | Sin token refresh                                   | Seguridad    |
| S-8   | Sin rate limiting en login                          | Seguridad    |
| API-4 | Tres archivos axios independientes                  | API          |
| BL-2  | Descuento usa discountId como índice de array       | Lógica       |
| BL-3  | clearCart() no resetea payAmountAt                  | Lógica       |
| WF-1  | Solo se verifica rol ADMIN, sin permisos granulares | Flujo        |
| 6.1   | Esquemas Zod con `.catch()` anulan validaciones     | Validaciones |

### 🟡 Medio (backlog de mejora continua)

| ID    | Hallazgo                                        | Categoría     |
| ----- | ----------------------------------------------- | ------------- |
| P-1   | POS carga 100 productos sin paginación virtual  | Rendimiento   |
| P-7   | Sin Error Boundaries                            | Rendimiento   |
| UI-1  | Modal sin ARIA roles                            | Accesibilidad |
| UI-4  | Botones de icono sin aria-label                 | Accesibilidad |
| WF-5  | Sin página 404                                  | Flujo         |
| WF-6  | Sin breadcrumbs                                 | Flujo         |
| C-1   | Puerto proxy Vite vs API_BASE_URL inconsistente | Configuración |
| C-4   | Nombre de proyecto `"using-react-vite"`         | Configuración |
| 11.1  | Dependencias no usadas (redux, react-redux)     | Limpieza      |
| V-1   | Separadores `--------` en modal POS             | Visual        |
| BL-5  | Doble confirmación en POS (modal + SweetAlert)  | Flujo         |
| API-6 | Sin manejo de errores en servicios              | API           |

---

## 13. Plan de acción recomendado

### Fase 1 — Seguridad y correcciones críticas

1. Eliminar `features/auth/` completo — consolidar en `store/authStore.ts`
2. Eliminar `services/Service.ts` — todos los servicios deben usar `api/axiosInstance.ts`
3. Remover `AuthProvider` de `main.tsx` para evitar doble llamada a `/auth/profile`
4. Cambiar `MOCK_ENABLED` a variable de entorno: `import.meta.env.VITE_MOCK_DASHBOARD`
5. Reemplazar IDs hardcodeados en `posStore.getMethodName()` por datos del query de métodos de pago
6. Corregir `clearCart()` para resetear `payAmountAt: 0`

### Fase 2 — Validaciones y lógica de negocio

7. Remover `.catch()` de todos los esquemas Zod — usar `.optional()` donde sea apropiado
8. Agregar validación `salePrice > purchasePrice` en formulario de productos
9. Corregir `expiryDate` en creación de productos — debe ser input del usuario, no `nowUTC()`
10. Corregir cálculo de descuento en POS: buscar por ID en el array en vez de usar como índice
11. Eliminar doble confirmación en POS (quitar `confirmSale()` SweetAlert o el modal)

### Fase 3 — Rendimiento y UX

12. Agregar `react-error-boundary` a nivel de `AdminLayout`
13. Implementar búsqueda de productos en servidor con debounce (eliminar carga masiva)
14. Remover dependencias no usadas (`@reduxjs/toolkit`, `react-redux`)
15. Agregar página 404
16. Agregar accesibilidad: ARIA roles en Modal, aria-labels en botones de icono

### Fase 4 — Arquitectura a futuro

17. Implementar permisos granulares (consultar tabla `permissions` del backend)
18. Implementar refresh token
19. Migrar token de localStorage a HttpOnly cookies (requiere cambios en backend)
20. Agregar monitoring/logging (Sentry)
21. Agregar tests E2E para flujos críticos (login, POS, ventas)

---

> **Nota:** Este informe es el resultado de una auditoría de código estática (lectura del código fuente). Se recomienda complementar con testing manual, pruebas de seguridad con herramientas automatizadas (OWASP ZAP, npm audit) y profiling de rendimiento con Lighthouse/React DevTools Profiler.
