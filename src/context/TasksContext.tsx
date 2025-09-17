'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskData, carouselTasks as defaultTasks } from '@/data/tasks';
import { barrioDeTasks } from '@/data/barrioTasks';
import { useAuth } from './AuthContext';
import loggerClient from '@/lib/loggerClient';

interface TasksContextType {
  tasks: TaskData[];               // Tareas visibles para el usuario actual (filtradas por escuela)
  allTasks: TaskData[];            // Todas las tareas (para admins)
  addTask: (task: Omit<TaskData, 'id'> & { id?: string; role?: TaskData['role']; comun?: boolean; schoolIds?: number[] }) => Promise<TaskData | null>;
  updateTask: (id: string, task: Partial<TaskData>) => Promise<TaskData | null>;
  deleteTask: (id: string) => Promise<boolean>;
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
      // Sentinel: schoolId === -1 means explicitly "NINGUNA" -> no mostrar tareas
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

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();

      if (res.ok) {
        // Normalizar forma de las tareas: asegurar id como string y avatars como array
        const norm = (data.tasks || []).map((t: any) => ({
          ...t,
          id: typeof t.id === 'undefined' ? generateId() : String(t.id),
          avatars: Array.isArray(t.avatars) ? t.avatars : (t.avatars ? t.avatars : [])
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

  const addTask = async (taskData: Omit<TaskData, 'id'> & { id?: string; role?: TaskData['role']; comun?: boolean; schoolIds?: number[] }): Promise<TaskData | null> => {
    const role: TaskData['role'] = taskData.role || 'user';
    // Prevent non-admin users from creating admin tasks
    if (role === 'admin' && !canManageAdminTasks) {
      loggerClient.warn('Intento no autorizado de crear tarea admin');
      return null;
    }

    const payload = {
      ...taskData,
      role,
      userId: user?.id,
      // Non-admin users cannot create 'comun' tasks
      comun: user && user.role !== 'admin' ? false : (taskData.comun || false),
      // If the user is not admin, force schoolIds to their own school (or empty)
      schoolIds: user && user.role !== 'admin' ? (user.schoolId ? [user.schoolId] : []) : (taskData.schoolIds || [])
    };

    try {
      setLoading(true);
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const d = await res.json();
      if (!res.ok) {
        loggerClient.error('Error creando tarea', d);
        setError(d?.error || 'Error creando tarea');
        return null;
      }

      // Normalizar el task retornado por el servidor y refrescar estado desde servidor para evitar inconsistencias
      const created: TaskData = {
        ...d.task,
        id: typeof d.task.id === 'undefined' ? generateId() : String(d.task.id),
        avatars: Array.isArray(d.task.avatars) ? d.task.avatars : (d.task.avatars ? d.task.avatars : [])
      };

  // Insertar localmente y luego forzar recarga para garantizar consistencia con filtros/escuela
  setAllTasks(prev => [created, ...prev]);
  setError(null);
  // Refrescar para asegurar que la vista del usuario muestre el estado real del servidor
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
      // Si el id no es numérico (p.ej. id generado localmente), realizar sólo update local
      const numericId = typeof id === 'string' ? parseInt(id, 10) : (id as any);
      if (typeof numericId === 'number' && isNaN(numericId)) {
        // ID local -- actualizar sólo en memoria
        setAllTasks(prev => prev.map(t => (
          String(t.id) === String(id) ? { ...t, ...updates } : t
        )));
        setError(null);
  setLoading(false);
        // devolver la tarea actualizada desde el estado local
        const local = (allTasks || []).find(t => String(t.id) === String(id));
        return local ? { ...local, ...updates } : null;
      }

      // Ownership check: non-admin users can only update their own tasks
      if (user && user.role !== 'admin') {
        const existing = allTasks.find(t => String(t.id) === String(id));
        if (existing && existing.user && Number(existing.user.id) !== Number(user.id)) {
          loggerClient.warn('Usuario no autorizado para actualizar tarea ajena');
          setError('No autorizado');
          setLoading(false);
          return null;
        }
      }

      // Prevent non-admins from changing role to 'admin'
      if ((updates as any).role === 'admin' && !canManageAdminTasks) {
        loggerClient.warn('Intento no autorizado de elevar role a admin');
        return null;
      }

      // Prepare payload for PUT: remove schoolIds as this needs separate API handling
      const updatesCopy: any = { ...updates };
      const schoolIds = Array.isArray((updatesCopy as any).schoolIds) ? (updatesCopy as any).schoolIds as number[] : undefined;
      const makeCommon = typeof (updatesCopy as any).comun !== 'undefined' ? (updatesCopy as any).comun as boolean : undefined;
      delete updatesCopy.schoolIds;

      // If the user is not admin, ensure they cannot assign arbitrary schoolIds
      if (user && user.role !== 'admin' && Array.isArray(schoolIds)) {
        const allowed = user.schoolId ? [user.schoolId] : [];
        // Intersect requested schoolIds with allowed list
        const filtered = schoolIds.filter(s => allowed.includes(s));
        // If none allowed, force to user's school if present
        (updatesCopy as any)._forcedSchoolIdsForClient = filtered.length ? filtered : (allowed.length ? allowed : []);
      }

      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: typeof id === 'string' ? parseInt(id, 10) : id, updates: updatesCopy, userId: user?.id }),
        credentials: 'include'
      });
      const d = await res.json();
      if (!res.ok) {
        loggerClient.error('Error actualizando tarea', d);
        setError(d?.error || 'Error actualizando tarea');
        return null;
      }
      const updatedTask = { ...d.task, id: String(d.task.id), avatars: Array.isArray(d.task.avatars) ? d.task.avatars : (d.task.avatars ? d.task.avatars : []) };
  setAllTasks(prev => prev.map(t => (String(t.id) === String(updatedTask.id) ? updatedTask : t)));
      setError(null);
      // If schoolIds were provided, call assign-schools endpoint to assign them
      try {
        if (schoolIds && schoolIds.length > 0) {
          // If user is not admin, ensure schoolIds are filtered server-side; here we also filter conservatively
          const filteredSchoolIds = user && user.role !== 'admin' ? (user.schoolId ? schoolIds.filter(s => s === user.schoolId) : []) : schoolIds;
          if (filteredSchoolIds.length > 0) {
            await fetch('/api/tasks/assign-schools', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ taskId: parseInt(String(updatedTask.id), 10), schoolIds: filteredSchoolIds, userId: user?.id, action: 'assign' }),
              credentials: 'include'
            });
          }
        }
        // If comun flag is set true, call unassign to make the task common
        if (typeof makeCommon !== 'undefined' && makeCommon === true) {
          await fetch('/api/tasks/assign-schools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId: parseInt(String(updatedTask.id), 10), schoolIds: [], userId: user?.id, action: 'unassign' }),
            credentials: 'include'
          });
        }
      } catch (e) {
        // swallow; fetchTasks below will resync
      }

      // mantener sincronía con servidor
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
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    try {
      setLoading(true);
      // Ownership check: non-admin users can only delete their own tasks
      if (user && user.role !== 'admin') {
        const existing = allTasks.find(t => String(t.id) === String(id));
        if (existing && existing.user && Number(existing.user.id) !== Number(user.id)) {
          loggerClient.warn('Usuario no autorizado para eliminar tarea ajena');
          setError('No autorizado');
          setLoading(false);
          return false;
        }
      }
      const res = await fetch(`/api/tasks?id=${numericId}&userId=${user?.id}`, {
        method: 'DELETE',
        credentials: 'include'
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
