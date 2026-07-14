/**
 * AuthContext refactorizado - Versión mejorada con mejor separación de responsabilidades
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import telemetry from '@/lib/telemetry';
import loggerClient from '@/lib/loggerClient';
import { UserBase, UserUpdateData, UserStorageData } from '@/types/api.types';
import { LocalStorage, SessionStorage, saveUserToStorage, getUserFromStorage, saveUserToSessionStorage, getUserFromSessionStorage, removeUserFromAllStorages, saveUserToActiveStorage, logUserAction } from '@/utils/storage.utils';
import { apiClient } from '@/utils/api-client.utils';

// ===== Types =====

export type User = UserBase;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, remember?: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (data: UserUpdateData) => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  deleteAvatar: () => Promise<void>;
  refreshAvatar: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== Helper Functions =====

/**
 * Convierte un User a UserStorageData seguro para localStorage
 */
function userToStorageData(user: User | null): UserStorageData | null {
  if (!user) return null;

  const schoolId =
    typeof user.school === 'object' && user.school?.id
      ? user.school.id
      : user.schoolId ?? null;

  const name =
    user.name ||
    `${user.firstName ?? ''}${user.lastName ? ' ' + user.lastName : ''}`.trim() ||
    undefined;

  // No almacenar avatares en base64
  const avatarUrl =
    user.avatarUrl && !user.avatarUrl.startsWith('data:') ? user.avatarUrl : null;

  return {
    id: user.id,
    name,
    email: user.email,
    role: user.role,
    schoolId,
    avatarUrl,
    country: user.country ?? null,
    residence: user.residence ?? null,
    city: user.city ?? null,
    town: user.town ?? null,
  };
}

/**
 * Obtiene usuario desde el backend
 */
async function fetchUserFromBackend(email: string): Promise<User | null> {
  try {
    const response = await apiClient.post<{ user: User }>('/api/user/by-email', { email });

    if (!response.success || !response.data?.user) {
      return null;
    }

    let user = response.data.user;

    // Preservar residence del localStorage si el backend no la devuelve
    const storedUser = getUserFromStorage();
    if (storedUser?.residence && !user.residence) {
      user = { ...user, residence: storedUser.residence };
    }

    return user;
  } catch (error) {
    loggerClient.error('Error fetching user from backend:', error);
    return null;
  }
}

// ===== Token Refresh =====

/**
 * Refresca el auth-token llamando al endpoint /api/auth/refresh
 * Las cookies http-only se actualizan automáticamente con la respuesta
 */
async function refreshAuthToken(): Promise<boolean> {
  try {
    const response = await apiClient.post('/api/auth/refresh');
    if (response.success) {
      loggerClient.debug('✅ Token refrescado exitosamente');
      return true;
    }
    loggerClient.warn('⚠️ Refresh token falló:', response.error);
    return false;
  } catch (error) {
    loggerClient.error('Error refreshing auth token:', error);
    return false;
  }
}

