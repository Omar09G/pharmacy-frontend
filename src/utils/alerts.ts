import Swal from 'sweetalert2';
import i18n from '../i18n';
import { getApiErrorMessage } from './apiErrorMapper';

/* ── Theme ─────────────────────────────────────────────── */

interface AlertTheme {
  bg: string;
  text: string;
  muted: string;
  border: string;
  backdrop: string;
}

const dark: AlertTheme = {
  bg: '#1f2937',
  text: '#f9fafb',
  muted: '#9ca3af',
  border: '#374151',
  backdrop: 'rgba(0,0,0,.55)',
};

const light: AlertTheme = {
  bg: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  backdrop: 'rgba(0,0,0,.25)',
};

function theme(): AlertTheme {
  return typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
    ? dark
    : light;
}

/* ── SVG icons ─────────────────────────────────────────── */

const icons = {
  warning: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  check: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
  error: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  sale: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  trash: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`,
};

/* ── Icon badge builder ────────────────────────────────── */

function badge(gradient: string, svg: string): string {
  return `<div style="width:52px;height:52px;border-radius:14px;background:${gradient};display:flex;align-items:center;justify-content:center;flex-shrink:0">${svg}</div>`;
}

/* ── Shared popup config ───────────────────────────────── */

function popupBase(t: AlertTheme) {
  return {
    background: t.bg,
    color: t.text,
    backdrop: t.backdrop,
    showClass: { popup: 'swal2-show swal-animate-in' },
    hideClass: { popup: 'swal2-hide swal-animate-out' },
    customClass: {
      popup: 'swal-custom-popup',
      confirmButton: 'swal-btn swal-btn-confirm',
      cancelButton: 'swal-btn swal-btn-cancel',
      actions: 'swal-actions',
    },
  } as const;
}

/* ── CSS (injected once) ───────────────────────────────── */

let cssInjected = false;
function injectCss() {
  if (cssInjected || typeof document === 'undefined') return;
  cssInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    .swal-custom-popup{border-radius:16px!important;padding:28px 24px 20px!important;border:1px solid var(--swal-border,#e5e7eb)!important;box-shadow:0 20px 60px -12px rgba(0,0,0,.25)!important;max-width:400px!important}
    .swal-custom-popup .swal2-title{font-size:18px!important;font-weight:700!important;padding:0 0 4px!important}
    .swal-custom-popup .swal2-html-container{margin:0!important;padding:0!important}
    .swal-actions{gap:10px!important;margin-top:20px!important}
    .swal-btn{border-radius:10px!important;font-weight:600!important;font-size:14px!important;padding:10px 22px!important;border:none!important;transition:all .15s!important}
    .swal-btn:hover{filter:brightness(1.08)!important;transform:translateY(-1px)!important}
    .swal-btn:active{transform:translateY(0)!important}
    .swal-btn-cancel{background:#e5e7eb!important;color:#374151!important}
    .dark .swal-btn-cancel{background:#374151!important;color:#d1d5db!important}
    .swal-toast-popup{border-radius:14px!important;padding:16px 20px!important;border:1px solid var(--swal-border,#e5e7eb)!important;box-shadow:0 8px 30px -6px rgba(0,0,0,.2)!important}
    .swal-toast-popup .swal2-html-container{margin:0!important;padding:0!important}
    .swal-toast-popup .swal2-timer-progress-bar{background:linear-gradient(90deg,#a78bfa,#7c3aed)!important;border-radius:0 0 14px 14px!important}
    @keyframes swalIn{from{opacity:0;transform:scale(.92) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes swalOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.92) translateY(8px)}}
    .swal-animate-in{animation:swalIn .25s ease-out!important}
    .swal-animate-out{animation:swalOut .15s ease-in!important}
  `;
  document.head.appendChild(style);
}

/* ── Public API ────────────────────────────────────────── */

