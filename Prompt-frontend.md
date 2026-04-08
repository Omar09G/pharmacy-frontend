# PROMPT PARA AGENTE REACT - SISTEMA DE FARMACIA (FRONTEND)

## OBJETIVO
Construir un frontend completo para un sistema de gestión de farmacia con React 18 + TypeScript + Vite + Tailwind CSS. El backend ya existe (Rust/Axum) y expone una API REST documentada a continuación.

---

## STACK TECNOLÓGICO

```
React 18 + TypeScript + Vite
Tailwind CSS (colores neutros, diseño limpio y profesional)
React Router v6 (navegación global, rutas protegidas por rol)
React Query v5 (@tanstack/react-query) — fetching, caching, invalidation
Zustand — estado global (auth, carrito/POS, UI, tema, idioma)
React Hook Form + Zod — formularios y validación
SweetAlert2 — alertas y confirmaciones personalizadas
Axios — cliente HTTP con interceptors (JWT)
React Table v8 (@tanstack/react-table) — tablas con paginación
Lucide React — iconografía
date-fns — formateo de fechas
i18next + react-i18next — internacionalización (ES/EN)
ESLint + Prettier — calidad de código
```

---

## ESTRUCTURA DE CARPETAS

```
src/
├── api/               # Axios instance + interceptors
├── assets/            # Imágenes, logos
├── components/        # Componentes reutilizables (Button, Modal, Table, Badge, etc.)
│   ├── ui/            # Primitivos de UI
│   └── shared/        # Componentes de dominio compartidos
├── hooks/             # Custom hooks (useAuth, usePagination, useDebounce, etc.)
├── layouts/           # AdminLayout, PublicLayout, POSLayout
├── models/            # Interfaces TypeScript / tipos de dominio
├── pages/             # Una carpeta por módulo
│   ├── Landing/
│   ├── Auth/
│   ├── Dashboard/
│   ├── POS/           # add_sale
│   ├── Products/      # add_product + product CRUD
│   ├── Inventory/
│   ├── Sales/
│   ├── Purchases/
│   ├── Customers/
│   ├── Suppliers/
│   ├── Users/         # Solo ADMIN
│   ├── Roles/         # Solo ADMIN
│   ├── Permissions/   # Solo ADMIN
│   ├── Discounts/
│   ├── PaymentMethods/
│   ├── CashJournals/
│   ├── AuditLogs/     # Solo ADMIN
│   ├── Config/        # tax_profiles, units, inventory_locations
│   └── Reports/
├── services/          # Funciones de llamada a API por módulo
├── store/             # Zustand stores (authStore, posStore, uiStore)
└── utils/             # helpers, formatters, constants
```

---

## CONVENCIONES CRÍTICAS DE LA API

> ⚠️ El backend usa convenciones NO estándar. Respétalas al pie de la letra.

| Convención | Detalle |
|---|---|
| **PUT** = CREAR | `PUT /v1/api/resource` para crear nuevos registros |
| **PATCH** = ACTUALIZAR | `PATCH /v1/api/resource/{id}` para actualizar |
| **DELETE** = ELIMINAR | `DELETE /v1/api/resource/{id}` |
| **GET** = LEER/LISTAR | `GET /v1/api/resource` o `GET /v1/api/resource/{id}` |
| **camelCase** | Todos los campos JSON en camelCase (`firstName`, `unitPrice`) |
| `id: 0` al crear | Siempre enviar `"id": 0` en el body de creación |
| Fechas ISO8601 | `new Date().toISOString()` — con timezone |
| Paginación **zero-indexed** | `page: 0` = primera página |
| Auth header | `Authorization: Bearer <token>` en todas las rutas (excepto login) |

---

## AUTENTICACIÓN

### Login
```
POST /v1/api/auth/login
Body: { "username": string, "password": string }
```
**Response:**
```json
{
  "data": {
    "id": 1,
    "fullName": "Omar Dev",
    "username": "admin",
    "role": "ADMIN",
    "token": "eyJ..."
  },
  "total": 0,
  "message": "Login successful",
  "status": "success",
  "codeError": 0,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Roles disponibles
- `ADMIN` — acceso total
- `USER` — operador de farmacia (ventas, inventario)
- `CUSTOMER` — cliente registrado
- `OTHER` — rol limitado

### Estado global de auth (Zustand)
```typescript
interface AuthState {
  user: { id: number; fullName: string; username: string; role: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials) => Promise<void>;
  logout: () => void;
}
```
Persistir en `localStorage`. Inyectar token en cada request via Axios interceptor.

---

## ESTRUCTURA GENÉRICA DE RESPUESTA API

```typescript
interface ApiResponse<T> {
  data: T;
  total: number;
  message: string;
  status: 'success' | 'error' | 'warning';
  codeError: number;
  timestamp: string;
}

