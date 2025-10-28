export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

export const isPositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  return isNotEmpty(value) ? null : `${fieldName} is required`;
};

export const validateEmail = (email: string): string | null => {
  if (!isNotEmpty(email)) {
    return 'Email is required';
  }
  if (!isValidEmail(email)) {
    return 'Invalid email format';
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!isNotEmpty(phone)) {
    return 'Phone number is required';
  }
  if (!isValidPhone(phone)) {
    return 'Invalid phone number format';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!isNotEmpty(password)) {
    return 'Password is required';
  }
  if (!isValidPassword(password)) {
    return 'Password must be at least 6 characters';
  }
  return null;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export const validatePrice = (price: number, fieldName: string = 'Price'): string | null => {
  if (isNaN(price)) {
    return `${fieldName} must be a number`;
  }
  if (!isPositiveNumber(price)) {
    return `${fieldName} must be greater than 0`;
  }
  return null;
};

export const validateForm = (
  fields: Record<string, string | number>,
  rules: Record<string, (value: any) => string | null>
): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.entries(fields).forEach(([fieldName, value]) => {
    const validator = rules[fieldName];
    if (validator) {
      const error = validator(value);
      if (error) {
        errors[fieldName] = error;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
