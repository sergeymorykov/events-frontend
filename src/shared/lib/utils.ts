import { format } from 'date-fns';
import ru from 'date-fns/locale/ru';

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Дата не указана';
  try {
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy, HH:mm', { locale: ru });
  } catch {
    return dateString;
  }
};

export const formatPrice = (price: { amount: number | null; currency: string | null } | null): string => {
  if (!price || price.amount === null) {
    return 'Бесплатно';
  }
  return `${price.amount} ${price.currency || '₽'}`;
};

export const buildEventImageUrl = (path: string | undefined | null): string | null => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  if (!path || !apiBaseUrl) {
    return null;
  }

  const basePath = apiBaseUrl.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${basePath}/images/${cleanPath}`;
};

