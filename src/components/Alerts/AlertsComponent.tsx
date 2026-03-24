import Swal from 'sweetalert2';
import { successTemplate, errorTemplate, infoTemplate } from './alertTemplates';

export const showError = (message: string): void => {
  Swal.fire({
    html: errorTemplate(message),
    position: 'top-end',
    timer: 2200,
    timerProgressBar: true,
    background: '#ffffff',
    backdrop: 'rgba(239,68,68,0.06)',
    icon: undefined,
    customClass: {
      popup: 'custom-popup custom-error-popup',
      confirmButton: 'custom-button',
    },
  });
};

export const showSuccess = (title: string, message: string): void => {
  Swal.fire({
    html: successTemplate(title, message),
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
    icon: undefined,
    position: 'top-end',
    background: '#ffffff',
    backdrop: 'rgba(124,58,237,0.12)',
    showCloseButton: true,
    customClass: {
      popup: 'custom-popup custom-success-popup',
      confirmButton: 'custom-button',
    },
  });
};

export const showInfo = (title: string, message: string): void => {
  Swal.fire({
    html: infoTemplate(title, message),
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
    position: 'top-end',
    background: '#ffffff',
    backdrop: 'rgba(59,130,246,0.06)',
    icon: undefined,
    showCloseButton: true,
    customClass: {
      popup: 'custom-popup custom-info-popup',
      confirmButton: 'custom-button',
    },
  });
};
