/**
 * Utilidades centralizadas para validación de formularios
 */

import { FormErrors, ValidationError } from '@/types/api.types';

// ===== Validadores Básicos =====

export const validators = {
  /**
   * Valida que un campo no esté vacío
   */
  required: (value: string | undefined | null, fieldName: string): ValidationError | null => {
    if (!value || value.trim() === '') {
      return { field: fieldName, message: `${fieldName} es obligatorio` };
    }
    return null;
  },

  /**
   * Valida formato de email
   */
  email: (value: string, fieldName: string = 'Email'): ValidationError | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { field: fieldName.toLowerCase(), message: 'El formato del email es inválido' };
    }
    return null;
  },

  /**
   * Valida longitud mínima
   */
  minLength: (value: string, min: number, fieldName: string): ValidationError | null => {
    if (value.length < min) {
      return {
        field: fieldName.toLowerCase(),
        message: `${fieldName} debe tener al menos ${min} caracteres`,
      };
    }
    return null;
  },

  /**
   * Valida longitud máxima
   */
  maxLength: (value: string, max: number, fieldName: string): ValidationError | null => {
    if (value.length > max) {
      return {
        field: fieldName.toLowerCase(),
        message: `${fieldName} no puede exceder ${max} caracteres`,
      };
    }
    return null;
  },

  /**
   * Valida que dos valores coincidan
   */
  match: (value1: string, value2: string, fieldName: string): ValidationError | null => {
    if (value1 !== value2) {
      return { field: fieldName.toLowerCase(), message: `${fieldName} no coincide` };
    }
    return null;
  },

  /**
   * Valida número positivo
   */
  positiveNumber: (value: number | string, fieldName: string): ValidationError | null => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num <= 0) {
      return { field: fieldName.toLowerCase(), message: `${fieldName} debe ser un número positivo` };
    }
    return null;
  },

  /**
   * Valida rango numérico
   */
  numberRange: (
    value: number | string,
    min: number,
    max: number,
    fieldName: string
  ): ValidationError | null => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num < min || num > max) {
      return {
        field: fieldName.toLowerCase(),
        message: `${fieldName} debe estar entre ${min} y ${max}`,
      };
    }
    return null;
  },
};

// ===== Validadores de Formularios Comunes =====

export interface LoginFormData extends Record<string, unknown> {
  email: string;
  password: string;
}

export const validateLoginForm = (data: LoginFormData): FormErrors => {
  const errors: FormErrors = {};

  const emailError = validators.required(data.email, 'Email') || validators.email(data.email);
  if (emailError) errors[emailError.field] = emailError.message;

  const passwordError = validators.required(data.password, 'Contraseña');
  if (passwordError) errors[passwordError.field] = passwordError.message;

  return errors;
};

export interface RegisterFormData extends Record<string, unknown> {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: string | number;
  schoolId?: number | null;
  residence?: string;
  arrivalDate?: string;
  departureDate?: string;
  country?: string;
  city?: string;
  town?: string;
  adminCode?: string;
  isAdmin?: boolean;
}

export const validateRegisterForm = (data: RegisterFormData, isAdminRegistration = false): FormErrors => {
  const errors: FormErrors = {};

  // Email
  const emailError = validators.required(data.email, 'Email') || validators.email(data.email);
  if (emailError) errors[emailError.field] = emailError.message;

  // Nombre
  const firstNameError = validators.required(data.firstName, 'Nombre');
  if (firstNameError) errors.firstName = firstNameError.message;

  // Apellido
  const lastNameError = validators.required(data.lastName, 'Apellido');
  if (lastNameError) errors.lastName = lastNameError.message;

  // Password
  const passwordError =
    validators.required(data.password, 'Contraseña') ||
    validators.minLength(data.password, 8, 'Contraseña');
  if (passwordError) errors.password = passwordError.message;

  // Age (obligatorio)
  const ageError = validators.required(String(data.age), 'Edad');
  if (ageError) {
    errors.age = ageError.message;
  } else {
    const ageValue = typeof data.age === 'string' ? parseInt(data.age, 10) : data.age;
    const ageRangeError = validators.numberRange(ageValue, 1, 120, 'Edad');
    if (ageRangeError) errors.age = ageRangeError.message;
  }

  // School - solo requerida si NO es admin
  if (!isAdminRegistration && !data.schoolId) {
    errors.school = 'La escuela es obligatoria.';
  }

  // Fechas - solo requeridas si NO es admin
  if (!isAdminRegistration) {
    const arrivalError = validators.required(data.arrivalDate || '', 'Fecha de llegada');
    if (arrivalError) errors.arrivalDate = arrivalError.message;

    const departureError = validators.required(data.departureDate || '', 'Fecha de salida');
    if (departureError) errors.departureDate = departureError.message;
  }

  return errors;
};

export interface PasswordResetFormData extends Record<string, unknown> {
  password: string;
  confirmPassword: string;
}

export const validatePasswordResetForm = (data: PasswordResetFormData): FormErrors => {
  const errors: FormErrors = {};

  const passwordError =
    validators.required(data.password, 'Contraseña') ||
    validators.minLength(data.password, 6, 'Contraseña');
  if (passwordError) errors.password = passwordError.message;

  const confirmPasswordError =
    validators.required(data.confirmPassword, 'Confirmar contraseña') ||
    validators.match(data.password, data.confirmPassword, 'Contraseña');
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError.message;

  return errors;
};

// ===== Utilidad para convertir ValidationError[] a FormErrors =====

export const convertValidationErrors = (errors: ValidationError[]): FormErrors => {
  return errors.reduce((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {} as FormErrors);
};

// ===== Validador genérico =====

export type ValidatorFn = (value: unknown) => ValidationError | null;

export const validate = (
  data: Record<string, unknown>,
  rules: Record<string, ValidatorFn[]>
): FormErrors => {
  const errors: FormErrors = {};

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = data[field];

    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[error.field] = error.message;
        break; // Solo mostrar el primer error por campo
      }
    }
  });

  return errors;
};
