import React, { useState, useEffect } from 'react';
import { useTasks } from '@/context/TasksContext';
import { useAuth } from '@/context/AuthContext';

interface School {
  id: number;
  name: string;
  city: string;
  type: string;
  level: string;
  country: string;
}

const SchoolSelector: React.FC = () => {
  const { currentSchoolId, setCurrentSchoolId, refreshTasks } = useTasks();
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schools');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSchools(data.schools);
      } else {
        setError('Error cargando escuelas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolChange = (schoolId: number | null) => {
    setCurrentSchoolId(schoolId);
    refreshTasks();
  };

  // Si el usuario no es admin, no mostrar el selector (se filtra automáticamente por su escuela)
  if (user?.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Cargando escuelas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">
        Filtrar por escuela:
      </label>
      <select
        value={currentSchoolId || ''}
        onChange={(e) => handleSchoolChange(e.target.value ? parseInt(e.target.value) : null)}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Todas las escuelas</option>
        {schools.map((school) => (
          <option key={school.id} value={school.id}>
            {school.name} - {school.city} ({school.type})
          </option>
        ))}
      </select>
      
      {currentSchoolId && (
        <button
          onClick={() => handleSchoolChange(null)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Limpiar filtro
        </button>
      )}
    </div>
  );
};

export default SchoolSelector;
