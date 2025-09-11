'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskData, carouselTasks as defaultTasks } from '@/data/tasks';
import { barrioDeTasks } from '@/data/barrioTasks';
import { useAuth } from './AuthContext';

interface TasksContextType {
  tasks: TaskData[];               // Tareas visibles para el usuario actual (filtradas por escuela)
  allTasks: TaskData[];            // Todas las tareas (para admins)
  addTask: (task: Omit<TaskData, 'id'> & { id?: string; role?: TaskData['role']; comun?: boolean; schoolIds?: number[] }) => void;
  updateTask: (id: string, task: Partial<TaskData>) => void;
  deleteTask: (id: string) => void;
  resetToDefault: () => void;
  loadBarrioTasks: () => void;
  loadMixedTasks: () => void;
  canManageAdminTasks: boolean;    // Permiso para editar tareas role=admin
  currentSchoolId: number | null;  // Escuela actual del usuario
  setCurrentSchoolId: (schoolId: number | null) => void;
  refreshTasks: (schoolId?: number | null) => void;        // Refrescar tasks desde el servidor (opcionalmente con schoolId)
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

// Generar ID único
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Agregar ID a las tareas por defecto (usar las del barrio como predeterminadas)
const defaultTasksWithId = [...defaultTasks.slice(0, 3), ...barrioDeTasks.slice(0, 5)].map(task => ({
  ...task,
  id: generateId()
}));

interface TasksProviderProps {
  children: ReactNode;
}

export function TasksProvider({ children }: TasksProviderProps) {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<TaskData[]>([]);
  const [currentSchoolId, setCurrentSchoolId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar tasks desde el servidor
  const fetchTasks = async (schoolId?: number | null) => {
    setLoading(true);
    try {
      let url = '/api/tasks';
      const params = new URLSearchParams();
      
      if (user?.id) params.append('userId', user.id.toString());
      if (schoolId) params.append('schoolId', schoolId.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        const norm = (data.tasks || []).map((t: any) => ({
          ...t,
          avatars: Array.isArray(t.avatars) ? t.avatars : (t.avatars ? t.avatars : [])
        }));
        setAllTasks(norm);
        setError(null);
      } else {
        setError(data.error || 'Error cargando tareas');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar tareas al inicializar y cuando cambie el usuario o la escuela
  useEffect(() => {
    // Si el usuario tiene una escuela asignada y no hemos seleccionado una escuela manualmente
    if (user?.schoolId && currentSchoolId === null) {
      setCurrentSchoolId(user.schoolId);
    }
    fetchTasks(currentSchoolId || user?.schoolId);
  }, [user?.id, user?.schoolId, currentSchoolId]);

  const canManageAdminTasks = user?.role === 'admin';

  // Filtrar tasks según la escuela actual (si no es admin)
  const tasks = canManageAdminTasks ? allTasks : allTasks.filter(task => {
    // Si no hay escuela seleccionada, mostrar todas las tasks comunes
    if (!currentSchoolId && !user?.schoolId) {
      return task.comun === true;
    }
    // Si hay escuela seleccionada, mostrar tasks comunes + tasks de la escuela
    const userSchoolId = currentSchoolId || user?.schoolId;
    return task.comun === true || (task.schools && task.schools.some((s: any) => s.id === userSchoolId));
  });

  const refreshTasks = (schoolId?: number | null) => {
    // Permite forzar la recarga con un schoolId proporcionado (útil desde selectores)
    fetchTasks(typeof schoolId !== 'undefined' ? schoolId : (currentSchoolId || user?.schoolId));
  };

  const addTask = (taskData: Omit<TaskData, 'id'> & { id?: string; role?: TaskData['role']; comun?: boolean; schoolIds?: number[] }) => {
    const role: TaskData['role'] = taskData.role || 'user';
    if (role === 'admin' && !canManageAdminTasks) {
      console.warn('Intento no autorizado de crear tarea admin');
      return;
    }
    const newTask: TaskData = {
      ...taskData,
      role,
      id: taskData.id || generateId()
    };
    // Persistir
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...newTask, 
        userId: user?.id,
        comun: taskData.comun || false,
        schoolIds: taskData.schoolIds || []
      }),
      credentials: 'include'
    }).then(async r => {
      if (!r.ok) {
        const d = await r.json();
        console.error('Error creando tarea', d);
        return;
      }
      const d = await r.json();
      setAllTasks(prev => [
        {
          ...d.task,
          avatars: Array.isArray(d.task.avatars) ? d.task.avatars : (d.task.avatars ? d.task.avatars : [])
        },
        ...prev
      ]);
    });
  };

  const updateTask = (id: string, updates: Partial<TaskData>) => {
    fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: typeof id === 'string' ? parseInt(id, 10) : id, updates, userId: user?.id }),
      credentials: 'include'
    }).then(async r => {
      const d = await r.json();
      if (!r.ok) {
        console.error('Error actualizando tarea', d);
        return;
      }
      setAllTasks(prev => prev.map(t => (
        t.id === d.task.id
          ? { ...d.task, avatars: Array.isArray(d.task.avatars) ? d.task.avatars : (d.task.avatars ? d.task.avatars : []) }
          : t
      )));
    });
  };

  const deleteTask = (id: string) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    fetch(`/api/tasks?id=${numericId}&userId=${user?.id}`, { 
      method: 'DELETE',
      credentials: 'include'
    })
      .then(async r => {
        const d = await r.json();
        if (!r.ok) {
          console.error('Error eliminando tarea', d);
          return;
        }
        setAllTasks(prev => prev.filter(t => {
          const tid = typeof t.id === 'string' ? parseInt(t.id, 10) : t.id;
            return tid !== numericId;
        }));
      });
  };

  const resetToDefault = () => {
    // No tiene sentido en persistente: podría recargar desde API
    // Dejamos stub que vuelve a cargar
    (async () => {
      try {
        const res = await fetch('/api/tasks', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) setAllTasks(data.tasks || []);
      } catch {}
    })();
  };

  const loadBarrioTasks = () => {
    // Carga selectiva: filtrar role user (placeholder)
    (async () => {
      try {
        const res = await fetch('/api/tasks?role=user', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) setAllTasks(data.tasks || []);
      } catch {}
    })();
  };

  const loadMixedTasks = () => {
    // Combinar algunas tareas originales con las del barrio
    // Mezcla simulada (por ahora recarga todo)
    (async () => {
      try {
        const res = await fetch('/api/tasks', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) setAllTasks(data.tasks || []);
      } catch {}
    })();
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        allTasks,
        addTask,
        updateTask,
        deleteTask,
        resetToDefault,
        loadBarrioTasks,
        loadMixedTasks,
        canManageAdminTasks,
        currentSchoolId,
        setCurrentSchoolId,
        refreshTasks
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks debe ser usado dentro de un TasksProvider');
  }
  return context;
}
