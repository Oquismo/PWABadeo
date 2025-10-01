/**
 * Utilidades para manejo seguro de localStorage con tipos
 */

import loggerClient from '@/lib/loggerClient';

export class StorageError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Clase para gestionar localStorage de forma type-safe
 */
export class LocalStorage {
  /**
   * Obtiene un valor del localStorage y lo parsea
   */
  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      if (typeof window === 'undefined') return defaultValue ?? null;

      const item = localStorage.getItem(key);
      if (item === null) return defaultValue ?? null;

      return JSON.parse(item) as T;
    } catch (error) {
      loggerClient.error(`Error al leer de localStorage (key: ${key}):`, error);
      return defaultValue ?? null;
    }
  }

  /**
   * Guarda un valor en localStorage serializándolo a JSON
   */
  static set<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined') return false;

      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      // Manejar QuotaExceededError
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        loggerClient.error(`LocalStorage quota exceeded al guardar key: ${key}`);
        // Intentar limpiar datos antiguos
        this.clearOldData();
      } else {
        loggerClient.error(`Error al guardar en localStorage (key: ${key}):`, error);
      }
      return false;
    }
  }

  /**
   * Elimina un elemento del localStorage
   */
  static remove(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;

      localStorage.removeItem(key);
      return true;
    } catch (error) {
      loggerClient.error(`Error al eliminar de localStorage (key: ${key}):`, error);
      return false;
    }
  }

  /**
   * Verifica si existe una clave en localStorage
   */
  static has(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      return localStorage.getItem(key) !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Limpia todo el localStorage
   */
  static clear(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.clear();
      return true;
    } catch (error) {
      loggerClient.error('Error al limpiar localStorage:', error);
      return false;
    }
  }

  /**
   * Limpia datos antiguos o grandes del localStorage
   */
  private static clearOldData(): void {
    try {
      // Eliminar datos de telemetría antiguos
      const keysToClean = ['telemetryQueue', 'telemetryEvents', 'appLogs'];
      keysToClean.forEach((key) => this.remove(key));

      loggerClient.info('LocalStorage limpiado para liberar espacio');
    } catch (error) {
      loggerClient.error('Error al limpiar datos antiguos:', error);
    }
  }

  /**
   * Obtiene el tamaño aproximado usado en localStorage
   */
  static getUsage(): { used: number; total: number; percentage: number } {
    try {
      if (typeof window === 'undefined') {
        return { used: 0, total: 0, percentage: 0 };
      }

      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Límite típico de localStorage es 5-10 MB
      const total = 5 * 1024 * 1024; // 5 MB en bytes
      const percentage = (used / total) * 100;

      return { used, total, percentage };
    } catch (error) {
      return { used: 0, total: 0, percentage: 0 };
    }
  }

  /**
   * Guarda un valor con expiración
   */
  static setWithExpiry<T>(key: string, value: T, expiryMs: number): boolean {
    const item = {
      value,
      expiry: Date.now() + expiryMs,
    };
    return this.set(key, item);
  }

  /**
   * Obtiene un valor con expiración (null si expiró)
   */
  static getWithExpiry<T>(key: string): T | null {
    const item = this.get<{ value: T; expiry: number }>(key);

    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.remove(key);
      return null;
    }

    return item.value;
  }
}

// ===== Funciones auxiliares específicas del dominio =====

export interface UserStorageData {
  id: number;
  name?: string;
  email: string;
  role: string;
  schoolId?: number | null;
  avatarUrl?: string | null;
  country?: string | null;
  residence?: string | null;
  city?: string | null;
  town?: string | null;
}

/**
 * Guarda datos de usuario de forma segura (sin avatares base64)
 */
export const saveUserToStorage = (user: UserStorageData | null): boolean => {
  if (!user) {
    return LocalStorage.remove('user');
  }

  // No guardar avatares en base64
  const safeUser: UserStorageData = {
    ...user,
    avatarUrl:
      user.avatarUrl && !user.avatarUrl.startsWith('data:') ? user.avatarUrl : null,
  };

  return LocalStorage.set('user', safeUser);
};

/**
 * Obtiene datos de usuario desde localStorage
 */
export const getUserFromStorage = (): UserStorageData | null => {
  return LocalStorage.get<UserStorageData>('user');
};

/**
 * Guarda el idioma seleccionado
 */
export const saveLanguage = (lang: string): boolean => {
  return LocalStorage.set('language', lang);
};

/**
 * Obtiene el idioma guardado
 */
export const getLanguage = (): string | null => {
  return LocalStorage.get<string>('language', 'es');
};

/**
 * Registra una acción del usuario (con límite de logs)
 */
export const logUserAction = (action: string, userEmail: string): boolean => {
  try {
    const logs = LocalStorage.get<Array<{ action: string; userEmail: string; timestamp: string }>>(
      'appLogs',
      []
    );

    if (!logs) return false;

    const newLog = {
      action,
      userEmail,
      timestamp: new Date().toISOString(),
    };

    // Limitar a 100 entradas más recientes
    const updatedLogs = [newLog, ...logs].slice(0, 100);
    return LocalStorage.set('appLogs', updatedLogs);
  } catch (error) {
    loggerClient.error('Error al guardar log de acción:', error);
    return false;
  }
};
