export const DayOfWeek = {
   MONDAY: 'MONDAY',
   TUESDAY: 'TUESDAY',
   WEDNESDAY: 'WEDNESDAY',
   THURSDAY: 'THURSDAY',
   FRIDAY: 'FRIDAY',
   SATURDAY: 'SATURDAY',
   SUNDAY: 'SUNDAY',
} as const;

export type DayOfWeekValue = (typeof DayOfWeek)[keyof typeof DayOfWeek];

export const WEEK_DAYS_ORDERED: DayOfWeekValue[] = [
   DayOfWeek.MONDAY,
   DayOfWeek.TUESDAY,
   DayOfWeek.WEDNESDAY,
   DayOfWeek.THURSDAY,
   DayOfWeek.FRIDAY,
   DayOfWeek.SATURDAY,
   DayOfWeek.SUNDAY,
];

export const MONTH_OPTIONS: Array<{ value: string; label: string }> = [
   { value: "01", label: "Ene" },
   { value: "02", label: "Feb" },
   { value: "03", label: "Mar" },
   { value: "04", label: "Abr" },
   { value: "05", label: "May" },
   { value: "06", label: "Jun" },
   { value: "07", label: "Jul" },
   { value: "08", label: "Ago" },
   { value: "09", label: "Sep" },
   { value: "10", label: "Oct" },
   { value: "11", label: "Nov" },
   { value: "12", label: "Dic" },
]

export const DAYS_OPTIONS: Array<{ value: string; label: string }> = Array.from({ length: 31 }, (_, i) => ({
   value: String(i + 1).padStart(2, '0'),
   label: String(i + 1),
}));

export const YEAR_OPTIONS: Array<{ value: string; label: string }> = Array.from({ length: 100 }, (_, i) => ({
   value: String(new Date().getFullYear() + i),
   label: String(new Date().getFullYear() + i),
}));

export const MINUTE_SLOTS = ['00', '15', '30', '45'] as const;

export type MinuteSlot = (typeof MINUTE_SLOTS)[number];

export function snapMinute(m: string): MinuteSlot {
   const n = parseInt(m, 10);
   const safe = Number.isNaN(n) ? 0 : n;
   return MINUTE_SLOTS.reduce((prev, curr) =>
      Math.abs(parseInt(curr, 10) - safe) < Math.abs(parseInt(prev, 10) - safe) ? curr : prev,
   );
}

export const ALL_DAY_OF_WEEK = WEEK_DAYS_ORDERED;


export type Period = 'AM' | 'PM';

/** Convierte HH:mm (24 h) a piezas para selector 12 h. */
export function hm24To12Parts(hm24: string): { h12: string; minute: string; period: Period } {
   const [hs, ms] = hm24.split(':');
   const h24 = parseInt(hs ?? '0', 10);
   const minute = snapMinute(ms ?? '00');
   let period: Period = 'AM';
   let h12 = 12;
   if (h24 === 0) {
      h12 = 12;
      period = 'AM';
   } else if (h24 < 12) {
      h12 = h24;
      period = 'AM';
   } else if (h24 === 12) {
      h12 = 12;
      period = 'PM';
   } else {
      h12 = h24 - 12;
      period = 'PM';
   }
   return { h12: String(h12).padStart(2, '0'), minute, period };
}

/** Convierte piezas 12 h a HH:mm (24 h). */
export function hm12To24(h12: string, minute: string, period: Period): string {
   let h = parseInt(h12, 10);
   if (period === 'AM') {
      if (h === 12) h = 0;
   } else if (h !== 12) {
      h += 12;
   }
   return `${String(h).padStart(2, '0')}:${minute}`;
}

/** Texto legible 12 h para UI. */
export function formatHm24Display12h(hm24: string): string {
   const [hStr, mStr] = hm24.split(':');
   const h24 = parseInt(hStr ?? '0', 10);
   const m = parseInt(snapMinute(mStr ?? '00'), 10);
   const d = new Date(2000, 0, 1, h24, m, 0, 0);
   return d.toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export const HOUR12_OPTIONS = Array.from({ length: 12 }, (_, i) => {
   const n = i + 1;
   const v = String(n).padStart(2, '0');
   return { value: v, label: v };
});

export const MINUTE_OPTIONS = MINUTE_SLOTS.map((v) => ({
   value: v,
   label: v,
}));

export const PERIOD_OPTIONS: Array<{ value: Period; label: string }> = [
   { value: 'AM', label: 'a. m.' },
   { value: 'PM', label: 'p. m.' },
];

export const parseDate = (value: string) => {
   const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
   if (!match) return null
   return {
      year: match[1],
      month: match[2],
      day: match[3],
   }
}

export const daysInMonth = (year: number, month: number) => {
   return new Date(year, month, 0).getDate()
}
