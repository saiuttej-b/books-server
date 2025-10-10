import { isEmail } from 'class-validator';
import parsePhoneNumberFromString, {
  CountryCode,
  isSupportedCountry,
  isValidPhoneNumber,
  validatePhoneNumberLength,
} from 'libphonenumber-js/max';

/**
 * Validates if the given slug is valid.
 *
 * @param slug - The slug to validate.
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

/**
 * Validates if the given mobile number and country code are valid.
 *
 * @param props - Object containing mobileCountryCode and mobileNumber.
 */
export function isValidMobileNumber(props: { mobileCountryCode?: string; mobileNumber?: string }): {
  isValid: boolean;
  value: {
    mobileCountryCode: string;
    mobileCountryDialCode: string;
    mobileNationalNumber: string;
    mobileNumber: string;
  };
  validations: {
    validCountryCode: boolean;
    validMobileNumber: boolean;
  };
  errors: string[];
} {
  const mobileCountryCode = props.mobileCountryCode || '';
  const mobileNumber = props.mobileNumber || '';

  const validations = {
    validCountryCode: true,
    validMobileNumber: true,
  };
  const errors: string[] = [];

  const validCountryCode = isSupportedCountry(mobileCountryCode);
  if (!validCountryCode) {
    validations.validCountryCode = false;
    errors.push('Invalid country code');
  }

  const validMobileNumber = isValidPhoneNumber(mobileNumber, mobileCountryCode as CountryCode);
  if (!validMobileNumber) {
    const validMobileNumberLength = validatePhoneNumberLength(
      mobileNumber,
      mobileCountryCode as CountryCode,
    );

    validations.validMobileNumber = false;
    let error = 'Invalid mobile number';
    if (validMobileNumberLength) {
      error += `(${validMobileNumberLength})`;
    }

    errors.push(error);
  }

  const parsedValue = parsePhoneNumberFromString(mobileNumber, mobileCountryCode as CountryCode);

  const pCountryCode: string = parsedValue?.country || '';
  const pDialCode: string = parsedValue?.countryCallingCode || '';
  const pNationalNumber: string = parsedValue?.nationalNumber || '';
  const pNumber: string = parsedValue?.number || '';

  if (pCountryCode !== mobileCountryCode) {
    validations.validCountryCode = false;
    errors.push('Country code does not match the mobile number');
  }

  return {
    isValid: Object.values(validations).every((v) => v),
    value: {
      mobileCountryCode: pCountryCode,
      mobileCountryDialCode: pDialCode,
      mobileNationalNumber: pNationalNumber,
      mobileNumber: pNumber,
    },
    validations,
    errors,
  };
}

/**
 * Validates if the given password meets strength criteria.
 *
 * @param password - The password to validate.
 */
