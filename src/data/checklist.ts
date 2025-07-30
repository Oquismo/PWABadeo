export interface ChecklistItem {
  id: number;
  text: string;
  completed: boolean;
}

export const initialChecklistItems: ChecklistItem[] = [
  { id: 1, text: 'Recoger las llaves de tu alojamiento', completed: false },
  { id: 2, text: 'Visitar la oficina de Barrio de Oportunidades', completed: false },
  { id: 3, text: 'Obtener tarjeta SIM española', completed: false },
  { id: 4, text: 'Comprar tarjeta de transporte público', completed: false },
  { id: 5, text: 'Registrarse en el ayuntamiento (empadronamiento)', completed: false },
  { id: 6, text: 'Asistir a la sesión de bienvenida', completed: false },
];