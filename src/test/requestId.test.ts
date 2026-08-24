import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * El módulo cachea el id en memoria, así que cada test recarga el módulo
 * (vi.resetModules + import dinámico) para partir de estado limpio.
 */
async function loadModule() {
  vi.resetModules();
  return await import('../api/requestId');
}

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('requestId', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('genera un UUID v4 válido', async () => {
    const { getOriginRequestId } = await loadModule();
    const id = getOriginRequestId();
    expect(id).toMatch(UUID_V4_RE);
  });

  it('reutiliza el mismo id en llamadas sucesivas y lo persiste', async () => {
    const { getOriginRequestId } = await loadModule();
    const first = getOriginRequestId();
    expect(getOriginRequestId()).toBe(first);

    // Persistido en localStorage con la clave esperada
    expect(localStorage.getItem('pharmacy_request_id')).toBe(first);

    // Incluso tras "recargar" la app (nueva carga del módulo) se conserva
    const reloaded = await loadModule();
    expect(reloaded.getOriginRequestId()).toBe(first);
  });

  it('adopta un id previo válido del storage sin regenerarlo', async () => {
    localStorage.setItem(
      'pharmacy_request_id',
      '11111111-2222-4333-8444-555555555555',
    );
    const { getOriginRequestId } = await loadModule();
    expect(getOriginRequestId()).toBe('11111111-2222-4333-8444-555555555555');
  });

  it('regenera cuando el id almacenado es inválido (caracteres inseguros)', async () => {
    // Contiene espacios → el backend lo rechazaría
    localStorage.setItem('pharmacy_request_id', 'id con espacios!');
    const { getOriginRequestId } = await loadModule();
    const id = getOriginRequestId();
    expect(id).toMatch(UUID_V4_RE);
    expect(localStorage.getItem('pharmacy_request_id')).toBe(id);
  });

  it('regenera cuando el valor almacenado excede el límite del backend', async () => {
    localStorage.setItem('pharmacy_request_id', 'x'.repeat(129));
    const { getOriginRequestId } = await loadModule();
    expect(getOriginRequestId()).toMatch(UUID_V4_RE);
  });

  it('sigue funcionando si localStorage no está disponible', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage bloqueado');
    });
    const { getOriginRequestId } = await loadModule();
    const first = getOriginRequestId();
    expect(first).toMatch(UUID_V4_RE);
    // Fallback en memoria: misma instancia de módulo devuelve el mismo id
    expect(getOriginRequestId()).toBe(first);
  });

  it('generateUuidV4 produce formato v4 independiente del storage', async () => {
    const { generateUuidV4 } = await loadModule();
    const a = generateUuidV4();
    const b = generateUuidV4();
    expect(a).toMatch(UUID_V4_RE);
    expect(b).toMatch(UUID_V4_RE);
    expect(a).not.toBe(b);
  });
});