// ===== AuthProvider Component =====

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef(user);
  userRef.current = user;
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const onlyAdmins =
    typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ONLY_ADMIN_LOGIN === 'true';

  // ===== Iniciar refresh periódico =====

  const startTokenRefresh = useCallback(() => {
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    // Refrescar cada 10 minutos (el token dura 15)
    refreshIntervalRef.current = setInterval(async () => {
      if (!userRef.current) return;
      const ok = await refreshAuthToken();
      if (!ok) {
        loggerClient.warn('⚠️ Falló refresh periódico de token');
      }
    }, 10 * 60 * 1000);
  }, []);

  const stopTokenRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // ===== Initialization =====

  useEffect(() => {
    const initializeAuth = async () => {
      loggerClient.debug('🔄 AuthContext: Inicializando...');

      // 1. Buscar en localStorage (sesión recordada)
      let storedUser = getUserFromStorage();
      let isRemembered = !!storedUser;

      // 2. Si no hay en localStorage, buscar en sessionStorage (sesión temporal)
      if (!storedUser) {
        storedUser = getUserFromSessionStorage();
      }

      if (storedUser) {
        loggerClient.debug(`📦 Usuario encontrado en ${isRemembered ? 'localStorage' : 'sessionStorage'}:`, storedUser.email);

        // Refrescar datos desde backend
        const refreshedUser = await fetchUserFromBackend(storedUser.email);

        if (refreshedUser) {
          setUser(refreshedUser);
          if (isRemembered) {
            saveUserToStorage(userToStorageData(refreshedUser));
          } else {
            saveUserToSessionStorage(userToStorageData(refreshedUser));
          }
          loggerClient.info('✅ Usuario actualizado desde backend');
        } else if (isRemembered) {
          setUser(storedUser as unknown as User);
          loggerClient.warn('⚠️ No se pudo refrescar usuario recordado - manteniendo sesión');
        } else {
          setUser(null);
          removeUserFromAllStorages();
          loggerClient.warn('⚠️ No se pudo refrescar usuario temporal, limpiando sesión');
        }

        // Refrescar token de autenticación para que el middleware no nos redirija
        if (refreshedUser || isRemembered) {
          const tokenOk = await refreshAuthToken();
          if (tokenOk) {
            loggerClient.info('✅ Token de sesión renovado en inicialización');
            startTokenRefresh();
          } else if (!isRemembered) {
            // Sesión temporal sin refresh → limpiar
            setUser(null);
            removeUserFromAllStorages();
            loggerClient.warn('⚠️ No se pudo renovar token, limpiando sesión temporal');
          }
        }
      }

      setIsLoading(false);
      loggerClient.info('✅ AuthContext: Inicialización completada');

      // Inicializar telemetría
      try {
        const currentUser = getUserFromStorage();
        telemetry.initTelemetry({
          userEmail: currentUser?.email ?? null,
          endpoint: '/api/telemetry',
        });
      } catch (error) {
        loggerClient.error('Error inicializando telemetría:', error);
      }
    };

    initializeAuth();

    return () => stopTokenRefresh();
  }, [startTokenRefresh, stopTokenRefresh]);

  // ===== Refresh token al volver a la app (mobile) =====

  useEffect(() => {
    if (!user || isLoading) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshAuthToken().then((ok) => {
          if (ok) loggerClient.debug('✅ Token refrescado al volver a la app');
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, isLoading]);

  useEffect(() => {
    if (!user || isLoading) return;
    const loaded = sessionStorage.getItem('avatarLoaded');
    if (loaded) return;
    refreshAvatar().catch(() => {});
    sessionStorage.setItem('avatarLoaded', 'true');
  }, [user?.id, isLoading]);

  // ===== Google Review Prompt =====

  useEffect(() => {
    if (typeof window === 'undefined' || !user) return;

    // Guardar fecha de registro si no existe
    if (!LocalStorage.has('userRegisteredAt')) {
      LocalStorage.set('userRegisteredAt', new Date().toISOString());
    }

    // Verificar si han pasado 2 días
    const registeredAt = LocalStorage.get<string>('userRegisteredAt');
    if (registeredAt) {
      const now = new Date();
      const regDate = new Date(registeredAt);
      const diffDays = (now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays >= 2 && !LocalStorage.has('reviewPrompted')) {
        window.dispatchEvent(new CustomEvent('showGoogleReviewPrompt'));
        LocalStorage.set('reviewPrompted', 'true');
      }
    }
  }, [user]);

  // ===== Login =====

  const login = useCallback(
    async (userData: User, remember: boolean = true) => {
      loggerClient.debug('🔐 Login iniciado para:', userData.email, '| recordar:', remember);

      // Verificar restricción de solo admins
      if (onlyAdmins && userData.role !== 'admin') {
        loggerClient.warn('⚠️ Intento de login bloqueado (modo solo admins)');
        throw new Error('Acceso solo permitido para administradores');
      }

      // Guardar usuario inicial en el storage correspondiente
      setUser(userData);
      const storageData = userToStorageData(userData);
      if (remember) {
        saveUserToStorage(storageData);
      } else {
        saveUserToSessionStorage(storageData);
      }

      if (userData.id) {
        LocalStorage.set('userId', userData.id.toString());
      }

      // Log de acción
      logUserAction('login', userData.email);
      try {
        telemetry.sendTelemetryEvent('login', { email: userData.email });
      } catch (e) {
        // Ignore telemetry errors
      }

      // Refrescar datos desde backend
      try {
        const refreshedUser = await fetchUserFromBackend(userData.email);

        if (refreshedUser) {
          // Preservar residence si vino del registro
          if (!refreshedUser.residence && userData.residence) {
            refreshedUser.residence = userData.residence;
          }

          setUser(refreshedUser);
          const refreshedStorageData = userToStorageData(refreshedUser);
          if (remember) {
            saveUserToStorage(refreshedStorageData);
          } else {
            saveUserToSessionStorage(refreshedStorageData);
          }

          if (refreshedUser.id) {
            LocalStorage.set('userId', refreshedUser.id.toString());
          }

          loggerClient.info('✅ Usuario actualizado tras login');
        }
      } catch (error) {
        loggerClient.error('Error refrescando usuario tras login:', error);
      }

      // Refrescar token tras login exitoso
      try {
        const tokenOk = await refreshAuthToken();
        if (tokenOk) {
          loggerClient.info('✅ Token renovado tras login');
          startTokenRefresh();
        }
      } catch (e) {
        loggerClient.error('Error refrescando token tras login:', e);
      }

      loggerClient.info('✅ Login completado exitosamente');
    },
    [onlyAdmins, startTokenRefresh]
  );

  // ===== Logout =====

  const logout = useCallback(() => {
    const currentUser = user;

    // Detener refresh periódico
    stopTokenRefresh();

    if (currentUser) {
      logUserAction('logout', currentUser.email);

      // Notificar al backend (best-effort)
      apiClient
        .post('/api/auth/logout', { userId: currentUser.id })
        .catch(() => {});

      try {
        telemetry.sendTelemetryEvent('logout', { email: currentUser.email });
      } catch (e) {
        // Ignore telemetry errors
      }
    }

    setUser(null);
    removeUserFromAllStorages();

    loggerClient.info('✅ Logout completado');
  }, [user, stopTokenRefresh]);

  // ===== Update User =====

  const updateUser = useCallback(
    async (data: UserUpdateData) => {
      const currentUser = userRef.current;
      if (!currentUser) return;

      try {
        const response = await apiClient.put<{ user: User }>('/api/user/update', {
          fields: data,
          userId: currentUser.id,
        });

        if (response.success) {
          setUser((prevUser) => {
            if (!prevUser) return null;
            const updatedUser = { ...prevUser, ...response.data?.user };
            saveUserToActiveStorage(userToStorageData(updatedUser));
            return updatedUser;
          });

          loggerClient.info('✅ Usuario actualizado');
        } else {
          throw new Error(response.error || 'Error al actualizar usuario');
        }
      } catch (error) {
        loggerClient.error('Error actualizando usuario:', error);
        throw error;
      }
    },
    []
  );

  // ===== Update Avatar =====

  const updateAvatar = useCallback(
    async (avatarUrl: string) => {
      const currentUser = userRef.current;
      if (!currentUser) return;

      try {
        const response = await apiClient.post<{ avatarUrl: string }>('/api/avatar', {
          userId: currentUser.id,
          avatarUrl,
        });

        if (!response.success) {
          throw new Error('Error al actualizar avatar');
        }

        setUser((prevUser) => {
          if (!prevUser) return null;
          const updatedUser = { ...prevUser, avatarUrl: response.data?.avatarUrl };
          saveUserToActiveStorage(userToStorageData(updatedUser));
          return updatedUser;
        });

        loggerClient.info('✅ Avatar actualizado');
      } catch (error) {
        loggerClient.error('Error actualizando avatar:', error);
        throw error;
      }
    },
    []
  );

  // ===== Delete Avatar =====

  const deleteAvatar = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser) return;

    try {
      const response = await apiClient.delete(`/api/avatar?userId=${currentUser.id}`);

      if (!response.success) {
        throw new Error('Error al eliminar avatar');
      }

      setUser((prevUser) => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, avatarUrl: null };
        saveUserToActiveStorage(userToStorageData(updatedUser));
        return updatedUser;
      });

      loggerClient.info('✅ Avatar eliminado');
    } catch (error) {
      loggerClient.error('Error eliminando avatar:', error);
      throw error;
    }
  }, []);

  // ===== Refresh Avatar =====

  const refreshAvatar = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser) return;

    try {
      const response = await apiClient.get<{ avatarUrl: string }>(
        `/api/avatar?userId=${currentUser.id}`
      );

      if (!response.success) {
        throw new Error('Error al obtener avatar');
      }

      setUser((prevUser) => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, avatarUrl: response.data?.avatarUrl };
        saveUserToActiveStorage(userToStorageData(updatedUser));
        return updatedUser;
      });

      loggerClient.info('✅ Avatar refrescado');
    } catch (error) {
      loggerClient.error('Error refrescando avatar:', error);
      throw error;
    }
  }, []);

  // ===== Refresh User =====

  const refreshUser = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser) return;

    try {
      const refreshedUser = await fetchUserFromBackend(currentUser.email);

      if (refreshedUser) {
        setUser(refreshedUser);
        saveUserToActiveStorage(userToStorageData(refreshedUser));
        loggerClient.info('✅ Usuario refrescado');
      }
    } catch (error) {
      loggerClient.error('Error refrescando usuario:', error);
    }
  }, []);

  // ===== Context Value =====

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    updateAvatar,
    deleteAvatar,
    refreshAvatar,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ===== useAuth Hook =====

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;

// ===== Global Helper (backwards compatibility) =====

if (typeof window !== 'undefined') {
  (window as any).saveUserToLocal = (u: User | null) => {
    try {
      saveUserToStorage(userToStorageData(u));
    } catch (e) {
      loggerClient.error('window.saveUserToLocal error:', e);
    }
  };
}
