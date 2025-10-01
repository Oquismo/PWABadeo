/**
 * AuthContext refactorizado - Versión mejorada con mejor separación de responsabilidades
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import telemetry from '@/lib/telemetry';
import loggerClient from '@/lib/loggerClient';
import { UserBase, UserUpdateData, UserStorageData } from '@/types/api.types';
import { LocalStorage, saveUserToStorage, getUserFromStorage, logUserAction } from '@/utils/storage.utils';
import { apiClient } from '@/utils/api-client.utils';

// ===== Types =====

export type User = UserBase;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => Promise<void>;
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

// ===== AuthProvider Component =====

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const onlyAdmins =
    typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ONLY_ADMIN_LOGIN === 'true';

  // ===== Initialization =====

  useEffect(() => {
    const initializeAuth = async () => {
      loggerClient.debug('🔄 AuthContext: Inicializando...');

      const storedUser = getUserFromStorage();

      if (storedUser) {
        loggerClient.debug('📦 Usuario encontrado en localStorage:', storedUser.email);

        // Refrescar datos desde backend
        const refreshedUser = await fetchUserFromBackend(storedUser.email);

        if (refreshedUser) {
          setUser(refreshedUser);
          saveUserToStorage(userToStorageData(refreshedUser));
          loggerClient.info('✅ Usuario actualizado desde backend');
        } else {
          // Si falla, limpiar
          setUser(null);
          LocalStorage.remove('user');
          loggerClient.warn('⚠️ No se pudo refrescar usuario, limpiando localStorage');
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
  }, []);

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
    async (userData: User) => {
      loggerClient.debug('🔐 Login iniciado para:', userData.email);

      // Verificar restricción de solo admins
      if (onlyAdmins && userData.role !== 'admin') {
        loggerClient.warn('⚠️ Intento de login bloqueado (modo solo admins)');
        throw new Error('Acceso solo permitido para administradores');
      }

      // Guardar usuario inicial
      setUser(userData);
      saveUserToStorage(userToStorageData(userData));

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
          saveUserToStorage(userToStorageData(refreshedUser));

          if (refreshedUser.id) {
            LocalStorage.set('userId', refreshedUser.id.toString());
          }

          loggerClient.info('✅ Usuario actualizado tras login');
        }
      } catch (error) {
        loggerClient.error('Error refrescando usuario tras login:', error);
      }

      loggerClient.info('✅ Login completado exitosamente');
    },
    [onlyAdmins]
  );

  // ===== Logout =====

  const logout = useCallback(() => {
    const currentUser = user;

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
    LocalStorage.remove('user');
    LocalStorage.remove('userId');

    loggerClient.info('✅ Logout completado');
  }, [user]);

  // ===== Update User =====

  const updateUser = useCallback(
    async (data: UserUpdateData) => {
      if (!user) return;

      try {
        // No enviar 'residence' al backend (solo en caché local)
        const { residence, ...serverData } = data as UserUpdateData & { residence?: string };

        // Actualizar en el servidor
        const response = await apiClient.put('/api/user/update', {
          userId: user.id,
          ...serverData,
        });

        if (!response.success) {
          loggerClient.warn('Advertencia: falló actualización en servidor');
        }

        // Actualizar localmente siempre (incluir residence)
        setUser((prevUser) => {
          if (!prevUser) return null;
          const updatedUser = { ...prevUser, ...data } as User;
          saveUserToStorage(userToStorageData(updatedUser));
          return updatedUser;
        });

        loggerClient.info('✅ Usuario actualizado');
      } catch (error) {
        loggerClient.error('Error actualizando usuario:', error);
        throw error;
      }
    },
    [user]
  );

  // ===== Update Avatar =====

  const updateAvatar = useCallback(
    async (avatarUrl: string) => {
      if (!user) return;

      try {
        const response = await apiClient.post<{ avatarUrl: string }>('/api/avatar', {
          userId: user.id,
          avatarUrl,
        });

        if (!response.success) {
          throw new Error('Error al actualizar avatar');
        }

        setUser((prevUser) => {
          if (!prevUser) return null;
          const updatedUser = { ...prevUser, avatarUrl: response.data?.avatarUrl };
          saveUserToStorage(userToStorageData(updatedUser));
          return updatedUser;
        });

        loggerClient.info('✅ Avatar actualizado');
      } catch (error) {
        loggerClient.error('Error actualizando avatar:', error);
        throw error;
      }
    },
    [user]
  );

  // ===== Delete Avatar =====

  const deleteAvatar = useCallback(async () => {
    if (!user) return;

    try {
      const response = await apiClient.delete(`/api/avatar?userId=${user.id}`);

      if (!response.success) {
        throw new Error('Error al eliminar avatar');
      }

      setUser((prevUser) => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, avatarUrl: null };
        saveUserToStorage(userToStorageData(updatedUser));
        return updatedUser;
      });

      loggerClient.info('✅ Avatar eliminado');
    } catch (error) {
      loggerClient.error('Error eliminando avatar:', error);
      throw error;
    }
  }, [user]);

  // ===== Refresh Avatar =====

  const refreshAvatar = useCallback(async () => {
    if (!user) return;

    try {
      const response = await apiClient.get<{ avatarUrl: string }>(
        `/api/avatar?userId=${user.id}`
      );

      if (!response.success) {
        throw new Error('Error al obtener avatar');
      }

      setUser((prevUser) => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, avatarUrl: response.data?.avatarUrl };
        saveUserToStorage(userToStorageData(updatedUser));
        return updatedUser;
      });

      loggerClient.info('✅ Avatar refrescado');
    } catch (error) {
      loggerClient.error('Error refrescando avatar:', error);
      throw error;
    }
  }, [user]);

  // ===== Refresh User =====

  const refreshUser = useCallback(async () => {
    if (!user) return;

    try {
      const refreshedUser = await fetchUserFromBackend(user.email);

      if (refreshedUser) {
        setUser(refreshedUser);
        saveUserToStorage(userToStorageData(refreshedUser));
        loggerClient.info('✅ Usuario refrescado');
      }
    } catch (error) {
      loggerClient.error('Error refrescando usuario:', error);
    }
  }, [user]);

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
