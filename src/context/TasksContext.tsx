'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskData, carouselTasks as defaultTasks } from '@/data/tasks';
import { barrioDeTasks } from '@/data/barrioTasks';

interface TasksContextType {
  tasks: TaskData[];
  addTask: (task: Omit<TaskData, 'id'> & { id?: string }) => void;
  updateTask: (id: string, task: Partial<TaskData>) => void;
  deleteTask: (id: string) => void;
  resetToDefault: () => void;
  loadBarrioTasks: () => void;
  loadMixedTasks: () => void;
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
  const [tasks, setTasks] = useState<TaskData[]>(defaultTasksWithId);

  // Cargar tareas del localStorage al inicializar
  useEffect(() => {
    const savedTasks = localStorage.getItem('userTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error al cargar tareas guardadas:', error);
      }
    }
  }, []);

  // Guardar tareas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('userTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Omit<TaskData, 'id'> & { id?: string }) => {
    const newTask = {
      ...taskData,
      id: taskData.id || generateId()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<TaskData>) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const resetToDefault = () => {
    const resetTasks = defaultTasks.map(task => ({
      ...task,
      id: generateId()
    }));
    setTasks(resetTasks);
  };

  const loadBarrioTasks = () => {
    const tasksWithId = barrioDeTasks.map(task => ({
      ...task,
      id: generateId()
    }));
    setTasks(tasksWithId);
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
    setTasks(mixed);
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
        loadMixedTasks
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
