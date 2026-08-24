import { format, parseISO, subDays } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

const localeMap: Record<string, typeof es> = { es, en: enUS };

/** Application timezone from env, defaults to America/Mexico_City */
const APP_TZ = import.meta.env.VITE_APP_TIMEZONE || 'America/Mexico_City';

/** Convert a local Date to ISO UTC string */
export function toUTC(localDate: Date): string {
  return localDate.toISOString();
}

/** Get current moment as ISO UTC string */
export function nowUTC(): string {
  return new Date().toISOString();
}

/** Convert an input[type=datetime-local] value to ISO UTC */
export function localInputToUTC(inputValue: string): string {
  return new Date(inputValue).toISOString();
}

/** Convert ISO UTC string to value suitable for input[type=datetime-local] */
export function utcToLocalInput(utcString: string): string {
  const d = parseISO(utcString);
  const local = toZonedTime(d, APP_TZ);
  return format(local, "yyyy-MM-dd'T'HH:mm");
}

/** Format UTC string to local date+time for display */
export function formatLocal(utcString: string, lang: string = 'es'): string {
  const d = parseISO(utcString);
  const local = toZonedTime(d, APP_TZ);
  return format(local, 'dd/MM/yyyy HH:mm', { locale: localeMap[lang] ?? es });
}

/** Format UTC string to local date only */
export function formatLocalDate(
  utcString: string,
  lang: string = 'es',
): string {
  const d = parseISO(utcString);
  const local = toZonedTime(d, APP_TZ);
  return format(local, 'dd/MM/yyyy', { locale: localeMap[lang] ?? es });
}

/** Format UTC string to local time only */
export function formatLocalTime(utcString: string): string {
  const d = parseISO(utcString);
  const local = toZonedTime(d, APP_TZ);
  return format(local, 'HH:mm');
}

/** Format UTC string to local date+time with timezone abbreviation */
export function formatLocalFull(utcString: string): string {
  const d = parseISO(utcString);
  const local = toZonedTime(d, APP_TZ);
  const tzAbbr =
    new Intl.DateTimeFormat('en', {
      timeZone: APP_TZ,
      timeZoneName: 'short',
    })
      .formatToParts(d)
      .find((p) => p.type === 'timeZoneName')?.value ?? APP_TZ;
  return `${format(local, 'dd/MM/yyyy HH:mm')} (${tzAbbr})`;
}

//Format YYYY-MM-DD to UTC string
export function dateToUTC(dateString: string): string {
  const d = parseISO(dateString);
  return d.toISOString();
}
//Obtener la fecha actual en formato YYYY-MM-DD
export function getCurrentDate(): string {
  const now = new Date();
  return format(now, 'yyyy-MM-dd');
}

//Obtener la fecha de hace N días en formato YYYY-MM-DD (para rangos de gráficas)
export function getDaysAgoDate(days: number): string {
  return format(subDays(new Date(), days), 'yyyy-MM-dd');
}

//Obtener la fecha actual en formato YYYY-MM-DD
export function getCurrentDateTimeLocal(): string {
  const now = new Date();
  return format(now, "yyyy-MM-dd'T'HH:mm");
}
