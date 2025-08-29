// Función de utilidad para migrar eventos del localStorage a la base de datos
// Solo debe ejecutarse una vez cuando el usuario inicie sesión por primera vez después de la actualización

interface LocalStorageEvent {
  id?: string;
  title: string;
  date: string;
  type: 'personal' | 'program' | 'holiday';
}

export const migrateLocalStorageEvents = async (userEmail: string, userId: number) => {
  try {
    const localStorageKey = `userCustomEvents_${userEmail}`;
    const savedEvents = localStorage.getItem(localStorageKey);
    
    if (!savedEvents) {
      return { success: true, migrated: 0 };
    }

    const events: LocalStorageEvent[] = JSON.parse(savedEvents);
    
    if (events.length === 0) {
      return { success: true, migrated: 0 };
    }

    // Migrar eventos uno por uno
    let migratedCount = 0;
    
    for (const event of events) {
      try {
        const response = await fetch('/api/user-events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId.toString()
          },
          body: JSON.stringify({
            title: event.title,
            date: event.date,
            type: event.type || 'personal'
          })
        });

        if (response.ok) {
          migratedCount++;
        }
      } catch (error) {
        console.error('Error migrando evento:', event.title, error);
      }
    }

    // Marcar como migrado para no repetir la migración
    localStorage.setItem(`${localStorageKey}_migrated`, 'true');
    
    return { success: true, migrated: migratedCount };
    
  } catch (error) {
    console.error('Error en migración de eventos:', error);
    return { success: false, migrated: 0 };
  }
};

export const shouldMigrateEvents = (userEmail: string): boolean => {
  const localStorageKey = `userCustomEvents_${userEmail}`;
  const migrationFlag = `${localStorageKey}_migrated`;
  
  // Si ya se migró, no hacerlo de nuevo
  if (localStorage.getItem(migrationFlag)) {
    return false;
  }
  
  // Si hay eventos en localStorage, necesita migración
  const savedEvents = localStorage.getItem(localStorageKey);
  return savedEvents !== null && savedEvents !== '[]';
};