// Error de validación (data es array)
interface ValidationError {
  field: string;
  reason: string;
  code: string;
}
```

### Parámetros de paginación (query params)
```typescript
interface PaginationParams {
  page?: number;      // 0-indexed
  limit?: number;     // default 10
  search?: string;    // búsqueda general
  active?: boolean;   // filtro activo/inactivo
  startDate?: string; // ISO8601
  endDate?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
```

---

## TODOS LOS ENDPOINTS DE LA API

Base URL: `http://localhost:3000/v1/api`

### AUTH
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Login (sin token) |
| GET | `/auth/profile` | Perfil del usuario logueado |

### USUARIOS (Solo ADMIN puede gestionar)
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/user` | Crear usuario |
| GET | `/user` | Listar usuarios (paginado) |
| GET | `/user/{id}` | Obtener usuario por ID |
| PATCH | `/user` | Actualizar usuario |
| DELETE | `/user` | Eliminar usuario |
| PATCH | `/user/password` | Cambiar contraseña |
| PATCH | `/user/status` | Cambiar estado activo/inactivo |

### ROLES (Solo ADMIN)
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/role` | Crear rol |
| GET | `/role` | Listar roles |
| GET | `/role/{id}` | Obtener rol por ID |
| GET | `/role/name` | Buscar rol por nombre |
| PATCH | `/role/{id}` | Actualizar rol |
| DELETE | `/role/{id}` | Eliminar rol |

### PERMISOS (Solo ADMIN)
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/permission` | Crear permiso |
| GET | `/permission` | Listar permisos |
| GET | `/permission/{id}` | Obtener permiso por ID |
| GET | `/permission/name` | Buscar permiso por nombre |
| PATCH | `/permission/{id}` | Actualizar permiso |
| DELETE | `/permission/{id}` | Eliminar permiso |

### ROLES-PERMISOS (Solo ADMIN)
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/role_permissions` | Asignar permiso a rol |
| GET | `/role_permissions/list` | Listar asignaciones |
| GET | `/role_permissions/{role_id}` | Permisos de un rol |
| PATCH | `/role_permissions/{role_id}/{permission_id}` | Actualizar asignación |
| DELETE | `/role_permissions/{role_id}/{permission_id}` | Revocar permiso de rol |

### USUARIO-ROL (Solo ADMIN)
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/user_role` | Asignar rol a usuario |
| GET | `/user_role` | Listar asignaciones |
| GET | `/user_role/{user_id}/{role_id}` | Obtener asignación |
| PATCH | `/user_role/{user_id}/{role_id}` | Actualizar asignación |
| DELETE | `/user_role/{user_id}/{role_id}` | Eliminar asignación |

### CLIENTES
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/customer` | Crear cliente |
| GET | `/customer` | Listar clientes (paginado) |
| GET | `/customer/{id}` | Obtener cliente por ID |
| PATCH | `/customer/{id}` | Actualizar cliente |
| DELETE | `/customer/{id}` | Eliminar cliente |

### CUENTAS DE CRÉDITO DE CLIENTES
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/customer_credit_account` | Crear cuenta de crédito |
| GET | `/customer_credit_account` | Listar cuentas |
| GET | `/customer_credit_account/{id}` | Obtener cuenta |
| PATCH | `/customer_credit_account/{id}` | Actualizar cuenta |
| DELETE | `/customer_credit_account/{id}` | Eliminar cuenta |

### PROVEEDORES
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/supplier` | Crear proveedor |
| GET | `/supplier` | Listar proveedores (paginado) |
| GET | `/supplier/{id}` | Obtener proveedor |
| PATCH | `/supplier/{id}` | Actualizar proveedor |
| DELETE | `/supplier/{id}` | Eliminar proveedor |

### PRODUCTOS
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/product` | Crear producto |
| GET | `/product` | Listar productos (paginado) |
| GET | `/product/{id}` | Obtener producto |
| GET | `/product/name` | Buscar por nombre |
| PATCH | `/product/{id}` | Actualizar producto |
| DELETE | `/product/{id}` | Eliminar producto |

### ADD_PRODUCT (Registro completo de producto)
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/add_product` | Crear producto completo (producto + barcode + lot + precio) |
| GET | `/add_product` | Listar productos con detalle completo (paginado) |
| GET | `/add_product/{barcode}` | Buscar por código de barras (POS) |

**Body PUT /add_product:**
```json
{
  "id": 0,
  "name": "Paracetamol 500mg",
  "description": "Analgésico y antipirético",
  "categoryId": 1,
  "supplierId": 1,
  "unitId": 1,
  "taxProfileId": 1,
  "barcode": "7501055300227",
  "expirationDate": "2026-12-31T00:00:00Z",
  "quantity": 100,
  "unitPrice": 15.50,
  "salePrice": 22.00,
  "minimumStock": 10,
  "active": true
}
```

### CATEGORÍAS
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/category` | Crear categoría |
| GET | `/category` | Listar categorías |
| GET | `/category/{id}` | Obtener categoría |
| PATCH | `/category/{id}` | Actualizar categoría |
| DELETE | `/category/{id}` | Eliminar categoría |

### LOTES DE PRODUCTOS
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/product_lot` | Crear lote |
| GET | `/product_lot/{id}` | Obtener lote |
| PATCH | `/product_lot/{id}` | Actualizar lote |
| DELETE | `/product_lot/{id}` | Eliminar lote |

### BARCODES
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/product_barcode` | Crear barcode |
| GET | `/product_barcode/{id}` | Obtener por ID |
| GET | `/product_barcode/barcode` | Buscar por código |
| PATCH | `/product_barcode/{id}` | Actualizar barcode |
| DELETE | `/product_barcode/{id}` | Eliminar barcode |

### PRECIOS DE PRODUCTOS
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/product_price` | Crear precio |
| GET | `/product_price/{id}` | Obtener precio |
| DELETE | `/product_price/{id}` | Eliminar precio |

### VENTAS (SALES)
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/sale` | Crear venta |
| GET | `/sale` | Listar ventas (paginado) |
| GET | `/sale/{id}` | Obtener venta |
| PATCH | `/sale/{id}` | Actualizar venta |
| DELETE | `/sale/{id}` | Eliminar venta |

### ADD_SALE (POS - Punto de Venta)
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/add_sale` | Crear venta completa (venta + items + pago) |
| GET | `/add_sale/{id}` | Obtener detalle de venta |

**Body PUT /add_sale:**
```json
{
  "id": 0,
  "customerId": 1,
  "userId": 1,
  "discountId": null,
  "saleDate": "2024-01-15T10:30:00Z",
  "notes": "Venta mostrador",
  "items": [
    {
      "id": 0,
      "productId": 1,
      "quantity": 2,
      "unitPrice": 22.00,
      "discountAmount": 0
    }
  ],
  "payment": {
    "id": 0,
    "paymentMethodId": 1,
    "amount": 44.00,
    "reference": "EFECTIVO"
  }
}
```

### ARTÍCULOS DE VENTA
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/sale_item` | Agregar artículo |
| GET | `/sale_item` | Listar artículos |
| GET | `/sale_item/{id}` | Obtener artículo |
| PATCH | `/sale_item/{id}` | Actualizar artículo |
| DELETE | `/sale_item/{id}` | Eliminar artículo |

### PAGOS DE VENTA
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/sale_payment` | Registrar pago |
| GET | `/sale_payment` | Listar pagos |
| GET | `/sale_payment/{id}` | Obtener pago |
| PATCH | `/sale_payment/{id}` | Actualizar pago |
| DELETE | `/sale_payment/{id}` | Eliminar pago |

### COMPRAS (PURCHASES)
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/purchase` | Crear compra |
| GET | `/purchase` | Listar compras (paginado) |
| GET | `/purchase/{id}` | Obtener compra |
| PATCH | `/purchase/{id}` | Actualizar compra |
| DELETE | `/purchase/{id}` | Eliminar compra |

### ARTÍCULOS DE COMPRA
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/purchase_item` | Agregar artículo |
| GET | `/purchase_item/{id}` | Obtener artículo |
| PATCH | `/purchase_item/{id}` | Actualizar artículo |
| DELETE | `/purchase_item/{id}` | Eliminar artículo |

### PAGOS DE COMPRA
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/purchase_payment` | Registrar pago |
| GET | `/purchase_payment` | Listar pagos |
| GET | `/purchase_payment/{id}` | Obtener pago |
| PATCH | `/purchase_payment/{id}` | Actualizar pago |
| DELETE | `/purchase_payment/{id}` | Eliminar pago |

### DESCUENTOS
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/discount` | Crear descuento |
| GET | `/discount` | Listar descuentos |
| GET | `/discount/{id}` | Obtener descuento |
| PATCH | `/discount/{id}` | Actualizar descuento |
| DELETE | `/discount/{id}` | Eliminar descuento |

### MÉTODOS DE PAGO
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/payment_methods` | Crear método |
| GET | `/payment_methods` | Listar métodos |
| GET | `/payment_methods/{id}` | Obtener método |
| PATCH | `/payment_methods/{id}` | Actualizar método |
| DELETE | `/payment_methods/{id}` | Eliminar método |

### MOVIMIENTOS DE INVENTARIO
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/inventory_movement` | Registrar movimiento |
| GET | `/inventory_movement` | Listar movimientos (paginado) |
| GET | `/inventory_movement/{id}` | Obtener movimiento |
| PATCH | `/inventory_movement/{id}` | Actualizar movimiento |
| DELETE | `/inventory_movement/{id}` | Eliminar movimiento |

### UBICACIONES DE INVENTARIO
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/inventory_locations` | Crear ubicación |
| GET | `/inventory_locations` | Listar ubicaciones |
| GET | `/inventory_locations/{id}` | Obtener ubicación |
| PATCH | `/inventory_locations/{id}` | Actualizar ubicación |
| DELETE | `/inventory_locations/{id}` | Eliminar ubicación |

### CAJA / DIARIO DE CAJA
| Método | Ruta | Descripción |
|---|---|---|
| PUT | `/cash_entry` | Registrar entrada de caja |
| GET | `/cash_entry` | Listar entradas |
| GET | `/cash_entry/{id}` | Obtener entrada |
| PATCH | `/cash_entry/{id}` | Actualizar entrada |
| DELETE | `/cash_entry/{id}` | Eliminar entrada |
| PUT | `/cash_journal` | Crear diario de caja |
| GET | `/cash_journal` | Listar diarios |
| GET | `/cash_journal/{id}` | Obtener diario |
| PATCH | `/cash_journal/{id}` | Actualizar diario |
| DELETE | `/cash_journal/{id}` | Eliminar diario |

### CONFIGURACIÓN (Solo ADMIN)
| Módulo | Ruta base | Descripción |
|---|---|---|
| Unidades | `/units` | CRUD de unidades de medida |
| Perfiles fiscales | `/tax_profiles` | CRUD de perfiles de IVA/tax |

### AUDIT LOG (Solo ADMIN)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/audit_log` | Listar registros de auditoría |

---

## MÓDULO POS (PUNTO DE VENTA) — DETALLE COMPLETO

### Precarga obligatoria (al montar el componente POS)
```typescript
// Cargar en paralelo con Promise.all antes de habilitar la venta:
const [products, customers, paymentMethods, discounts] = await Promise.all([
  GET /add_product?page=0&limit=100,
  GET /customer?page=0&limit=100,
  GET /payment_methods,
  GET /discount?page=0&limit=50&active=true
]);
```

### Flujo del POS
1. Buscar producto por barcode (scan) → `GET /add_product/{barcode}`
2. O buscar por nombre con debounce → `GET /add_product?search=X&page=0&limit=20`
3. Agregar al carrito (solo en estado local Zustand)
4. Seleccionar cliente (opcional, default: cliente mostrador)
5. Aplicar descuento (opcional)
6. Clic en "Cobrar" → abrir modal de confirmación de venta
7. Modal muestra: items, subtotal, descuento, IVA, total, método de pago
8. Confirmar → `PUT /add_sale` con body completo
9. Mostrar SweetAlert2 de éxito con número de folio
10. Limpiar carrito

### Store Zustand para POS
```typescript
interface CartItem {
  productId: number;
  name: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
}

interface POSStore {
  cart: CartItem[];
  customerId: number | null;
  discountId: number | null;
  paymentMethodId: number | null;
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}
```

---

## LANDING PAGE DE FARMACIA

Secciones requeridas:
1. **Hero** — Nombre de farmacia, slogan, botón "Entrar al sistema" / "Ver productos"
2. **Servicios destacados** — Iconos: Medicamentos, Consultas, Entregas, Atención 24h
3. **Productos destacados** — Grid de productos (llamar `GET /add_product?page=0&limit=8`)
4. **Sobre nosotros** — Historia, valores, equipo
5. **Contacto** — Dirección, teléfono, horario
6. **Footer** — Links, redes sociales, copyright

---

## DASHBOARD DE VENTAS

### Widgets principales
- Total ventas del día (filtrar por fecha actual)
- Total ventas del mes
- Número de transacciones
- Producto más vendido

### Gráficas (usar Recharts o Chart.js)
- Ventas por día (últimos 30 días)
- Distribución por método de pago (pie chart)
- Top 10 productos más vendidos

### Tablas del dashboard
- Últimas 10 ventas → `GET /sale?page=0&limit=10&sortBy=saleDate&sortDir=desc`
- Productos con stock bajo → `GET /add_product?page=0&limit=10` (filtrar quantity < minimumStock)

---

## REGLAS DE ACCESO POR ROL

| Módulo | ADMIN | USER | CUSTOMER | OTHER |
|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ❌ | ❌ |
| POS (add_sale) | ✅ | ✅ | ❌ | ❌ |
| Productos / Inventario | ✅ | ✅ | ❌ | ❌ |
| Ventas (consulta) | ✅ | ✅ | ❌ | ❌ |
| Compras | ✅ | ✅ | ❌ | ❌ |
| Clientes | ✅ | ✅ | ❌ | ❌ |
| Proveedores | ✅ | ✅ | ❌ | ❌ |
| Usuarios | ✅ | ❌ | ❌ | ❌ |
| Roles y Permisos | ✅ | ❌ | ❌ | ❌ |
| Configuración | ✅ | ❌ | ❌ | ❌ |
| Audit Log | ✅ | ❌ | ❌ | ❌ |
| Caja / Diario | ✅ | ✅ | ❌ | ❌ |

---

## COMPONENTES REUTILIZABLES REQUERIDOS

```typescript
// components/ui/
Button           // variantes: primary, secondary, danger, ghost + sizes
Input            // con label, error, helper text
Select           // wrapper de select con label
Modal            // base modal con overlay, header, body, footer
ConfirmDialog    // SweetAlert2 wrapper para confirmaciones
DataTable        // tabla con paginación, sort, loading skeleton
Badge            // colores para estados (active/inactive, roles)
SearchInput      // input de búsqueda con debounce
Pagination       // componente de paginación reutilizable
LoadingSpinner   // spinner de carga
EmptyState       // estado vacío con icono
Alert            // alertas inline (success, error, warning)
FormField        // wrapper de campo de formulario con error
Breadcrumb       // navegación de migas de pan
Sidebar          // sidebar de navegación del admin
Topbar           // barra superior con info de usuario, logout
Card             // tarjeta contenedora
Skeleton         // placeholders de carga
```

---

## PATRÓN CRUD ESTÁNDAR POR MÓDULO

Cada módulo debe seguir este patrón:

### Estructura de página
```
pages/[Modulo]/
├── [Modulo]Page.tsx      # Página principal con tabla
├── [Modulo]Form.tsx      # Formulario (crear/editar) en Modal
└── [Modulo]Columns.tsx   # Definición de columnas de la tabla
```

### Hooks requeridos por módulo
```typescript
// hooks/use[Modulo].ts
const use[Modulo] = () => {
  // useQuery para listar con paginación
  // useMutation para crear (PUT), actualizar (PATCH), eliminar (DELETE)
  // Estado de modal abierto/cerrado
  // Función de limpiar formulario
  // Alertas SweetAlert2
}
```

### Flujo de Modal
1. Usuario hace clic en "Nuevo" o "Editar"
2. **PRIMERO** se ejecuta `resetForm()` (limpiar campos)
3. Luego se llama la API correspondiente si es edición
4. Se abre el Modal con el formulario
5. Al confirmar → llamada a API → SweetAlert2 de éxito → cerrar modal → invalidar query

### Botón Limpiar
- Cada formulario CRUD y cada modal deben tener un botón "Limpiar" visible
- Al hacer clic en el botón limpiar (o al abrir el modal) → `resetForm()` se ejecuta primero

---

## PAGINACIÓN EN LISTADOS

Todos los módulos que listen datos deben incluir:
```typescript
// Estado de paginación
const [page, setPage] = useState(0); // zero-indexed
const [limit] = useState(10);
const [search, setSearch] = useState('');

// Query
const { data, isLoading } = useQuery({
  queryKey: ['modulo', page, limit, search],
  queryFn: () => service.getAll({ page, limit, search })
});

// UI: Mostrar info "Mostrando X de Y resultados"
// Botones: Anterior / Siguiente + info de página
```

Módulos con paginación obligatoria: ventas, productos, clientes, proveedores, usuarios, compras, movimientos de inventario, audit_log.

---

## ALERTAS SWEETALERT2

```typescript
// utils/alerts.ts

// Confirmación de eliminación
export const confirmDelete = (name: string) => Swal.fire({
  title: '¿Eliminar registro?',
  text: `Se eliminará "${name}". Esta acción no se puede deshacer.`,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#ef4444',
  cancelButtonColor: '#6b7280',
  confirmButtonText: 'Sí, eliminar',
  cancelButtonText: 'Cancelar',
  background: '#1f2937',
  color: '#f9fafb'
});

// Éxito
export const showSuccess = (msg: string) => Swal.fire({
  icon: 'success',
  title: 'Éxito',
  text: msg,
  timer: 2000,
  showConfirmButton: false,
  background: '#1f2937',
  color: '#f9fafb'
});

// Error
export const showError = (msg: string) => Swal.fire({
  icon: 'error',
  title: 'Error',
  text: msg,
  confirmButtonColor: '#3b82f6',
  background: '#1f2937',
  color: '#f9fafb'
});

// Confirmación de venta (POS)
export const confirmSale = (total: number) => Swal.fire({
  title: 'Confirmar venta',
  html: `<b>Total a cobrar: $${total.toFixed(2)}</b>`,
  icon: 'question',
  showCancelButton: true,
  confirmButtonColor: '#10b981',
  confirmButtonText: 'Confirmar venta',
  cancelButtonText: 'Cancelar'
});
```

---

## VALIDACIONES CON ZOD

```typescript
// Ejemplo: schema de producto
const productSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  categoryId: z.number().min(1, 'Selecciona una categoría'),
  unitPrice: z.number().positive('El precio debe ser positivo'),
  salePrice: z.number().positive('El precio de venta debe ser positivo'),
  barcode: z.string().min(1, 'Código de barras requerido'),
  quantity: z.number().min(0, 'Cantidad no puede ser negativa'),
  expirationDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Fecha inválida'),
});
```

---

## MANEJO DE FECHAS UTC ↔ HORA LOCAL

> ⚠️ **Regla crítica:** La API **siempre recibe y devuelve fechas en UTC (ISO 8601 con Z)**.
> En el frontend: **enviar UTC** a la API, **mostrar en hora local** al usuario.

### Archivo `src/utils/dateUtils.ts`

```typescript
import {
  format,
  parseISO,
  formatISO,
  toZonedTime,
  fromZonedTime,
} from 'date-fns-tz';
import { format as formatDate, parseISO as parse } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

// Zona horaria del navegador del usuario
const USER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

// ─── PARA ENVIAR A LA API ────────────────────────────────────────────────────

/**
 * Convierte una fecha local (del usuario) a ISO 8601 UTC para enviar a la API.
 * Uso: al crear/editar un registro con fecha.
 *
 * @example toUTC('2024-06-15T10:30') → '2024-06-15T15:30:00.000Z'
 */
export const toUTC = (localDate: string | Date): string => {
  const date = typeof localDate === 'string' ? new Date(localDate) : localDate;
  return date.toISOString(); // siempre devuelve UTC con 'Z'
};

/**
 * Obtiene la fecha/hora actual en UTC como ISO string.
 * Uso: para campos `saleDate`, `createdAt`, etc. al hacer PUT/PATCH.
 *
 * @example nowUTC() → '2024-06-15T15:30:00.000Z'
 */
export const nowUTC = (): string => new Date().toISOString();

/**
 * Convierte el valor de un <input type="datetime-local"> (formato local sin TZ)
 * a ISO UTC para enviar a la API.
 *
 * @example localInputToUTC('2024-06-15T10:30') → '2024-06-15T15:30:00.000Z'
 */
export const localInputToUTC = (inputValue: string): string => {
  if (!inputValue) return '';
  // El input datetime-local devuelve 'YYYY-MM-DDTHH:mm' sin zona horaria,
  // se interpreta como hora local del navegador.
  return new Date(inputValue).toISOString();
};

/**
 * Convierte un ISO UTC de la API al formato requerido por <input type="datetime-local">
 * ('YYYY-MM-DDTHH:mm') en hora LOCAL para que el usuario vea su hora.
 * Uso: al cargar un registro en el formulario de edición.
 *
 * @example utcToLocalInput('2024-06-15T15:30:00Z') → '2024-06-15T10:30'
 */
export const utcToLocalInput = (utcString: string | null | undefined): string => {
  if (!utcString) return '';
  const date = new Date(utcString);
  // Ajuste manual al offset local para el valor del input
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'
};

// ─── PARA MOSTRAR EN PANTALLA ────────────────────────────────────────────────

/**
 * Convierte un ISO UTC de la API a fecha/hora en hora LOCAL del usuario.
 * Usa el locale del idioma activo (ES o EN).
 *
 * @example formatLocal('2024-06-15T15:30:00Z', 'es') → '15 jun. 2024, 10:30'
 */
export const formatLocal = (
  utcString: string | null | undefined,
  lang: 'es' | 'en' = 'es',
  fmt = 'dd MMM yyyy, HH:mm'
): string => {
  if (!utcString) return '—';
  try {
    const locale = lang === 'es' ? es : enUS;
    const date = new Date(utcString); // JS auto-convierte UTC a local
    return formatDate(date, fmt, { locale });
  } catch {
    return utcString;
  }
};

/**
 * Muestra solo la fecha (sin hora) en hora local.
 * @example formatLocalDate('2024-06-15T15:30:00Z') → '15/06/2024'
 */
export const formatLocalDate = (
  utcString: string | null | undefined,
  lang: 'es' | 'en' = 'es'
): string => formatLocal(utcString, lang, 'dd/MM/yyyy');

/**
 * Muestra solo la hora en hora local.
 * @example formatLocalTime('2024-06-15T15:30:00Z') → '10:30'
 */
export const formatLocalTime = (utcString: string | null | undefined): string =>
  formatLocal(utcString, 'es', 'HH:mm');

/**
 * Muestra fecha y hora completa con timezone local visible.
 * @example formatLocalFull('2024-06-15T15:30:00Z') → '15/06/2024 10:30 (CDT)'
 */
export const formatLocalFull = (utcString: string | null | undefined): string => {
  if (!utcString) return '—';
  const date = new Date(utcString);
  const tz = new Intl.DateTimeFormat('es', { timeZoneName: 'short' })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName')?.value ?? '';
  return `${formatDate(date, 'dd/MM/yyyy HH:mm')} (${tz})`;
};

/**
 * Tiempo relativo: "hace 5 minutos", "ayer", etc.
 * Requiere date-fns formatDistanceToNow
 */
export { formatDistanceToNow } from 'date-fns';
```

### Instalación de dependencias
```bash
npm install date-fns date-fns-tz
```

### Uso en formularios (React Hook Form)

```typescript
import { toUTC, utcToLocalInput, nowUTC } from '@/utils/dateUtils';

// Al EDITAR — cargar valor UTC del API al input local
const form = useForm({
  defaultValues: {
    saleDate: utcToLocalInput(sale.saleDate),  // muestra hora local en el input
    expirationDate: utcToLocalInput(lot.expirationDate),
  }
});

// Al ENVIAR — convertir input local a UTC para la API
const onSubmit = (values) => {
  const payload = {
    ...values,
    saleDate: localInputToUTC(values.saleDate),      // → UTC para API
    expirationDate: localInputToUTC(values.expirationDate),
  };
  mutate(payload);
};

// Al CREAR — usar nowUTC() para timestamp automático
const newSalePayload = {
  id: 0,
  saleDate: nowUTC(),  // fecha actual en UTC
  ...otherFields,
};
```

### Uso en tablas y listados

```typescript
import { formatLocal, formatLocalDate } from '@/utils/dateUtils';
import { useTranslation } from 'react-i18next';

const SalesColumns = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'es' | 'en';

  return [
    {
      header: 'Fecha',
      cell: ({ row }) => formatLocal(row.original.saleDate, lang),
      // Ejemplo output: '15 jun. 2024, 10:30'
    },
    {
      header: 'Vencimiento',
      cell: ({ row }) => formatLocalDate(row.original.expirationDate, lang),
      // Ejemplo output: '15/06/2024'
    },
  ];
};
```

### Resumen de regla de oro

| Contexto | Función a usar | Ejemplo resultado |
|---|---|---|
| Enviar fecha nueva a API | `nowUTC()` | `2024-06-15T15:30:00.000Z` |
| Input de usuario → API | `localInputToUTC(input)` | `2024-06-15T15:30:00.000Z` |
| API → input de formulario | `utcToLocalInput(utc)` | `2024-06-15T10:30` |
| API → mostrar en tabla | `formatLocal(utc, lang)` | `15 jun. 2024, 10:30` |
| API → mostrar solo fecha | `formatLocalDate(utc, lang)` | `15/06/2024` |
| API → mostrar solo hora | `formatLocalTime(utc)` | `10:30` |
| API → mostrar completo+TZ | `formatLocalFull(utc)` | `15/06/2024 10:30 (CDT)` |

---

## MANEJO DE ERRORES DE API

```typescript
// api/axiosInstance.ts
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.getState().logout();
      window.location.href = '/login';
    }
    // Si status es 'error' y data es array → errores de validación por campo
    const apiResponse = error.response?.data;
    if (apiResponse?.status === 'error' && Array.isArray(apiResponse?.data)) {
      // Mapear errores de validación a campos del formulario
    }
    return Promise.reject(error);
  }
);
```

---

## RUTAS DE REACT ROUTER

```tsx
// Rutas públicas
/                    → LandingPage
/login               → LoginPage

// Rutas protegidas (requieren auth)
/app/dashboard       → DashboardPage
/app/pos             → POSPage (POS/add_sale)
/app/products        → ProductsPage
/app/products/add    → AddProductPage (add_product)
/app/inventory       → InventoryPage
/app/sales           → SalesPage
/app/purchases       → PurchasesPage
/app/customers       → CustomersPage
/app/suppliers       → SuppliersPage
/app/discounts       → DiscountsPage
/app/payment-methods → PaymentMethodsPage
/app/cash-journal    → CashJournalPage

// Solo ADMIN
/app/admin/users         → UsersPage
/app/admin/roles         → RolesPage
/app/admin/permissions   → PermissionsPage
/app/admin/audit-log     → AuditLogPage
/app/admin/config/units  → UnitsPage
/app/admin/config/taxes  → TaxProfilesPage
/app/admin/config/locations → LocationsPage
```

---

## CONFIGURACIÓN DEL PROYECTO

### package.json (dependencias)
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "@tanstack/react-query": "^5.20.0",
    "@tanstack/react-table": "^8.15.0",
    "zustand": "^4.5.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.4",
    "sweetalert2": "^11.10.0",
    "lucide-react": "^0.363.0",
    "date-fns": "^3.3.1",
    "date-fns-tz": "^3.1.3",
    "recharts": "^2.12.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.1.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint-plugin-react-hooks": "^4.6.0"
  }
}
```

### tailwind.config.js
```javascript
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 50: '#f0f9ff', 500: '#3b82f6', 900: '#1e3a5f' },
        neutral: {
          50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb',
          700: '#374151', 800: '#1f2937', 900: '#111827'
        }
      }
    }
  }
}
```

---

## INSTRUCCIONES PARA EL AGENTE REACT

1. **Lee este prompt completo** antes de generar cualquier código
2. **Respeta las convenciones HTTP** — PUT=crear, PATCH=actualizar
3. **Siempre camelCase** en los DTOs enviados a la API
4. **Siempre `id: 0`** en los bodies de creación
5. **Paginación zero-indexed** — `page: 0` es la primera página
6. **Botón limpiar** en cada formulario — ejecutar `resetForm()` PRIMERO al abrir modal
7. **Precarga POS** — cargar todos los datos necesarios antes de habilitar la venta
8. **SweetAlert2** para todas las confirmaciones de acciones destructivas y éxitos
9. **Rutas protegidas** con PrivateRoute que verifica auth y rol
10. **Token en localStorage** — inyectarlo en cada request via interceptor Axios
11. **React Query** para todos los fetches — no usar useEffect directo para llamadas API
12. **Zustand** para estado global (auth, POS cart)
13. **React Hook Form + Zod** para todos los formularios
14. **ESLint** activado con reglas de react-hooks
15. **Separar servicios** — un archivo de servicio por módulo en `src/services/`
16. **Generar cada módulo completo** con su CRUD (crear, editar, listar paginado, eliminar)
17. **Modal de confirmación de venta** con SweetAlert2 mostrando resumen completo
18. **Dashboard** con gráficas de ventas y KPIs usando Recharts
19. **Landing page** con branding de farmacia
20. **Accesibilidad** — aria-labels, roles ARIA en modales y formularios
21. **i18n (ES/EN)** — usar `react-i18next`; botón de cambio de idioma en Topbar; persistir en `localStorage`
22. **Modo oscuro/claro** — usar clase `dark` en `<html>`; botón toggle en Topbar; persistir en `localStorage`
23. **Fechas UTC ↔ Local** — usar `utils/dateUtils.ts`; enviar `nowUTC()`/`localInputToUTC()` a la API; mostrar con `formatLocal()` en pantalla; **nunca mostrar UTC crudo al usuario**

---

## INTERNACIONALIZACIÓN (i18n) — ESPAÑOL / INGLÉS

### Instalación
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### Estructura de archivos
```
src/
└── i18n/
    ├── index.ts           # Configuración de i18next
    └── locales/
        ├── es.json        # Traducciones en español
        └── en.json        # Traducciones en inglés
