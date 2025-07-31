'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  name: string;
  email: string;
  age: number;
  school: string;
  avatarUrl: string;
  arrivalDate: string;
  departureDate: string;
  role: 'admin' | 'user';
}

type UserUpdateData = Partial<Omit<User, 'email' | 'avatarUrl' | 'role'>>;

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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    logAction('login', userData.email); // Registramos el inicio de sesión
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
