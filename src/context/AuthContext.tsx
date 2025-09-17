'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import telemetry from '@/lib/telemetry';
import loggerClient from '@/lib/loggerClient';

export interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: 'admin' | 'user' | 'USER' | 'ADMIN';
  age?: number | null;
  residence?: string | null;
  school?: {
    id: number;
    name: string;
    city?: string;
    country?: string;
    town?: string;
    type: string;
    level: string;
  } | string | null;
  schoolId?: number | null;
  avatarUrl?: string | null;
  arrivalDate?: string | null;
  departureDate?: string | null;
  // Campos de ubicación del usuario
  country?: string | null;
  city?: string | null;
  town?: string | null;
}

type UserUpdateData = Partial<Omit<User, 'id' | 'email' | 'role' | 'school'>> & {
  school?: string | null; // Para edición de perfil solo permitimos string
  country?: string | null;
  city?: string | null;
  town?: string | null;
};

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Top-level helpers so they can be reused outside the provider (and exposed to window)
const getSafeUserForStorageTop = (u: User | null) => {
  if (!u) return null;
  const schoolId = typeof u.school === 'object' && (u.school as any)?.id ? (u.school as any).id : (u.schoolId ?? null);
  const name = (u.name ?? (`${u.firstName ?? ''}${u.lastName ? ' ' + u.lastName : ''}`.trim())) || undefined;
  const avatarUrl = u.avatarUrl && typeof u.avatarUrl === 'string' && !u.avatarUrl.startsWith('data:') ? u.avatarUrl : null;
  return {
    id: u.id,
    name,
    email: u.email,
    role: u.role,
    schoolId,
    avatarUrl,
    country: u.country ?? null,
    residence: u.residence ?? null,
    city: u.city ?? null,
    town: u.town ?? null
  } as any;
};

const saveUserToLocalTop = (u: User | null) => {
  try {
    const safe = getSafeUserForStorageTop(u);
    if (safe) localStorage.setItem('user', JSON.stringify(safe));
    else localStorage.removeItem('user');
  } catch (e) {
    loggerClient.error('Error guardando user en localStorage (saveUserToLocalTop):', e);
  }
};
// --- NUEVA FUNCIÓN PARA REGISTRAR ACCIONES ---
const logAction = (action: string, userEmail: string) => {
  try {
    const logsRaw = localStorage.getItem('appLogs');
    const logs = logsRaw ? JSON.parse(logsRaw) : [];
    const newLog = {
      action,
      userEmail,
      timestamp: new Date().toISOString(),
    };
    // Añadimos el nuevo registro al principio y limitamos a 100 entradas
    const updatedLogs = [newLog, ...logs].slice(0, 100);
    localStorage.setItem('appLogs', JSON.stringify(updatedLogs));
  } catch (error) {
    loggerClient.error("Error al guardar el log:", error);
  }
};


