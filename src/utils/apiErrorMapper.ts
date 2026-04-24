import axios from 'axios';
import i18n from '../i18n';
import { API_BASE_URL } from './constants';

const statusMap: Record<number, string> = {
  400: 'apiErrors.badRequest',
  401: 'apiErrors.unauthorized',
  403: 'apiErrors.forbidden',
  404: 'apiErrors.notFound',
  409: 'apiErrors.conflict',
  422: 'apiErrors.unprocessable',
  429: 'apiErrors.tooManyRequests',
  500: 'apiErrors.serverError',
  502: 'apiErrors.serverError',
  503: 'apiErrors.serviceUnavailable',
  504: 'apiErrors.timeout',
};

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return i18n.t('apiErrors.timeout');
    if (!error.response) {
      // In development, append the URL so the dev can immediately see what's failing
      if (import.meta.env.DEV) {
        const url = error.config?.baseURL ?? API_BASE_URL;
        return `${i18n.t('apiErrors.networkError')} [API: ${url}]`;
      }
      return i18n.t('apiErrors.networkError');
    }

    const status = error.response.status;
    const key = statusMap[status];
    if (key) return i18n.t(key);
  }
  return i18n.t('apiErrors.unknown');
}

export function getLoginErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return i18n.t('apiErrors.loginFailed');
  }
  return getApiErrorMessage(error);
}
