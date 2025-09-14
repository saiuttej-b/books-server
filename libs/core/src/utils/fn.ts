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
