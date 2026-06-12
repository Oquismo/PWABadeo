'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskData } from '@/data/tasks';
import { useAuth } from './AuthContext';
import loggerClient from '@/lib/loggerClient';

interface TasksContextType {
  tasks: TaskData[];
  allTasks: TaskData[];
  addTask: (task: any) => Promise<TaskData | null>;
  updateTask: (id: string, task: Partial<TaskData>) => Promise<TaskData | null>;
  deleteTask: (id: string) => Promise<boolean>;
  resetToDefault: () => void;
  loadBarrioTasks: () => void;
  loadMixedTasks: () => void;
  canManageAdminTasks: boolean;
  currentSchoolId: number | null;
  setCurrentSchoolId: (schoolId: number | null) => void;
  refreshTasks: (schoolId?: number | null) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

interface TasksProviderProps {
  children: ReactNode;
}

export function TasksProvider({ children }: TasksProviderProps) {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<TaskData[]>([]);
  const [currentSchoolId, setCurrentSchoolId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async (schoolId?: number | null) => {
    setLoading(true);
    try {
      if (typeof schoolId !== 'undefined' && schoolId === -1) {
        setAllTasks([]);
        setError(null);
        setLoading(false);
        return;
      }

      let url = '/api/tasks';
      const params = new URLSearchParams();
      if (user?.id) params.append('userId', user.id.toString());
      if (typeof schoolId !== 'undefined' && schoolId !== null) params.append('schoolId', String(schoolId));
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();

      if (res.ok) {
        const norm = (data.tasks || []).map((t: any) => ({
          ...t,
          id: typeof t.id === 'undefined' ? generateId() : String(t.id),
          avatars: Array.isArray(t.avatars) ? t.avatars : [],
        }));
        setAllTasks(norm);
        setError(null);
      } else {
        setError(data.error || 'Error cargando tareas');
        setAllTasks([]);
      }
    } catch (e: any) {
      loggerClient.error('Error fetching tasks:', e);
      setError(e.message || 'Error de red');
      setAllTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.schoolId && currentSchoolId === null) {
      setCurrentSchoolId(user.schoolId);
    }
    fetchTasks(currentSchoolId || user?.schoolId);
  }, [user?.id, user?.schoolId, currentSchoolId]);

  const canManageAdminTasks = user?.role === 'admin';

  const tasks = canManageAdminTasks ? allTasks : allTasks.filter(task => {
    if (!currentSchoolId && !user?.schoolId) return task.comun === true;
    const userSchoolId = currentSchoolId || user?.schoolId;
    return task.comun === true || (task.schools && task.schools.some((s: any) => s.id === userSchoolId));
  });

  const refreshTasks = (schoolId?: number | null) => {
    fetchTasks(typeof schoolId !== 'undefined' ? schoolId : (currentSchoolId || user?.schoolId));
  };

  const addTask = async (taskData: any): Promise<TaskData | null> => {
    const role = taskData.role || 'user';
    if (role === 'admin' && !canManageAdminTasks) return null;

    const payload = {
      ...taskData,
      role,
      userId: user?.id,
      comun: user && user.role !== 'admin' ? false : (taskData.comun || false),
      schoolIds: user && user.role !== 'admin' ? (user.schoolId ? [user.schoolId] : []) : (taskData.schoolIds || []),
    };

    try {
      setLoading(true);
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const d = await res.json();
      if (!res.ok) {
        loggerClient.error('Error creando tarea', d);
        setError(d?.error || 'Error creando tarea');
        return null;
      }
      const created: TaskData = {
        ...d.task,
        id: typeof d.task.id === 'undefined' ? generateId() : String(d.task.id),
        avatars: Array.isArray(d.task.avatars) ? d.task.avatars : [],
      };
      setAllTasks(prev => [created, ...prev]);
      setError(null);
      await fetchTasks(currentSchoolId || user?.schoolId);
      return created;
    } catch (e: any) {
      loggerClient.error('Error de red creando tarea', e);
      setError(e?.message || 'Error de red');
    } finally {
      setLoading(false);
    }
    return null;
  };

  const updateTask = async (id: string, updates: Partial<TaskData>): Promise<TaskData | null> => {
    try {
      setLoading(true);
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        setAllTasks(prev => prev.map(t => (String(t.id) === String(id) ? { ...t, ...updates } : t)));
        setError(null);
        setLoading(false);
        const local = (allTasks || []).find(t => String(t.id) === String(id));
        return local ? { ...local, ...updates } : null;
      }

      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: numericId, updates, userId: user?.id }),
        credentials: 'include',
      });
      const d = await res.json();
      if (!res.ok) {
        loggerClient.error('Error actualizando tarea', d);
        setError(d?.error || 'Error actualizando tarea');
        return null;
      }
      const updatedTask = { ...d.task, id: String(d.task.id), avatars: Array.isArray(d.task.avatars) ? d.task.avatars : [] };
      setAllTasks(prev => prev.map(t => (String(t.id) === String(updatedTask.id) ? updatedTask : t)));
      setError(null);
      await fetchTasks(currentSchoolId || user?.schoolId);
      return updatedTask;
    } catch (e: any) {
      loggerClient.error('Error de red actualizando tarea', e);
      setError(e?.message || 'Error de red');
    } finally {
      setLoading(false);
    }
    return null;
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    const numericId = parseInt(id, 10);
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks?id=${isNaN(numericId) ? id : numericId}&userId=${user?.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const d = await res.json();
      if (!res.ok) {
        loggerClient.error('Error eliminando tarea', d);
        setError(d?.error || 'Error eliminando tarea');
        return false;
      }
      setAllTasks(prev => prev.filter(t => String(t.id) !== String(numericId)));
      setError(null);
      await fetchTasks(currentSchoolId || user?.schoolId);
      return true;
    } catch (e: any) {
      loggerClient.error('Error de red eliminando tarea', e);
      setError(e?.message || 'Error de red');
    } finally {
      setLoading(false);
    }
    return false;
  };

  const resetToDefault = () => {
    (async () => {
      try {
        const res = await fetch('/api/tasks', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) setAllTasks(data.tasks || []);
      } catch {}
    })();
  };

  const loadBarrioTasks = () => {
    (async () => {
      try {
        const res = await fetch('/api/tasks?role=user', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) setAllTasks(data.tasks || []);
      } catch {}
    })();
  };

  const loadMixedTasks = () => {
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
        tasks, allTasks, addTask, updateTask, deleteTask,
        resetToDefault, loadBarrioTasks, loadMixedTasks,
        canManageAdminTasks, currentSchoolId, setCurrentSchoolId, refreshTasks,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}
