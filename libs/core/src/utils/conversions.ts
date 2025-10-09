/**
 * Converts a string or number to a number.
 * Returns null if the conversion is not possible.
 *
 * @param {string | number} value - The value to convert.
 * @returns {number | null} - The converted number or null if conversion fails.
 */
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
