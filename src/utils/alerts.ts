import Swal from 'sweetalert2';

const darkPopup = {
  background: '#1f2937',
  color: '#f9fafb',
};

export function confirmDelete(name: string) {
  return Swal.fire({
    title: '¿Eliminar registro?',
    html: `<p style="color:#d1d5db">Se eliminará <strong style="color:#f87171">${name}</strong> de forma permanente.</p>`,
    icon: 'warning',
    iconColor: '#ef4444',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    ...darkPopup,
  });
}

export function showSuccess(msg: string) {
  return Swal.fire({
    title: '¡Éxito!',
    text: msg,
    icon: 'success',
    iconColor: '#22c55e',
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
    ...darkPopup,
  });
}

export function showError(msg: string) {
  return Swal.fire({
    title: 'Error',
    text: msg,
    icon: 'error',
    iconColor: '#ef4444',
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Aceptar',
    ...darkPopup,
  });
}

export function confirmSale(total: number) {
  return Swal.fire({
    title: '¿Confirmar venta?',
    html: `<p style="color:#d1d5db">Total a cobrar: <strong style="color:#22c55e">$${total.toFixed(2)}</strong></p>`,
    icon: 'question',
    iconColor: '#22c55e',
    showCancelButton: true,
    confirmButtonColor: '#22c55e',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    ...darkPopup,
  });
}