export function AuthProvider({ children }: { children: ReactNode }) {
  // Guardar sólo una versión compacta del usuario en localStorage para evitar QuotaExceeded
  const getSafeUserForStorage = (u: User | null) => {
    if (!u) return null;
    const schoolId = typeof u.school === 'object' && (u.school as any)?.id ? (u.school as any).id : (u.schoolId ?? null);
  const name = (u.name ?? (`${u.firstName ?? ''}${u.lastName ? ' ' + u.lastName : ''}`.trim())) || undefined;
    // No almacenar avatares en base64 (data:), sólo URLs
    const avatarUrl = u.avatarUrl && typeof u.avatarUrl === 'string' && !u.avatarUrl.startsWith('data:') ? u.avatarUrl : null;
    return {
      id: u.id,
      name,
      email: u.email,
      role: u.role,
      schoolId,
      avatarUrl,
      country: u.country ?? null,
      residence: u.residence ?? null,
      city: u.city ?? null,
      town: u.town ?? null
    } as any;
  };

  const saveUserToLocal = (u: User | null) => {
    try {
      const safe = getSafeUserForStorage(u);
      if (safe) {
  localStorage.setItem('user', JSON.stringify(safe));
      } else {
        localStorage.removeItem('user');
      }
    } catch (e) {
      loggerClient.error('Error guardando user en localStorage (saveUserToLocal):', e);
    }
  };
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const onlyAdmins = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ONLY_ADMIN_LOGIN === 'true';


  // ...
  // Declaraciones de useState
  // ...

  // Notificación de reseña Google
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedUserRaw = localStorage.getItem('user');
    if (!storedUserRaw) return;
    // Guardar fecha de registro si no existe
    if (!localStorage.getItem('userRegisteredAt')) {
      localStorage.setItem('userRegisteredAt', new Date().toISOString());
    }
    // Verificar si han pasado 2 días
    const registeredAt = localStorage.getItem('userRegisteredAt');
    if (registeredAt) {
      const now = new Date();
      const regDate = new Date(registeredAt);
      const diffDays = (now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays >= 2 && !localStorage.getItem('reviewPrompted')) {
        // Lanzar evento personalizado para mostrar notificación
        window.dispatchEvent(new CustomEvent('showGoogleReviewPrompt'));
        localStorage.setItem('reviewPrompted', 'true');
      }
    }
  }, [user]);

  useEffect(() => {
    loggerClient.debug('🔄 AuthContext: Inicializando...');
    const storedUser = localStorage.getItem('user');
    loggerClient.debug('📦 AuthContext: Usuario en localStorage:', storedUser ? 'Existe' : 'No existe');

    async function fetchUserFromBackend(email: string) {
      try {
        const response = await fetch('/api/user/by-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
          credentials: 'include'
        });
        if (response.ok) {
          const { user } = await response.json();
            if (user) {
            // Si localStorage guarda una residencia (cliente-only), preservarla si el backend no la devuelve
            try {
              const storedRaw = localStorage.getItem('user');
              if (storedRaw) {
                const parsedStored = JSON.parse(storedRaw) as any;
                if (parsedStored?.residence && !user.residence) {
                  user.residence = parsedStored.residence;
                }
              }
            } catch (e) {
                    // ignore JSON parse errors
            }
            setUser(user);
            // Use safe storage helper to avoid storing large base64 avatars
            saveUserToLocal(user);
                  loggerClient.info('✅ AuthContext: Usuario actualizado desde backend:', user);
          }
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (e) {
        setUser(null);
        localStorage.removeItem('user');
        loggerClient.error('❌ AuthContext: Error actualizando usuario desde backend:', e);
      }
    }

    const init = async () => {
      if (storedUser) {
        try {
          const parsed: User = JSON.parse(storedUser);
          loggerClient.debug('👤 AuthContext: Usuario parseado:', {
            id: parsed.id,
            email: parsed.email,
            role: parsed.role,
            country: parsed.country,
            city: parsed.city,
            town: parsed.town
          });
          // Siempre refrescar desde backend para cualquier usuario (admin o no)
          await fetchUserFromBackend(parsed.email);
        } catch (e) {
          loggerClient.error('❌ AuthContext: Error parseando usuario almacenado, limpiando.', e);
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
      loggerClient.info('✅ AuthContext: Carga completada');
      // Inicializar telemetría con el usuario si existe
      try {
        const parsedUserRaw = localStorage.getItem('user');
        const parsedUser = parsedUserRaw ? JSON.parse(parsedUserRaw) : null;
        telemetry.initTelemetry({ userEmail: parsedUser?.email ?? null, endpoint: '/api/telemetry' });
      } catch (e) {
        loggerClient.error('Error inicializando telemetría:', e);
      }
    };
    init();
  }, []);

  const login = async (userData: User) => {
    loggerClient.debug('🔐 AuthContext: Login iniciado para:', userData.email);
    loggerClient.debug('👤 AuthContext: Datos completos de usuario:', userData);
    if (userData.school) {
      loggerClient.debug('🏫 AuthContext: userData.school:', userData.school, 'typeof:', typeof userData.school);
    } else {
      loggerClient.debug('🏫 AuthContext: userData.school está vacío:', userData.school);
    }
    
    if (onlyAdmins && userData.role !== 'admin') {
      loggerClient.warn('⚠️ AuthContext: Intento de login bloqueado por modo solo admins.');
      return;
    }
  // Guardar datos iniciales (safe)
  saveUserToLocal(userData);
    if (userData.id) {
      loggerClient.debug('🔍 AuthContext: Guardando userId en localStorage:', userData.id);
      localStorage.setItem('userId', userData.id.toString());
      loggerClient.info('✅ AuthContext: userId guardado:', localStorage.getItem('userId'));
    } else {
      loggerClient.error('❌ AuthContext: userData.id no está presente:', userData);
    }
    setUser(userData);
    logAction('login', userData.email);
  try { telemetry.sendTelemetryEvent('login', { email: userData.email }); } catch (e) {}
    // Refrescar inmediatamente desde backend para asegurar datos completos
    try {
      const response = await fetch('/api/user/by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email }),
        credentials: 'include'
      });
      if (response.ok) {
        const { user } = await response.json();
        if (user) {
          // Si el backend no incluye residence (modo cliente-only), conservar la que vino en userData
          if (!user.residence && (userData as any).residence) {
            (user as any).residence = (userData as any).residence;
          }
          setUser(user);
          saveUserToLocal(user);
          if (user.id) {
            loggerClient.debug('🔍 AuthContext: Actualizando userId tras refresco:', user.id);
            localStorage.setItem('userId', user.id.toString());
            loggerClient.info('✅ AuthContext: userId actualizado:', localStorage.getItem('userId'));
          }
          loggerClient.info('✅ AuthContext: Usuario actualizado tras login desde backend:', user);
        }
      }
    } catch (e) {
      loggerClient.error('❌ AuthContext: Error refrescando usuario tras login:', e);
    }
    loggerClient.info('✅ AuthContext: Login completado exitosamente');
  };

  const logout = () => {
    const currentUser = user;
    if (currentUser) {
      logAction('logout', currentUser.email); // Registramos el cierre de sesión
      // Llamada best-effort al backend para registrar logout en DB
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      }).catch(() => {});
    }
    try { telemetry.sendTelemetryEvent('logout', { email: currentUser?.email ?? null }); } catch (e) {}
  // ensure safe remove
  saveUserToLocal(null);
    setUser(null);
  };

  const updateUser = async (data: UserUpdateData) => {
    if (!user) return;

    try {
      // No enviamos 'residence' al backend; lo guardamos sólo en caché local
      const { residence: residenceToCache, ...serverData } = data as any;

      // Llamada al servidor con los campos permitidos (sin residence)
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...serverData }),
        credentials: 'include'
      });

      if (!response.ok) {
        // Si falla el backend, igualmente aplicamos el cambio en caché para que el usuario pueda modificar su residencia localmente
        loggerClient.warn('Warning: falló la actualización en servidor, aplicando cambios en caché localmente');
      }

      // Actualizar el estado local siempre, incluyendo residence en caché
      setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, ...data } as User;
        saveUserToLocal(updatedUser as User);
        return updatedUser;
      });

    } catch (error) {
      loggerClient.error('Error actualizando usuario:', error);
      throw error;
    }
  };

  const updateAvatar = useCallback(async (avatarUrl: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, avatarUrl }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al actualizar avatar');
      }

      const data = await response.json();

      // Actualizar el usuario local con el nuevo avatar
      setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, avatarUrl: data.avatarUrl };
        saveUserToLocal(updatedUser as User);
        return updatedUser;
      });

    } catch (error) {
      loggerClient.error('Error updating avatar:', error);
      throw error;
    }
  }, [user]);

  const deleteAvatar = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/avatar?userId=${user.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar avatar');
      }

      // Actualizar el usuario local removiendo el avatar
      setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, avatarUrl: null };
        saveUserToLocal(updatedUser as User);
        return updatedUser;
      });

    } catch (error) {
      loggerClient.error('Error deleting avatar:', error);
      throw error;
    }
  }, [user]);

  const refreshAvatar = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/avatar?userId=${user.id}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al obtener avatar');
      }

      const data = await response.json();

      // Actualizar el usuario local con el avatar del servidor
      setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, avatarUrl: data.avatarUrl };
        saveUserToLocal(updatedUser as User);
        return updatedUser;
      });

    } catch (error) {
      loggerClient.error('Error refreshing avatar:', error);
      throw error;
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser,
      updateAvatar,
      deleteAvatar,
      refreshAvatar
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export default for compatibility
export default useAuth;

// Expose helper globally as a fallback for simple pages/scripts
try {
  if (typeof window !== 'undefined') {
    (window as any).saveUserToLocal = (u: User | null) => {
      try {
        const safe = getSafeUserForStorageTop(u);
        if (safe) localStorage.setItem('user', JSON.stringify(safe));
        else localStorage.removeItem('user');
      } catch (e) {
        loggerClient.error('window.saveUserToLocal error:', e);
      }
    };
  }
} catch (e) {
  // ignore in SSR
}