export function confirmUpdate(name: string) {
  injectCss();
  const t = theme();
  return Swal.fire({
    icon: undefined,
    title: i18n.t('alerts.confirmUpdateTitle'),
    html: `
      <div style="display:flex;align-items:center;gap:14px;margin-top:12px">
        ${badge('linear-gradient(135deg,#fbbf24,#f59e0b)', icons.warning)}
        <p style="color:${t.muted};font-size:14px;line-height:1.5;text-align:left;margin:0">
          ${i18n.t('alerts.confirmUpdateBody', { name, interpolation: { escapeValue: false } })}
        </p>
      </div>`,
    showCancelButton: true,
    confirmButtonColor: '#f59e0b',
    confirmButtonText: i18n.t('alerts.confirmUpdateBtn'),
    cancelButtonText: i18n.t('alerts.cancelBtn'),
    reverseButtons: true,
    ...popupBase(t),
  });
}

export function confirmDelete(name: string) {
  injectCss();
  const t = theme();
  return Swal.fire({
    icon: undefined,
    title: i18n.t('alerts.confirmDeleteTitle'),
    html: `
      <div style="display:flex;align-items:center;gap:14px;margin-top:12px">
        ${badge('linear-gradient(135deg,#fb7185,#ef4444)', icons.trash)}
        <p style="color:${t.muted};font-size:14px;line-height:1.5;text-align:left;margin:0">
          ${i18n.t('alerts.confirmDeleteBody', { name, interpolation: { escapeValue: false } })}
        </p>
      </div>`,
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: i18n.t('alerts.confirmDeleteBtn'),
    cancelButtonText: i18n.t('alerts.cancelBtn'),
    reverseButtons: true,
    ...popupBase(t),
  });
}

export function showSuccess(msg: string) {
  injectCss();
  const t = theme();
  return Swal.fire({
    icon: undefined,
    html: `
      <div style="display:flex;align-items:center;gap:14px">
        ${badge('linear-gradient(135deg,#34d399,#10b981)', icons.check)}
        <div style="text-align:left">
          <div style="font-weight:700;font-size:15px;color:${t.text};margin-bottom:2px">${i18n.t('alerts.successTitle')}</div>
          <div style="font-size:13px;color:${t.muted};line-height:1.4">${msg}</div>
        </div>
      </div>`,
    position: 'top-end',
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
    showCloseButton: true,
    background: t.bg,
    backdrop: false,
    customClass: {
      popup: 'swal-toast-popup',
    },
    showClass: { popup: 'swal2-show swal-animate-in' },
    hideClass: { popup: 'swal2-hide swal-animate-out' },
  });
}

export function showError(msg: string) {
  injectCss();
  const t = theme();
  return Swal.fire({
    icon: undefined,
    html: `
      <div style="display:flex;align-items:center;gap:14px">
        ${badge('linear-gradient(135deg,#fb7185,#ef4444)', icons.error)}
        <div style="text-align:left">
          <div style="font-weight:700;font-size:15px;color:${t.text};margin-bottom:2px">${i18n.t('alerts.errorTitle')}</div>
          <div style="font-size:13px;color:${t.muted};line-height:1.4">${msg}</div>
        </div>
      </div>`,
    position: 'top-end',
    timer: 3500,
    timerProgressBar: true,
    showConfirmButton: false,
    showCloseButton: true,
    background: t.bg,
    backdrop: false,
    customClass: {
      popup: 'swal-toast-popup',
    },
    showClass: { popup: 'swal2-show swal-animate-in' },
    hideClass: { popup: 'swal2-hide swal-animate-out' },
  });
}

export function confirmSale(total: number) {
  injectCss();
  const t = theme();
  return Swal.fire({
    icon: undefined,
    title: i18n.t('alerts.confirmSaleTitle'),
    html: `
      <div style="display:flex;align-items:center;gap:14px;margin-top:12px">
        ${badge('linear-gradient(135deg,#34d399,#059669)', icons.sale)}
        <p style="color:${t.muted};font-size:14px;line-height:1.5;text-align:left;margin:0">
          ${i18n.t('alerts.confirmSaleBody', { total: total.toFixed(2), interpolation: { escapeValue: false } })}
        </p>
      </div>`,
    showCancelButton: true,
    confirmButtonColor: '#059669',
    confirmButtonText: i18n.t('alerts.confirmBtn'),
    cancelButtonText: i18n.t('alerts.cancelBtn'),
    reverseButtons: true,
    ...popupBase(t),
  });
}

export function showApiError(error: unknown) {
  return showError(getApiErrorMessage(error));
}
