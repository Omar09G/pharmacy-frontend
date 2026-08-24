/**
 * Correlación de origen vía X-Request-ID.
 *
 * Genera el UUID UNA sola vez por instalación/sesión del cliente y lo reutiliza
 * en TODAS las llamadas API, de modo que los logs del backend puedan rastrear
 * cada petición hasta este origen ("origin tracing"). Solo se genera un id
 * nuevo cuando no existe uno válido almacenado.
 */

/** Header esperado por el backend (`REQUEST_ID_HEADER` en request_id.rs). */
export const REQUEST_ID_HEADER = 'x-request-id';

const STORAGE_KEY = 'pharmacy_request_id';

/**
 * Mismos límites que valida el backend Rust para ids entrantes:
 * `[A-Za-z0-9._-]`, longitud 1..=128 (request_id.rs::is_safe_id_char).
 */
const ID_PATTERN = /^[A-Za-z0-9._-]{8,128}$/;

/** UUID v4 sin dependencias; fallback manual si `crypto.randomUUID` no está
 * disponible (contextos no seguros como el emulador http://10.0.2.2). */
export function generateUuidV4(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // versión 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante RFC 4122
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(
    '',
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

let cachedId: string | null = null;

/**
 * Devuelve el id de origen vigente: lo lee de storage, valida su formato y lo
 * reutiliza; solo genera y persiste uno nuevo si no existe o es inválido.
 */
export function getOriginRequestId(): string {
  if (cachedId) return cachedId;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ID_PATTERN.test(stored)) {
      cachedId = stored;
      return cachedId;
    }
  } catch {
    /* storage no disponible (p.ej. modo privado) — cae al fallback en memoria */
  }
  cachedId = generateUuidV4();
  try {
    localStorage.setItem(STORAGE_KEY, cachedId);
  } catch {
    /* ignorado: ya queda el fallback en memoria de módulo */
  }
  return cachedId;
}
