import React, { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  color: string;
  comun: boolean;
  schools: School[];
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface School {
  id: number;
  name: string;
  city: string;
  type: string;
  level: string;
  country: string;
}

interface TaskSchoolAssignmentManagerProps {
  userId: number;
}

const TaskSchoolAssignmentManager: React.FC<TaskSchoolAssignmentManagerProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSchools, setSelectedSchools] = useState<number[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, schoolsResponse] = await Promise.all([
        fetch(`/api/tasks?userId=${userId}`),
        fetch(`/api/schools`)
      ]);

      const tasksData = await tasksResponse.json();
      const schoolsData = await schoolsResponse.json();

      if (tasksResponse.ok && schoolsResponse.ok) {
        setTasks(tasksData.tasks || []);
        setSchools(schoolsData.schools || []);
      } else {
        setError('Error cargando datos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = (task: Task) => {
    setSelectedTask(task);
    setSelectedSchools(task.schools.map(s => s.id));
    setShowAssignModal(true);
  };

  const handleAssignToSchools = async () => {
    if (!selectedTask) return;

    try {
      const response = await fetch('/api/tasks/assign-schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: selectedTask.id,
          schoolIds: selectedSchools,
          userId,
          action: 'assign'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar la task en el estado local
        setTasks(tasks.map(t => 
          t.id === selectedTask.id ? data.task : t
        ));
        setShowAssignModal(false);
        setSelectedTask(null);
        setSelectedSchools([]);
        setError('');
      } else {
        setError(data.error || 'Error asignando task a escuelas');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleMakeCommon = async (task: Task) => {
    if (!confirm('¿Hacer esta task común para todas las escuelas? Se desasignará de escuelas específicas.')) {
      return;
    }

    try {
      const response = await fetch('/api/tasks/assign-schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task.id,
          userId,
          action: 'unassign'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTasks(tasks.map(t => 
          t.id === task.id ? data.task : t
        ));
        setError('');
      } else {
        setError(data.error || 'Error haciendo task común');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleSchoolChange = (schoolId: number, checked: boolean) => {
    if (checked) {
      setSelectedSchools([...selectedSchools, schoolId]);
    } else {
      setSelectedSchools(selectedSchools.filter(id => id !== schoolId));
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Cargando tasks y escuelas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Asignación de Tasks a Escuelas</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay tasks disponibles.
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {task.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Estado:</span>
                      {task.comun ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Común para todas las escuelas
                        </span>
                      ) : task.schools.length > 0 ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          Asignada a {task.schools.length} escuela(s)
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                          Sin asignar
                        </span>
                      )}
                    </div>

                    {task.schools.length > 0 && !task.comun && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Escuelas asignadas:</span>
                        <ul className="list-disc list-inside ml-4 mt-1">
                          {task.schools.map(school => (
                            <li key={school.id}>
                              {school.name} - {school.city} ({school.type})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleOpenAssignModal(task)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    title="Asignar a escuelas específicas"
                  >
                    Asignar Escuelas
                  </button>
                  {!task.comun && (
                    <button
                      onClick={() => handleMakeCommon(task)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      title="Hacer común para todas las escuelas"
                    >
                      Hacer Común
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de asignación */}
      {showAssignModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Asignar &quot;{selectedTask.title}&quot; a escuelas
            </h3>
            
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {schools.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay escuelas disponibles.</p>
              ) : (
                schools.map(school => (
                  <label key={school.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedSchools.includes(school.id)}
                      onChange={(e) => handleSchoolChange(school.id, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      <strong>{school.name}</strong> - {school.city} ({school.type}, {school.level})
                    </span>
                  </label>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAssignToSchools}
                disabled={selectedSchools.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex-1"
              >
                Asignar ({selectedSchools.length} escuelas)
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedTask(null);
                  setSelectedSchools([]);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSchoolAssignmentManager;
