'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: 'admin' | 'user' | 'USER' | 'ADMIN';
  age?: number | null;
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
    console.error("Error al guardar el log:", error);
  }
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const onlyAdmins = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ONLY_ADMIN_LOGIN === 'true';

  useEffect(() => {
    console.log('🔄 AuthContext: Inicializando...');
    const storedUser = localStorage.getItem('user');
    console.log('📦 AuthContext: Usuario en localStorage:', storedUser ? 'Existe' : 'No existe');

    async function fetchUserFromBackend(email: string) {
      try {
        const response = await fetch('/api/user/by-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        if (response.ok) {
          const { user } = await response.json();
          if (user) {
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            console.log('✅ AuthContext: Usuario actualizado desde backend:', user);
          }
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (e) {
        setUser(null);
        localStorage.removeItem('user');
        console.error('❌ AuthContext: Error actualizando usuario desde backend:', e);
      }
    }

    const init = async () => {
      if (storedUser) {
        try {
          const parsed: User = JSON.parse(storedUser);
          console.log('👤 AuthContext: Usuario parseado:', {
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
          console.error('❌ AuthContext: Error parseando usuario almacenado, limpiando.', e);
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
      console.log('✅ AuthContext: Carga completada');
    };
    init();
  }, []);

  const login = async (userData: User) => {
    console.log('🔐 AuthContext: Login iniciado para:', userData.email);
    console.log('👤 AuthContext: Datos completos de usuario:', userData);
    if (userData.school) {
      console.log('🏫 AuthContext: userData.school:', userData.school, 'typeof:', typeof userData.school);
    } else {
      console.log('🏫 AuthContext: userData.school está vacío:', userData.school);
    }
    
    if (onlyAdmins && userData.role !== 'admin') {
      console.warn('⚠️ AuthContext: Intento de login bloqueado por modo solo admins.');
      return;
    }
    // Guardar datos iniciales
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    logAction('login', userData.email);
    // Refrescar inmediatamente desde backend para asegurar datos completos
    try {
      const response = await fetch('/api/user/by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email })
      });
      if (response.ok) {
        const { user } = await response.json();
        if (user) {
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          console.log('✅ AuthContext: Usuario actualizado tras login desde backend:', user);
        }
      }
    } catch (e) {
      console.error('❌ AuthContext: Error refrescando usuario tras login:', e);
    }
    console.log('✅ AuthContext: Login completado exitosamente');
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
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = async (data: UserUpdateData) => {
    if (!user) return;

    try {
      // Llamar al API para actualizar en el servidor
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...data
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar usuario');
      }

      const result = await response.json();

      // Actualizar el estado local
      setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });

    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  };

  const updateAvatar = useCallback(async (avatarUrl: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, avatarUrl })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar avatar');
      }

      const data = await response.json();

      // Actualizar el usuario local con el nuevo avatar
      setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, avatarUrl: data.avatarUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });

    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  }, [user]);

  const deleteAvatar = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/avatar?userId=${user.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar avatar');
      }

      // Actualizar el usuario local removiendo el avatar
      setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, avatarUrl: null };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });

    } catch (error) {
      console.error('Error deleting avatar:', error);
      throw error;
    }
  }, [user]);

  const refreshAvatar = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/avatar?userId=${user.id}`);

      if (!response.ok) {
        throw new Error('Error al obtener avatar');
      }

      const data = await response.json();

      // Actualizar el usuario local con el avatar del servidor
      setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, avatarUrl: data.avatarUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });

    } catch (error) {
      console.error('Error refreshing avatar:', error);
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
