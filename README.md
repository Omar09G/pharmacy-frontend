# Pharmacy Frontend

Frontend de la aplicación "Pharmacy": interfaz administrativa y Punto de Venta (POS) construida con React + TypeScript y Vite.

Estado: En desarrollo.

## Características principales

- Interfaz administrativa y POS (Point of Sale).
- Gestión de productos, clientes, compras, ventas, proveedores y reportes.
- Integración con backend REST (API propia).

## Tecnologías

- React 19 + TypeScript
- Vite (plugin `@vitejs/plugin-react-swc`)
- Tailwind CSS, PostCSS
- TanStack Query / Table, React Hook Form, Zod
- Axios, Recharts, Zustand
- ESLint, Prettier

## Requisitos

- Node 18+ (se recomienda Node 20)
- npm 8+ / 9+

## Instalación y desarrollo

```bash
git clone https://github.com/Omar09G/pharmacy-frontend.git
cd pharmacy-frontend
npm install
npm run dev
```

Abrir `http://localhost:5173` en el navegador.

## Scripts útiles

- `npm run dev` — servidor de desarrollo (Vite)
- `npm run build` — compila TypeScript y genera build de producción (`dist`)
- `npm run lint` — ejecuta ESLint
- `npm run preview` — vista previa del build (vite preview)

## Formateo y comprobaciones

- Formatear con Prettier:

```bash
npx prettier --write "src/**/*.{ts,tsx,css,mjs,json,html}"
```

- Comprobación de tipos:

```bash
npx tsc -b --noEmit
```

- Lint:

```bash
npm run lint
```

## URL del backend / Variables de entorno

Por defecto la URL base del API está en `src/utils/constants.ts`. Ahora se lee desde la variable de entorno Vite `VITE_API_BASE_URL` con un valor por defecto:

```ts
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/v1/api';
```

Para usar una variable de entorno local copie el archivo de ejemplo y reinicie el servidor de desarrollo:

```bash
cp .env.example .env
# editar .env según necesites (p. ej. cambiar VITE_API_BASE_URL)
npm run dev
```

La instancia de Axios se encuentra en [src/api/axiosInstance.ts](src/api/axiosInstance.ts) y añade el token de autenticación automáticamente.

## Docker (construir y ejecutar)

- Construir imagen:

```bash
docker build -t pharmacy-frontend:latest .
```

- Ejecutar contenedor:

```bash
docker run -p 8080:80 pharmacy-frontend:latest
```

El `Dockerfile` usa Nginx para servir la carpeta `dist` y copia `nginx.conf` desde el repositorio.

## Estructura principal (resumen)

- [src/components](src/components) — componentes reutilizables (UI)
- [src/pages](src/pages) — vistas y páginas por ruta
- [src/services](src/services) — llamadas al backend
- [src/store](src/store) — estado local (Zustand)
- [src/utils](src/utils) — utilidades y constantes
- [src/api/axiosInstance.ts](src/api/axiosInstance.ts) — instancia de Axios con interceptores

Para ver la estructura completa, revisa la carpeta [src](src).

## Contribuir

1. Fork del repositorio.
2. Crear una rama: `git checkout -b feat/mi-cambio`.
3. Hacer commits con mensajes claros.
4. Formatear y validar (`prettier`, `tsc`, `eslint`).
5. Abrir un Pull Request describiendo los cambios.

## Ayuda / Contacto

Repositorio: https://github.com/Omar09G/pharmacy-frontend

Abre un issue para bugs o peticiones de mejora.
