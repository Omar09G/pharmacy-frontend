import Swal from 'sweetalert2';

type AlertTheme = {
  popup: {
    background: string;
    color: string;
  };
  mutedText: string;
  cancelButtonColor: string;
};

const darkTheme: AlertTheme = {
  popup: {
    background: '#1f2937',
    color: '#f9fafb',
  },
  mutedText: '#d1d5db',
  cancelButtonColor: '#6b7280',
};

const lightTheme: AlertTheme = {
  popup: {
    background: '#ffffff',
    color: '#111827',
  },
  mutedText: '#374151',
  cancelButtonColor: '#9ca3af',
};

function getAlertTheme(): AlertTheme {
  if (typeof document !== 'undefined') {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? darkTheme : lightTheme;
  }
  return darkTheme;
}

export function confirmUpdate(name: string) {
  const theme = getAlertTheme();
  return Swal.fire({
    title: '¿Actualizar registro?',
    html: `<p style="color:${theme.mutedText}">Se actualizará <strong style="color:#f87171">${name}</strong> de forma permanente.</p>`,
    icon: 'warning',
    iconColor: '#ef4444',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: theme.cancelButtonColor,
    confirmButtonText: 'Sí, actualizar',
    cancelButtonText: 'Cancelar',
    ...theme.popup,
  });
}

export function confirmDelete(name: string) {
  const theme = getAlertTheme();
  return Swal.fire({
    title: '¿Eliminar registro?',
    html: `<p style="color:${theme.mutedText}">Se eliminará <strong style="color:#f87171">${name}</strong> de forma permanente.</p>`,
    icon: 'warning',
    iconColor: '#ef4444',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: theme.cancelButtonColor,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    ...theme.popup,
  });
}

export function showSuccess(msg: string) {
  const theme = getAlertTheme();
  return Swal.fire({
    title: '¡Éxito!',
    text: msg,
    icon: 'success',
    iconColor: '#22c55e',
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
    ...theme.popup,
  });
}

export function showError(msg: string) {
  const theme = getAlertTheme();
  return Swal.fire({
    title: 'Error',
    text: msg,
    icon: 'error',
    iconColor: '#ef4444',
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Aceptar',
    ...theme.popup,
  });
}

export function confirmSale(total: number) {
  const theme = getAlertTheme();
  return Swal.fire({
    title: '¿Confirmar venta?',
    html: `<p style="color:${theme.mutedText}">Total a cobrar: <strong style="color:#22c55e">$${total.toFixed(2)}</strong></p>`,
    icon: 'question',
    iconColor: '#22c55e',
    showCancelButton: true,
    confirmButtonColor: '#22c55e',
    cancelButtonColor: theme.cancelButtonColor,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    ...theme.popup,
  });
}
