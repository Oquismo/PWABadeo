'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Añadimos las nuevas propiedades para las fechas
interface User {
  name: string;
  email: string;
  age: number;
  school: string;
  avatarUrl: string;
  arrivalDate: string;
  departureDate: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Al cargar la app, revisamos si hay datos de usuario en localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: User) => {
    // Guardamos el objeto de usuario completo como un string JSON
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    // isAuthenticated ahora se calcula automáticamente si existe un usuario
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
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