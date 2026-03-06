import { AxiosError } from 'axios';

export type ApiErrorCode = 'unauthorized' | 'not_found' | 'conflict' | 'network' | 'unknown';

export interface ApiError {
  status: number | null;
  code: ApiErrorCode;
  message: string;
}

interface BackendErrorPayload {
  detail?: string;
}

export const getApiErrorCode = (status: number | null): ApiErrorCode => {
  if (status === 401) return 'unauthorized';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === null) return 'network';
  return 'unknown';
};

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? null;
    const payload = error.response?.data as BackendErrorPayload | undefined;
    return {
      status,
      code: getApiErrorCode(status),
      message: payload?.detail || error.message || 'Ошибка запроса',
    };
  }

  if (error instanceof Error) {
    return {
      status: null,
      code: 'unknown',
      message: error.message,
    };
  }

  return {
    status: null,
    code: 'unknown',
    message: 'Неизвестная ошибка',
  };
};

export const isApiErrorStatus = (error: unknown, status: number) => toApiError(error).status === status;