```

### Configuración i18n (`src/i18n/index.ts`)
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import es from './locales/es.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { es: { translation: es }, en: { translation: en } },
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'pharmacy_lang',
    },
  });

export default i18n;
```

### Estructura de traducciones (`es.json` / `en.json`)
Incluir claves para TODOS los módulos:
```json
{
  "common": {
    "save": "Guardar", "cancel": "Cancelar", "delete": "Eliminar",
    "edit": "Editar", "new": "Nuevo", "search": "Buscar",
    "clear": "Limpiar", "confirm": "Confirmar", "back": "Regresar",
    "loading": "Cargando...", "noData": "Sin registros",
    "actions": "Acciones", "status": "Estado", "active": "Activo",
    "inactive": "Inactivo", "total": "Total", "page": "Página",
    "of": "de", "results": "resultados", "rowsPerPage": "Filas por página"
  },
  "auth": {
    "login": "Iniciar sesión", "logout": "Cerrar sesión",
    "username": "Usuario", "password": "Contraseña",
    "loginBtn": "Entrar", "loginError": "Credenciales inválidas"
  },
  "nav": {
    "dashboard": "Tablero", "pos": "Punto de Venta",
    "products": "Productos", "inventory": "Inventario",
    "sales": "Ventas", "purchases": "Compras",
    "customers": "Clientes", "suppliers": "Proveedores",
    "discounts": "Descuentos", "paymentMethods": "Métodos de Pago",
    "cashJournal": "Caja", "admin": "Administración",
    "users": "Usuarios", "roles": "Roles", "permissions": "Permisos",
    "auditLog": "Auditoría", "config": "Configuración"
  },
  "products": {
    "title": "Productos", "name": "Nombre", "category": "Categoría",
    "barcode": "Código de barras", "price": "Precio", "stock": "Stock",
    "expiration": "Vencimiento", "addProduct": "Agregar producto"
  },
  "pos": {
    "title": "Punto de Venta", "cart": "Carrito", "scanBarcode": "Escanear código",
    "customer": "Cliente", "discount": "Descuento", "subtotal": "Subtotal",
    "tax": "IVA", "total": "Total", "pay": "Cobrar",
    "confirmSale": "Confirmar venta", "saleSuccess": "¡Venta registrada!",
    "clearCart": "Vaciar carrito", "paymentMethod": "Método de pago"
  },
  "sales": {
    "title": "Ventas", "saleDate": "Fecha", "folio": "Folio",
    "customer": "Cliente", "total": "Total", "status": "Estado"
  },
  "users": {
    "title": "Usuarios", "fullName": "Nombre completo",
    "username": "Usuario", "role": "Rol", "email": "Correo",
    "changePassword": "Cambiar contraseña", "changeStatus": "Cambiar estado"
  },
  "landing": {
    "hero": "Tu salud, nuestra prioridad", "subtitle": "Farmacia de confianza",
    "enter": "Entrar al sistema", "viewProducts": "Ver productos"
  }
}
```

