import type { EventSchedule } from '../types';

const dayMap: Record<string, string> = {
  monday: 'Пн',
  tuesday: 'Вт',
  wednesday: 'Ср',
  thursday: 'Чт',
  friday: 'Пт',
  saturday: 'Сб',
  sunday: 'Вс',
};

export const formatSchedule = (schedule?: EventSchedule | null): string | null => {
  if (!schedule) {
    return null;
  }

  if (schedule.type === 'exact') {
    const hasExplicitTime = /[T\s]\d{2}:\d{2}/.test(schedule.date_start);
    const date = new Date(schedule.date_start);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const isMidnightTime =
      date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;

    if (!hasExplicitTime || isMidnightTime) {
      return date.toLocaleDateString('ru-RU');
    }

    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (schedule.type === 'recurring_weekly') {
    const parts = Object.entries(schedule.schedule || {})
      .filter(([, times]) => Array.isArray(times) && times.length > 0)
      .map(([day, times]) => `${dayMap[day] ?? day}: ${times.join(', ')}`);

    return parts.length > 0 ? parts.join(' • ') : 'По расписанию';
  }

  if (schedule.type === 'fuzzy') {
    return schedule.description || 'Расписание уточняется';
  }

  return null;
};
