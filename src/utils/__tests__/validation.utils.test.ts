import { describe, it, expect } from 'vitest';
import {
  validators,
  validateLoginForm,
  validateRegisterForm,
  validatePasswordResetForm,
  convertValidationErrors,
} from '../validation.utils';

describe('validators.required', () => {
  it('returns error for empty string', () => {
    const err = validators.required('', 'Email');
    expect(err).not.toBeNull();
    expect(err!.message).toContain('obligatorio');
  });

  it('returns error for null', () => {
    expect(validators.required(null, 'Field')).not.toBeNull();
  });

  it('returns error for undefined', () => {
    expect(validators.required(undefined, 'Field')).not.toBeNull();
  });

  it('returns error for whitespace only', () => {
    expect(validators.required('   ', 'Field')).not.toBeNull();
  });

  it('returns null for valid value', () => {
    expect(validators.required('hello', 'Field')).toBeNull();
  });
});

describe('validators.email', () => {
  it('accepts valid emails', () => {
    expect(validators.email('test@example.com')).toBeNull();
    expect(validators.email('user+tag@domain.co.uk')).toBeNull();
    expect(validators.email('a@b.cd')).toBeNull();
  });

  it('rejects invalid emails', () => {
    expect(validators.email('not-an-email')).not.toBeNull();
    expect(validators.email('@domain.com')).not.toBeNull();
    expect(validators.email('user@')).not.toBeNull();
    expect(validators.email('')).not.toBeNull();
  });
});

describe('validators.minLength', () => {
  it('rejects too short values', () => {
    expect(validators.minLength('ab', 8, 'Password')).not.toBeNull();
    expect(validators.minLength('', 1, 'Field')).not.toBeNull();
  });

  it('accepts sufficient length', () => {
    expect(validators.minLength('abcdefgh', 8, 'Password')).toBeNull();
  });
});

describe('validators.maxLength', () => {
  it('rejects too long values', () => {
    expect(validators.maxLength('a'.repeat(101), 100, 'Field')).not.toBeNull();
  });

  it('accepts within limit', () => {
    expect(validators.maxLength('a'.repeat(50), 100, 'Field')).toBeNull();
  });
});

describe('validators.match', () => {
  it('rejects non-matching values', () => {
    expect(validators.match('abc', 'xyz', 'Password')).not.toBeNull();
  });

  it('accepts matching values', () => {
    expect(validators.match('same', 'same', 'Field')).toBeNull();
  });
});

describe('validators.positiveNumber', () => {
  it('rejects zero', () => {
    expect(validators.positiveNumber(0, 'Age')).not.toBeNull();
  });

  it('rejects negative numbers', () => {
    expect(validators.positiveNumber(-5, 'Age')).not.toBeNull();
  });

  it('rejects NaN string', () => {
    expect(validators.positiveNumber('abc', 'Age')).not.toBeNull();
  });

  it('accepts positive numbers', () => {
    expect(validators.positiveNumber(25, 'Age')).toBeNull();
    expect(validators.positiveNumber('30', 'Age')).toBeNull();
  });
});

describe('validators.numberRange', () => {
  it('rejects below minimum', () => {
    expect(validators.numberRange(0, 1, 120, 'Age')).not.toBeNull();
  });

  it('rejects above maximum', () => {
    expect(validators.numberRange(200, 1, 120, 'Age')).not.toBeNull();
  });

  it('accepts within range', () => {
    expect(validators.numberRange(25, 1, 120, 'Age')).toBeNull();
  });
});

describe('validateLoginForm', () => {
  it('returns errors for empty form', () => {
    const errors = validateLoginForm({ email: '', password: '' });
    expect(errors.Email || errors.email).toBeDefined();
    expect(errors.Contraseña || errors.password).toBeDefined();
  });

  it('returns error for invalid email', () => {
    const errors = validateLoginForm({ email: 'bad', password: 'pass123' });
    expect(errors.email).toBeDefined();
  });

  it('returns empty errors for valid form', () => {
    const errors = validateLoginForm({ email: 'test@example.com', password: 'pass123' });
    expect(Object.keys(errors)).toHaveLength(0);
  });
});

describe('validateRegisterForm', () => {
  const validData = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    age: '20',
    schoolId: 1,
    arrivalDate: '2025-09-01',
    departureDate: '2026-06-30',
    country: 'Italia',
    residence: 'ONE',
  };

  it('passes with valid data for non-admin', () => {
    const errors = validateRegisterForm(validData, false);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('requires email', () => {
    const errors = validateRegisterForm({ ...validData, email: '' });
    expect(errors.Email || errors.email).toBeDefined();
  });

  it('requires password min 8 chars', () => {
    const errors = validateRegisterForm({ ...validData, password: '123' });
    expect(errors.password).toBeDefined();
  });

  it('requires first and last name', () => {
    const errors = validateRegisterForm({ ...validData, firstName: '', lastName: '' });
    expect(errors.firstName).toBeDefined();
    expect(errors.lastName).toBeDefined();
  });

  it('requires school for non-admin', () => {
    const errors = validateRegisterForm({ ...validData, schoolId: null });
    expect(errors.school).toBeDefined();
  });

  it('does not require school for admin', () => {
    const errors = validateRegisterForm({ ...validData, schoolId: null }, true);
    expect(errors.school).toBeUndefined();
  });

  it('requires dates for non-admin', () => {
    const errors = validateRegisterForm({ ...validData, arrivalDate: '', departureDate: '' });
    expect(errors.arrivalDate).toBeDefined();
    expect(errors.departureDate).toBeDefined();
  });

  it('validates age range', () => {
    const errors = validateRegisterForm({ ...validData, age: '200' });
    expect(errors.age).toBeDefined();
  });
});

describe('validatePasswordResetForm', () => {
  it('returns errors for empty form', () => {
    const errors = validatePasswordResetForm({ password: '', confirmPassword: '' });
    expect(errors.password).toBeDefined();
    expect(errors.confirmPassword).toBeDefined();
  });

  it('returns error when passwords do not match', () => {
    const errors = validatePasswordResetForm({ password: 'newpass123', confirmPassword: 'different' });
    expect(errors.confirmPassword).toBeDefined();
  });

  it('passes with matching passwords', () => {
    const errors = validatePasswordResetForm({ password: 'newpass123', confirmPassword: 'newpass123' });
    expect(Object.keys(errors)).toHaveLength(0);
  });
});

describe('convertValidationErrors', () => {
  it('converts array to object', () => {
    const result = convertValidationErrors([
      { field: 'email', message: 'Email inválido' },
      { field: 'password', message: 'Muy corta' },
    ]);
    expect(result).toEqual({ email: 'Email inválido', password: 'Muy corta' });
  });

  it('returns empty object for empty array', () => {
    expect(convertValidationErrors([])).toEqual({});
  });
});
