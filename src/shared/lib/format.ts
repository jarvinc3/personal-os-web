import { format, formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(date: string | Date = new Date()): string {
  return format(new Date(date), 'dd MMM yyyy', { locale: es });
}

export function formatTime(date: string | Date = new Date()): string {
  return format(new Date(date), 'HH:mm', { locale: es });
}

export function formatTime12h(value: string | Date = new Date()): string {
  if (typeof value === "string") {
    const match = value.match(/^(\d{2}):(\d{2})$/);
    if (match) {
      const hour24 = Number(match[1]);
      const minute = match[2];
      const period = hour24 < 12 ? "a.m." : "p.m.";
      let hour12 = hour24 % 12;
      if (hour12 === 0) hour12 = 12;
      return `${hour12}:${minute} ${period}`;
    }
  }

  const d = value instanceof Date ? value : new Date(value);
  const hour24 = d.getHours();
  const minute = String(d.getMinutes()).padStart(2, "0");
  const period = hour24 < 12 ? "a.m." : "p.m.";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${minute} ${period}`;
}

export function formatDateTime(date: string | Date = new Date()): string {
  return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: es });
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

export function getHourFromDate(date: string | Date = new Date()): string {
  return format(new Date(date), 'HH:mm');
}

export function getDayOfWeek(date: string | Date = new Date()): string {
  return format(new Date(date), 'EEEE', { locale: es });
}
