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
    type: string;
    level: string;
  } | string | null;
  schoolId?: number | null;
  avatarUrl?: string | null;
  arrivalDate?: string | null;
  departureDate?: string | null;
}

type UserUpdateData = Partial<Omit<User, 'id' | 'email' | 'role' | 'school'>> & {
  school?: string | null; // Para edición de perfil solo permitimos string
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (data: UserUpdateData) => void;
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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser);
        if (!onlyAdmins || parsed.role === 'admin') {
          setUser(parsed);
        } else {
          console.warn('Sesión de usuario no admin eliminada (modo solo admins activo)');
          localStorage.removeItem('user');
        }
      } catch (e) {
        console.error('Error parseando usuario almacenado, limpiando.', e);
        localStorage.removeItem('user');
      }
    }
    
    // Usar un pequeño retraso para permitir que el estado se estabilice en producción
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  const login = (userData: User) => {
    if (onlyAdmins && userData.role !== 'admin') {
      console.warn('Intento de login bloqueado por modo solo admins.');
      return;
    }
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    logAction('login', userData.email);
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

  const updateUser = (data: UserUpdateData) => {
    setUser(prevUser => {
      if (!prevUser) return null;

      // Si se está actualizando la escuela con un string, mantenerlo como string
      // En el futuro podríamos convertirlo a objeto si es necesario
      const updatedData: any = { ...data };

      const updatedUser = { ...prevUser, ...updatedData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
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
