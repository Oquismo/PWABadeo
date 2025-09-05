'use client';

import { useState, useEffect } from 'react';
import TaskSchoolAssignmentManager from '@/components/admin/TaskSchoolAssignmentManager';

interface User {
  id: number;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AdminTasksSchoolsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Simular obtención del usuario actual - reemplazar con tu lógica de autenticación
    const getCurrentUser = async () => {
      try {
        // Aquí deberías obtener el usuario actual de tu sistema de autenticación
        // Por ahora, simularemos con datos de ejemplo
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.role !== 'admin') {
            setError('Acceso denegado. Solo administradores pueden acceder a esta página.');
          } else {
            setUser(userData);
          }
        } else {
          setError('Usuario no autenticado');
        }
      } catch (err) {
        setError('Error obteniendo información del usuario');
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">Error de Acceso</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Ir al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administración de Tasks por Escuelas</h1>
              <p className="text-sm text-gray-600">
                Bienvenido, {user.firstName} {user.lastName} - Asigna tasks a escuelas específicas
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/admin'}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Volver al Admin
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <TaskSchoolAssignmentManager userId={user.id} />
        </div>
      </main>
    </div>
  );
}
