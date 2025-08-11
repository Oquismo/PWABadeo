'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { TaskData, carouselTasks as defaultTasks } from '@/data/tasks';
import { barrioDeTasks } from '@/data/barrioTasks';
import { useAuth } from './AuthContext';

interface TasksContextType {
  tasks: TaskData[];               // Tareas visibles para el usuario actual
  addTask: (task: Omit<TaskData, 'id'> & { id?: string; role?: TaskData['role'] }) => void;
  updateTask: (id: string, task: Partial<TaskData>) => void;
  deleteTask: (id: string) => void;
  resetToDefault: () => void;
  loadBarrioTasks: () => void;
  loadMixedTasks: () => void;
  canManageAdminTasks: boolean;    // Permiso para editar tareas role=admin
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
  const [allTasks, setAllTasks] = useState<TaskData[]>(defaultTasksWithId);

  // Cargar tareas del localStorage al inicializar
  useEffect(() => {
  const savedTasks = localStorage.getItem('userTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
    setAllTasks(parsedTasks);
      } catch (error) {
        console.error('Error al cargar tareas guardadas:', error);
      }
    }
  }, []);

  // Guardar tareas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('userTasks', JSON.stringify(allTasks));
  }, [allTasks]);

  const canManageAdminTasks = user?.role === 'admin';

  // Ahora todas las tareas son visibles; el rol solo controla quién puede CREAR/EDITAR/ELIMINAR tareas de rol 'admin'
  const tasks = allTasks;

  const addTask = (taskData: Omit<TaskData, 'id'> & { id?: string; role?: TaskData['role'] }) => {
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
    setAllTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<TaskData>) => {
    setAllTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      // Bloquear cambios a tareas admin por usuarios normales
      if ((task.role || 'user') === 'admin' && !canManageAdminTasks) {
        console.warn('Intento no autorizado de editar tarea admin');
        return task;
      }
      // Evitar que un usuario escale role al editar
      if (updates.role && updates.role === 'admin' && !canManageAdminTasks) {
        console.warn('Intento no autorizado de cambiar role de tarea a admin');
        const { role, ...rest } = updates as any;
        return { ...task, ...rest };
      }
      return { ...task, ...updates };
    }));
  };

  const deleteTask = (id: string) => {
    setAllTasks(prev => prev.filter(task => {
      if (task.id !== id) return true;
      if ((task.role || 'user') === 'admin' && !canManageAdminTasks) {
        console.warn('Intento no autorizado de eliminar tarea admin');
        return true; // no eliminar
      }
      return false;
    }));
  };

  const resetToDefault = () => {
    const resetTasks = defaultTasks.map(task => ({
      ...task,
      id: generateId()
    }));
    setAllTasks(resetTasks);
  };

  const loadBarrioTasks = () => {
    const tasksWithId = barrioDeTasks.map(task => ({
      ...task,
      id: generateId()
    }));
    setAllTasks(tasksWithId);
  };

  const loadMixedTasks = () => {
    // Combinar algunas tareas originales con las del barrio
    const mixed = [
      ...defaultTasks.slice(0, 3),
      ...barrioDeTasks.slice(0, 5)
    ].map(task => ({
      ...task,
      id: generateId()
    }));
    setAllTasks(mixed);
  };

  return (
    <TasksContext.Provider
      value={{
  tasks,
        addTask,
        updateTask,
        deleteTask,
        resetToDefault,
        loadBarrioTasks,
  loadMixedTasks,
  canManageAdminTasks
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
