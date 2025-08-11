'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  age?: number | null;
  school?: string | null;
  avatarUrl?: string | null;
  arrivalDate?: string | null;
  departureDate?: string | null;
}

type UserUpdateData = Partial<Omit<User, 'id' | 'email' | 'role'>>;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (data: UserUpdateData) => void;
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
    }
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (data: UserUpdateData) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser }}>
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
