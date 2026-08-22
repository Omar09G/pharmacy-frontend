import axios from 'axios';
import i18n from '../i18n';
import { API_BASE_URL } from './constants';

/** Error type classification sent by the backend in the `errorType` field. */
export type ApiErrorType =
  'business' | 'validation' | 'auth' | 'system' | 'network';

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

/**
 * Extract the backend's `errorType` field from an Axios error response.
 * Returns `null` when the field is absent (e.g. older backend versions).
 */
function extractErrorType(error: unknown): ApiErrorType | null {
  if (!axios.isAxiosError(error) || !error.response) return null;
  const errorType = (error.response.data as Record<string, unknown>)?.errorType;
  if (typeof errorType === 'string') {
    const lower = errorType.toLowerCase();
    if (
      lower === 'business' ||
      lower === 'validation' ||
      lower === 'auth' ||
      lower === 'system' ||
      lower === 'network'
    ) {
      return lower as ApiErrorType;
    }
  }
  return null;
}

/**
 * Extract the backend's custom `message` field from an Axios error response.
 * Falls back to `null` when no server message is present.
 */
function extractServerMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error) || !error.response) return null;
  const data = error.response.data as Record<string, unknown> | null;
  if (data && typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }
  return null;
}

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

    // For business errors, prefer the server-provided message (already localized in Spanish)
    // so the user sees a specific, actionable message (e.g. "Stock insuficiente").
    const errorType = extractErrorType(error);
    const serverMessage = extractServerMessage(error);

    if (errorType === 'business' && serverMessage) {
      return serverMessage;
    }

    const key = statusMap[status];
    if (key) return i18n.t(key);
  }
  return i18n.t('apiErrors.unknown');
}

/** Returns the error type classification, or `null` if not available. */
export function getApiErrorType(error: unknown): ApiErrorType | null {
  return extractErrorType(error);
}

export function getLoginErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return i18n.t('apiErrors.loginFailed');
  }
  return getApiErrorMessage(error);
}