### Uso en componentes
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <button>{t('common.save')}</button>;
};
```

### Botón de cambio de idioma (Topbar)
```typescript
import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const isSpanish = i18n.language === 'es';

  return (
    <button
      onClick={() => i18n.changeLanguage(isSpanish ? 'en' : 'es')}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
                 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200
                 dark:hover:bg-neutral-600 transition-colors"
      title={isSpanish ? 'Switch to English' : 'Cambiar a Español'}
    >
      <span className="text-base">{isSpanish ? '🇲🇽' : '🇺🇸'}</span>
      <span>{isSpanish ? 'ES' : 'EN'}</span>
    </button>
  );
};
```

---

## MODO OSCURO / CLARO (DARK MODE)

### Store Zustand para tema (`store/uiStore.ts`)
```typescript
interface UIStore {
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  toggleTheme: () => void;
  setLanguage: (lang: 'es' | 'en') => void;
}

const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'es',
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', next === 'dark');
          return { theme: next };
        }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'pharmacy_ui',
      onRehydrateStorage: () => (state) => {
        // Aplicar tema guardado al montar la app
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
```

### Inicialización en `main.tsx`
```typescript
import './i18n';  // cargar i18n antes de renderizar

// Aplicar tema antes del primer render para evitar flash
const saved = JSON.parse(localStorage.getItem('pharmacy_ui') || '{}');
if (saved?.state?.theme === 'dark') {
  document.documentElement.classList.add('dark');
}
```

### Botón toggle de tema (Topbar)
```typescript
import { Sun, Moon } from 'lucide-react';
import useUIStore from '@/store/uiStore';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useUIStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700
                 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
      title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
    >
      {theme === 'light'
        ? <Moon className="w-4 h-4 text-neutral-600" />
        : <Sun className="w-4 h-4 text-yellow-400" />
      }
    </button>
  );
};
```

### Ubicación de botones en el Topbar
```
[Logo/Nombre]  [Navegación...]  [Buscador]  [🌙 Dark]  [🇲🇽 ES]  [👤 Usuario ▼]
```

### Clases Tailwind para soporte dark mode
Usar el prefijo `dark:` en todos los componentes:
```tsx
// Ejemplos de clases dual-theme
<div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
<nav className="bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700">
<table className="bg-white dark:bg-neutral-800">
<tr className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
<input className="bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600">
<button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
```

### Dependencias adicionales a instalar
```json
"i18next": "^23.10.0",
"react-i18next": "^14.1.0",
"i18next-browser-languagedetector": "^8.0.0"
```

---

## RELACIONES DB CLAVE (para entender las dependencias entre módulos)

```
users ──────────────── user_roles ──── roles ──── role_permissions ──── permissions
products ──┬─────────── categories
           ├─────────── suppliers
           ├─────────── units
           ├─────────── tax_profiles
           ├─────────── product_lots
           ├─────────── product_barcodes
           └─────────── product_prices

sales ─────┬─────────── customers
           ├─────────── users
           ├─────────── discounts
           ├─────────── sale_items ──── products
           └─────────── sale_payments ── payment_methods

purchases ─┬─────────── suppliers
           ├─────────── users
           ├─────────── purchase_items ─ products
           └─────────── purchase_payments ─ payment_methods

inventory_movements ─── products ─── inventory_locations
cash_entries ─────────── cash_journals
customer_credit_accounts ── customers
audit_log ─────────────── users
```

---

*Prompt generado automáticamente analizando el backend Rust/Axum del proyecto pharmacy_backend.*
*Backend: Rust + Axum + SeaORM + PostgreSQL*
*Versión del prompt: 1.2 — Añadido manejo de fechas UTC ↔ hora local*
