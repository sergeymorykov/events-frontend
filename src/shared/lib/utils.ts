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

