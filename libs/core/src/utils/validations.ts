/**
 * Validates if the given slug is valid.
 *
 * @param {string} slug - The slug to validate.
 * @returns {{ isValid: boolean, value: string, validations: object, errors: string[] }} - An object containing:
 */
export function isValidSlug(slug: string): {
  isValid: boolean;
  value: string;
  validations: {
    noSpaces: boolean;
    allLowerCase: boolean;
    allowedCharacters: boolean;
    startsProperly: boolean;
    endsProperly: boolean;
    multipleDashes: boolean;
  };
  errors: string[];
} {
  const validations = {
    noSpaces: !/\s/.test(slug),
    allLowerCase: slug === slug.toLowerCase(),
    allowedCharacters: /^[a-z0-9-]+$/.test(slug),
    startsProperly: /^[a-z]/.test(slug),
    endsProperly: /[a-z0-9]$/.test(slug),
    multipleDashes: !/--/.test(slug),
  };

  const errors: string[] = [];

  if (!validations.noSpaces) {
    errors.push('Slug should not contain spaces.');
  }

  if (!validations.allLowerCase) {
    errors.push('Slug should only contain lowercase letters.');
  }

  if (!validations.allowedCharacters) {
    errors.push('Slug contains invalid characters. Only a-z, 0-9, "-" and "_" are allowed.');
  }

  if (!validations.startsProperly) {
    errors.push('Slug must start with a lowercase letter.');
  }

  if (!validations.endsProperly) {
    errors.push('Slug must end with a lowercase letter or digit.');
  }

  if (!validations.multipleDashes) {
    errors.push('Slug should not contain multiple consecutive dashes.');
  }

  return {
    isValid: Object.values(validations).every(Boolean),
    value: slug,
    validations,
    errors,
  };
}
