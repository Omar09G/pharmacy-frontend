import { format, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

const localeMap: Record<string, typeof es> = { es, en: enUS };

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
  const local = toZonedTime(
    d,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  return format(local, "yyyy-MM-dd'T'HH:mm");
}

/** Format UTC string to localized date+time for display */
export function formatLocal(utcString: string, lang: string = 'es'): string {
  const d = parseISO(utcString);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const local = toZonedTime(d, tz);
  return format(local, 'dd/MM/yyyy HH:mm', { locale: localeMap[lang] ?? es });
}

/** Format UTC string to localized date only */
export function formatLocalDate(
  utcString: string,
  lang: string = 'es',
): string {
  const d = parseISO(utcString);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const local = toZonedTime(d, tz);
  return format(local, 'dd/MM/yyyy', { locale: localeMap[lang] ?? es });
}

/** Format UTC string to localized time only */
export function formatLocalTime(utcString: string): string {
  const d = parseISO(utcString);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const local = toZonedTime(d, tz);
  return format(local, 'HH:mm');
}

/** Format UTC string to full date+time with timezone abbreviation */
export function formatLocalFull(utcString: string): string {
  const d = parseISO(utcString);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const local = toZonedTime(d, tz);
  const tzAbbr =
    new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'short' })
      .formatToParts(d)
      .find((p) => p.type === 'timeZoneName')?.value ?? tz;
  return `${format(local, 'dd/MM/yyyy HH:mm')} (${tzAbbr})`;
}

//Format YYYY-MM-DD to UTC string
export function dateToUTC(dateString: string): string {
  const d = parseISO(dateString);
  return d.toISOString();
}
