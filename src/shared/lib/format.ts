import { format, formatDistance, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

import { formatTimeForDisplay, TIME_DISPLAY_FORMAT } from './date-format';

export function formatDate(date: string | Date = new Date()): string {
  return format(new Date(date), 'dd MMM yyyy', { locale: es });
}

export function formatTime(date: string | Date = new Date()): string {
  if (typeof date === 'string' && /^\d{1,2}:\d{2}$/.test(date.trim())) {
    return formatTimeForDisplay(date);
  }
  const parsed = date instanceof Date ? date : new Date(date);
  if (!isValid(parsed)) {
    return '';
  }
  return format(parsed, TIME_DISPLAY_FORMAT, { locale: es });
}

export function formatTime12h(value: string | Date = new Date()): string {
  return formatTime(value);
}

export function formatDateTime(date: string | Date = new Date()): string {
  return format(new Date(date), "dd MMM yyyy, hh:mm aaaa", { locale: es });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatRelative(date: string | Date = new Date()): string {
  return formatDistance(new Date(date), new Date(), {
    addSuffix: true,
    locale: es,
  });
}

/** Canonical `HH:mm` (24 h) for API / storage — not for UI. */
export function getHourFromDate(date: string | Date = new Date()): string {
  return format(new Date(date), 'HH:mm');
}

export function getDayOfWeek(date: string | Date = new Date()): string {
  return format(new Date(date), 'EEEE', { locale: es });
}
