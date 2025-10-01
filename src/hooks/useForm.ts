/**
 * Hook personalizado para gestionar formularios con validación
 */

import { useState, useCallback, ChangeEvent } from 'react';
import { FormErrors } from '@/types/api.types';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => FormErrors;
  onSubmit: (values: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setFieldValue: (field: keyof T, value: unknown) => void;
  setFieldError: (field: string, error: string) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: FormErrors) => void;
  resetForm: () => void;
  clearErrors: () => void;
}

/**
 * Hook para gestionar formularios con validación integrada
 */
export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Actualiza un campo del formulario
   */
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setValuesState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    // Limpiar error del campo al escribir
    setErrorsState((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  /**
   * Establece el valor de un campo específico
   */
  const setFieldValue = useCallback((field: keyof T, value: unknown) => {
    setValuesState((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo
    setErrorsState((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  /**
   * Establece un error en un campo específico
   */
  const setFieldError = useCallback((field: string, error: string) => {
    setErrorsState((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  /**
   * Actualiza múltiples valores
   */
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  /**
   * Establece múltiples errores
   */
  const setErrors = useCallback((newErrors: FormErrors) => {
    setErrorsState(newErrors);
  }, []);

  /**
   * Limpia todos los errores
   */
  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  /**
   * Resetea el formulario a sus valores iniciales
   */
  const resetForm = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Maneja el submit del formulario
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Validar si existe función de validación
      if (validate) {
        const validationErrors = validate(values);

        if (Object.keys(validationErrors).length > 0) {
          setErrorsState(validationErrors);
          return;
        }
      }

      // Limpiar errores previos
      setErrorsState({});
      setIsSubmitting(true);

      try {
        await onSubmit(values);
      } catch (error) {
        // Los errores del submit deberían manejarse en la función onSubmit
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    isSubmitting,
    isValid,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setValues,
    setErrors,
    resetForm,
    clearErrors,
  };
}

/**
 * Hook simplificado para inputs controlados
 */
export function useInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return {
    value,
    onChange: handleChange,
    reset,
    setValue,
  };
}

/**
 * Hook para manejar toggle (checkbox, switch)
 */
export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue,
  };
}

/**
 * Hook para validación async (ej: verificar si email existe)
 */
export function useAsyncValidation<T>(
  validateFn: (value: T) => Promise<string | null>,
  debounceMs: number = 500
) {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(
    async (value: T) => {
      setIsValidating(true);
      setError(null);

      // Debounce
      await new Promise((resolve) => setTimeout(resolve, debounceMs));

      try {
        const validationError = await validateFn(value);
        setError(validationError);
        return validationError;
      } catch (err) {
        const errorMsg = 'Error de validación';
        setError(errorMsg);
        return errorMsg;
      } finally {
        setIsValidating(false);
      }
    },
    [validateFn, debounceMs]
  );

  return {
    validate,
    isValidating,
    error,
  };
}