export function isStrongPassword(password?: string): {
  isValid: boolean;
  validations: {
    minLength: boolean;
    maxLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    whitespaces: boolean;
  };
  errors: string[];
} {
  password = password || '';

  const validations = {
    minLength: true,
    maxLength: true,
    hasUpperCase: true,
    hasLowerCase: true,
    hasNumber: true,
    hasSpecialChar: true,
    whitespaces: true,
  };
  const errors: string[] = [];

  if (password.length < 8) {
    validations.minLength = false;
    errors.push('Password must be at least 8 characters long.');
  }
  if (password.length > 25) {
    validations.maxLength = false;
    errors.push('Password must be at most 25 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    validations.hasUpperCase = false;
    errors.push('Password must contain at least one uppercase letter.');
  }
  if (!/[a-z]/.test(password)) {
    validations.hasLowerCase = false;
    errors.push('Password must contain at least one lowercase letter.');
  }
  if (!/\d/.test(password)) {
    validations.hasNumber = false;
    errors.push('Password must contain at least one number.');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    validations.hasSpecialChar = false;
    errors.push('Password must contain at least one special character.');
  }
  if (/\s/.test(password)) {
    validations.whitespaces = false;
    errors.push('Password must not contain any whitespace characters.');
  }

  return {
    isValid: Object.values(validations).every((v) => v),
    validations,
    errors,
  };
}

/**
 * Validates if the given Aadhaar number is valid based on certain criteria (India-specific).
 *
 * @param aadhaarNumber - aadhaar number to validate (optional)
 */
export function isValidAadhaarNumber(aadhaarNumber?: string): {
  isValid: boolean;
  validations: {
    length: boolean;
    format: boolean;
    whitespaces: boolean;
  };
  errors: string[];
} {
  aadhaarNumber = aadhaarNumber || '';

  const validations = {
    length: true,
    format: true,
    whitespaces: true,
  };
  const errors: string[] = [];

  if (aadhaarNumber.length !== 12) {
    validations.length = false;
    errors.push('Aadhaar number must be exactly 12 digits long.');
  }
  if (!/^\d+$/.test(aadhaarNumber)) {
    validations.format = false;
    errors.push('Aadhaar number must contain only digits.');
  }
  if (/\s/.test(aadhaarNumber)) {
    validations.whitespaces = false;
    errors.push('Aadhaar number must not contain any whitespace characters.');
  }

  return {
    isValid: Object.values(validations).every((v) => v),
    validations,
    errors,
  };
}

/**
 * Validates if the given email ID is valid based on format and whitespace criteria.
 *
 * @param emailId - email ID to validate (optional)
 */
export function isValidEmailId(emailId?: string) {
  emailId = emailId || '';

  const validations = {
    format: isEmail(emailId),
    whitespaces: !/\s/.test(emailId),
  };
  const errors: string[] = [];

  if (!validations.format) {
    errors.push('Invalid email format.');
  }
  if (!validations.whitespaces) {
    errors.push('Email must not contain any whitespace characters.');
  }

  return {
    isValid: Object.values(validations).every((v) => v),
    validations,
    errors,
  };
}

/**
 * Validates if the given PAN number is valid based on certain criteria (India-specific).
 *
 * @param panNumber - PAN number to validate (optional)
 */
export function isValidPanNumber(panNumber?: string | null) {
  panNumber = panNumber || '';

  const validations = {
    length: panNumber.length === 10,
    format: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber),
    whitespaces: !/\s/.test(panNumber),
  };
  const errors: string[] = [];

  if (!validations.length) {
    errors.push('PAN number must be exactly 10 characters long.');
  }
  if (!validations.format) {
    errors.push('Invalid PAN number format.');
  }
  if (!validations.whitespaces) {
    errors.push('PAN number must not contain any whitespace characters.');
  }

  return {
    isValid: Object.values(validations).every((v) => v),
    validations,
    errors,
  };
}

/**
 * Validates if the given GST number is valid based on certain criteria (India-specific).
 *
 * @param gstNumber - GST number to validate (optional)
 */
export function isValidGSTNumber(gstNumber?: string | null) {
  gstNumber = gstNumber || '';

  const validations = {
    length: gstNumber.length === 15,
    format: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber),
    whitespaces: !/\s/.test(gstNumber),
  };
  const errors: string[] = [];

  if (!validations.length) {
    errors.push('GST number must be exactly 15 characters long.');
  }
  if (!validations.format) {
    errors.push('Invalid GST number format.');
  }
  if (!validations.whitespaces) {
    errors.push('GST number must not contain any whitespace characters.');
  }

  return {
    isValid: Object.values(validations).every((v) => v),
    validations,
    errors,
  };
}

/**
 * Validates if the given code is valid based on certain criteria.
 *
 * @param code - code to validate (optional)
 */
export function isValidCode(code?: string | null) {
  code = code || '';

  const validations = {
    maxLength: code.length <= 10,
    minLength: code.length >= 2,
    format: /^[A-Z0-9-_]+$/.test(code),
    whitespaces: !/\s/.test(code),
    startWithLetter: /^[A-Z]/.test(code),
  };
  const errors: string[] = [];

  if (!validations.minLength) {
    errors.push('Code must be at least 2 characters long.');
  }
  if (!validations.maxLength) {
    errors.push('Code must be at most 10 characters long.');
  }
  if (!validations.format) {
    errors.push(
      'Invalid code format. Only uppercase letters, numbers, hyphens, and underscores are allowed.',
    );
  }
  if (!validations.whitespaces) {
    errors.push('Code must not contain any whitespace characters.');
  }
  if (!validations.startWithLetter) {
    errors.push('Code must start with an uppercase letter.');
  }

  return {
    isValid: Object.values(validations).every((v) => v),
    validations,
    errors,
  };
}
