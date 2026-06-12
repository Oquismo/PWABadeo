export interface TaskData {
  id?: string;
  title: string;
  description: string;
  progress: number;
  color: string;
  avatars: string[];
  date?: string;
  status?: 'completado' | 'proceso' | 'pendiente';
  role?: 'admin' | 'user';
  comun?: boolean;
  schools?: Array<{ id: number; name: string; city: string; type: string; level: string }>;
  user?: { id: number; firstName: string; lastName: string; email: string };
}

export const carouselTasks: TaskData[] = [];

export const carouselConfig = {
  title: 'Proyectos Activos',
  cardWidth: '260px',
  cardHeight: '160px',
  gap: 1.5,
  borderRadius: '16px',
};
