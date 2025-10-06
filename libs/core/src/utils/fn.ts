import { ulid } from 'ulidx';

/**
 * Calculates the time difference between two dates.
 *
 * @param {Date} fromTime - The starting date.
 * @param {Date} toTime - The ending date.
 * @returns {string} - A string representing the time difference in minutes, seconds, and milliseconds.
 */
export function timeDiffMinutesDetails(fromTime: Date, toTime: Date): string {
  const diff = toTime.getTime() - fromTime.getTime();
  const minutes = Math.floor(diff / 60000);
  const seconds = ((diff % 60000) / 1000).toFixed(0);
  const milliseconds = diff % 1000;

  return `${minutes}m ${seconds}s ${milliseconds}ms`;
}

/**
 * Generates a ULID.
 *
 * @param {Date} [date] - The date to use for generating the ULID.
 * @returns {string} - A string representing the ULID.
 */
export function generateId(date?: Date): string {
  return ulid(date?.getTime());
}

export function convertToNumber(value: string | number): number | null {
  if (typeof value === 'number') {
    if (isNaN(value)) return null;
    return value;
  }

  if (value === '') return null;

  const parsedValue = parseFloat(value);
  if (isNaN(parsedValue)) return null;

  return parsedValue;
}
