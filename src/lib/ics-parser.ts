// ICS Parser for Teamup calendar
// Parses the DIDATTICA calendar and maps events to schools

export interface ParsedEvent {
  uid: string;
  summary: string;
  description: string | null;
  location: string | null;
  categories: string[];
  dtStart: Date;
  dtEnd: Date;
  isAllDay: boolean;
  who: string | null;
  rawIcsName: string; // The school name as it appears in ICS
}

// Mapping: ICS school name patterns -> canonical school name
// Keys are lowercase patterns to match against the event summary
// The first match wins, so put more specific patterns first
export const SCHOOL_NAME_MAP: Array<{ pattern: string; canonicalName: string }> = [
  // Multi-school events (will be assigned to first school)
  { pattern: 'giovanni cena', canonicalName: 'Giovanni Cena' },
  { pattern: 'gobetti', canonicalName: 'Maristas Gobetti' },
  { pattern: 'de filippo', canonicalName: 'Maristas Gobetti' },
  
  // Individual schools
  { pattern: 'matera adu', canonicalName: 'Matera ADU' },
  { pattern: 'mater adu', canonicalName: 'Matera ADU' },
  { pattern: 'matera quota', canonicalName: 'Matera ADU' },
  { pattern: 'mater quota', canonicalName: 'Matera ADU' },
  { pattern: 'piazz[a]', canonicalName: 'Matera ADU - Piazza' },
  { pattern: 'pacioli', canonicalName: 'IIS Pacioli' },
  { pattern: 'ferrara', canonicalName: 'Matera ADU - Ferrara' },
  
  { pattern: 'barsanti', canonicalName: 'Barsanti' },
  
  { pattern: 'minzoni', canonicalName: 'Minzoni' },
  
  { pattern: 'volta di aversa', canonicalName: 'IS Volta di Aversa' },
  { pattern: 'volta aversa', canonicalName: 'IS Volta di Aversa' },
  
  { pattern: 'amari mercuri', canonicalName: 'Amari Mercuri' },
  
  { pattern: 'marconi di torre', canonicalName: 'Marconi di Torre Annunziata' },
  { pattern: 'marconi torre', canonicalName: 'Marconi di Torre Annunziata' },
  
  { pattern: 'lombardo radice', canonicalName: 'IISS Lombardo Radice' },
  
  { pattern: 'imbriani', canonicalName: 'Imbriani' },
  
  { pattern: 'nitti', canonicalName: 'Nitti' },
  
  { pattern: 'cuoco campanella', canonicalName: 'Liceo Cuoco Campanella' },
  
  { pattern: 'liceo segre', canonicalName: 'Liceo Segre' },
  { pattern: 'segre', canonicalName: 'Liceo Segre' },
  
  { pattern: 'galvani', canonicalName: 'ITIS Galvani' },
  
  { pattern: 'duca di buonvicino', canonicalName: 'Duca di Buonvicino' },
  
  { pattern: 'de gasperi', canonicalName: 'De Gasperi' },
  
  { pattern: 'forio', canonicalName: 'IC Forio' },
  
  { pattern: 'tassinari', canonicalName: 'Tassinari' },
  
  { pattern: 'moscati', canonicalName: 'Liceo Moscati' },
  
  { pattern: 'ruggiero caserta', canonicalName: 'Ruggiero di Caserta' },
  { pattern: 'ruggieri caserta', canonicalName: 'Ruggiero di Caserta' },
  
  { pattern: "d'este", canonicalName: "D'Este" },
  { pattern: 'deste', canonicalName: "D'Este" },
  
  { pattern: 'villari', canonicalName: 'Liceo Villari' },
  
  { pattern: 'pascoli', canonicalName: 'Pascoli' },
  
  { pattern: 'ferrari', canonicalName: 'Ferrari' },
  
  { pattern: 'medi', canonicalName: 'Liceo Medi' },
  
  { pattern: 'filangieri', canonicalName: 'Filangieri' },
  
  { pattern: 'marea', canonicalName: 'Marea' },
  
  { pattern: 'dalla chiesa', canonicalName: 'IS Dalla Chiesa' },
  
  { pattern: 'pisco[po]', canonicalName: 'Piscopo' },
  
  { pattern: 'polizzi generosa', canonicalName: 'Polizzi Generosa' },
  
  { pattern: 'marie curie', canonicalName: 'Marie Curie' },
  
  { pattern: 'marconi giugliano', canonicalName: 'IS Marconi Giugliano' },
  
  { pattern: 'archime[de]', canonicalName: 'Archimede' },
  
  { pattern: 'sereni', canonicalName: 'Sereni' },
  
  { pattern: 'manzi maffucci', canonicalName: 'IS Manzi-Maffucci' },
  
  { pattern: 'san giorgio', canonicalName: 'Istituto Paritario San Giorgio' },
  
  { pattern: 'vittorio veneto', canonicalName: 'IS Vittorio Veneto' },
  
  { pattern: 'prosit', canonicalName: 'Prosit' },
  
  { pattern: 'sinergie', canonicalName: 'Sinergie' },
  
  { pattern: 'cicero[ne]', canonicalName: 'IIS Cicerone' },
  
  { pattern: 'dall[a] chiesa', canonicalName: 'IS Dalla Chiesa' },
  
  { pattern: 'colletta', canonicalName: 'Colletta' },
  
  { pattern: 'ceschelli', canonicalName: 'IC Ceschelli' },
  
  { pattern: 'caboto', canonicalName: 'Caboto' },
  
  { pattern: 'bernini', canonicalName: 'Bernini De Sanctis' },
  
  { pattern: 'carinola', canonicalName: 'Carinola' },
  
  { pattern: 'hadjidimovo', canonicalName: 'Hadjidimovo' },
  
  { pattern: 'comenio', canonicalName: 'Liceo Comenio' },
  
  { pattern: 'mantegna', canonicalName: 'Mantegna' },
  
  { pattern: 'nicolai', canonicalName: 'IC Nicolai' },
  
  { pattern: 'san nicola la strada', canonicalName: 'IC San Nicola La Strada' },
  
  { pattern: 'cappell', canonicalName: 'Liceo Chris Cappell' },
  { pattern: 'chris cappell', canonicalName: 'Liceo Chris Cappell' },
  
  { pattern: 'mercato san severino', canonicalName: 'Mercato San Severino' },
  
  { pattern: "d'auria nosengo", canonicalName: "D'Auria Nosengo" },
  { pattern: 'dauria nosengo', canonicalName: "D'Auria Nosengo" },
  
  { pattern: 'russolillo', canonicalName: 'Russolillo' },
  
  { pattern: 'della porta porzio', canonicalName: 'Della Porta Porzio' },
  
  { pattern: 'don milani', canonicalName: 'Don Milani' },
  
  { pattern: 'san isidoro', canonicalName: 'Don Milani San Isidoro' },
  
  { pattern: 'hypinia', canonicalName: 'Hyrpinia Lab' },
  { pattern: 'hirpinia', canonicalName: 'Hyrpinia Lab' },
  
  { pattern: 'de caro', canonicalName: 'De Caro' },
  
  { pattern: 'azuni', canonicalName: 'Azuni' },
  
  { pattern: 'merco[gl]iano', canonicalName: 'Mercogliano Guadagni' },
  { pattern: 'guadagni', canonicalName: 'Mercogliano Guadagni' },
  
  { pattern: 'castellana sicula', canonicalName: 'IC Castellana Sicula' },
  { pattern: 'castellana polizzi', canonicalName: 'IC Castellana Polizzi' },
  
  { pattern: 'panzini', canonicalName: 'IC Panzini' },
  
  { pattern: 'marista gobetti', canonicalName: 'Maristas Gobetti' },
  { pattern: 'maristas gobetti', canonicalName: 'Maristas Gobetti' },
  
  { pattern: 'hispalis', canonicalName: 'IES Hispalis' },
  
  { pattern: 'pablo de la torre', canonicalName: 'Pablo de la Torre' },
  
  { pattern: 'cpia ragusa', canonicalName: 'CPIA Ragusa' },
  
  { pattern: 'de petra', canonicalName: 'IC De Petra' },
  
  { pattern: 'samokov', canonicalName: 'Samokov' },
  { pattern: 'fakali', canonicalName: 'Fakali' },
  
  { pattern: 'michelangelo augusto', canonicalName: 'Michelangelo Augusto' },
  
  { pattern: 'vanoni', canonicalName: 'Ezio Vanoni' },
  
  { pattern: 'case[ll]i', canonicalName: 'Caselli' },
  
  { pattern: 'cavalcanti', canonicalName: 'Cavalcanti' },
  
  { pattern: 'elen[a] di savoia', canonicalName: 'Elena di Savoia' },
  { pattern: 'savoia', canonicalName: 'Elena di Savoia' },
  
  { pattern: 'marconi vet', canonicalName: 'Marconi VET' },
  
  { pattern: 'ipf civita', canonicalName: 'IPF Civita' },
  
  { pattern: 'galiani', canonicalName: 'Galiani Da Vinci' },
  { pattern: 'galiani da vinci', canonicalName: 'Galiani Da Vinci' },
  
  { pattern: 'marconi di torre annunziata', canonicalName: 'Marconi di Torre Annunziata' },
  
  { pattern: 'marcon[i]', canonicalName: 'Marconi' },
  
  { pattern: 'cell[eti]', canonicalName: 'Celleti' },
  
  { pattern: 'unitre fossano', canonicalName: 'Unitre Fossano' },
  
  { pattern: 'conservatorio', canonicalName: 'Conservatorio Guerrero' },
  { pattern: 'guerrero', canonicalName: 'Conservatorio Guerrero' },
  
  { pattern: 'helio[po]lis', canonicalName: 'Heliopolis' },
  
  // Internal/non-school events (these get skipped)
  { pattern: 'vacaciones', canonicalName: '__INTERNAL__' },
  { pattern: 'no esta', canonicalName: '__INTERNAL__' },
  { pattern: 'no está', canonicalName: '__INTERNAL__' },
  { pattern: 'sale a las', canonicalName: '__INTERNAL__' },
  { pattern: 'esce alle', canonicalName: '__INTERNAL__' },
  { pattern: 'vuelve', canonicalName: '__INTERNAL__' },
  { pattern: 'llegada', canonicalName: '__INTERNAL__' },
  { pattern: 'arriv[o]', canonicalName: '__INTERNAL__' },
  { pattern: 'smart', canonicalName: '__INTERNAL__' },
  { pattern: 'teletrabajo', canonicalName: '__INTERNAL__' },
  { pattern: 'oficina cerrada', canonicalName: '__INTERNAL__' },
  { pattern: 'cerramos', canonicalName: '__INTERNAL__' },
  { pattern: 'cena de empresa', canonicalName: '__INTERNAL__' },
  { pattern: 'riunione', canonicalName: '__INTERNAL__' },
  { pattern: 'reunion', canonicalName: '__INTERNAL__' },
  { pattern: 'reunión', canonicalName: '__INTERNAL__' },
  { pattern: 'call ', canonicalName: '__INTERNAL__' },
  { pattern: 'entrevista', canonicalName: '__INTERNAL__' },
  { pattern: 'call ', canonicalName: '__INTERNAL__' },
  { pattern: 'pier ', canonicalName: '__INTERNAL__' },
  { pattern: 'guido ', canonicalName: '__INTERNAL__' },
  { pattern: 'carmen ', canonicalName: '__INTERNAL__' },
  { pattern: 'blanca ', canonicalName: '__INTERNAL__' },
  { pattern: 'daniela ', canonicalName: '__INTERNAL__' },
  { pattern: 'stefano ', canonicalName: '__INTERNAL__' },
  { pattern: 'lucia ', canonicalName: '__INTERNAL__' },
  { pattern: 'diletta ', canonicalName: '__INTERNAL__' },
  { pattern: 'sabri', canonicalName: '__INTERNAL__' },
  { pattern: 'irene ', canonicalName: '__INTERNAL__' },
  { pattern: 'mg ', canonicalName: '__INTERNAL__' },
  { pattern: 'paloma', canonicalName: '__INTERNAL__' },
  { pattern: 'veronica', canonicalName: '__INTERNAL__' },
  { pattern: 'enrique', canonicalName: '__INTERNAL__' },
  { pattern: 'leonardo', canonicalName: '__INTERNAL__' },
  { pattern: 'francesca', canonicalName: '__INTERNAL__' },
  { pattern: 'montse', canonicalName: '__INTERNAL__' },
  { pattern: 'jean pierre', canonicalName: '__INTERNAL__' },
  { pattern: 'jean', canonicalName: '__INTERNAL__' },
  { pattern: 'anna de rosa', canonicalName: '__INTERNAL__' },
  { pattern: 'horario intensivo', canonicalName: '__INTERNAL__' },
  { pattern: 'institutos cerrados', canonicalName: '__INTERNAL__' },
  { pattern: 'todo el mundo', canonicalName: '__INTERNAL__' },
  { pattern: 'pier g', canonicalName: '__INTERNAL__' },
  { pattern: 'concierto', canonicalName: '__INTERNAL__' },
  { pattern: 'tussam', canonicalName: '__INTERNAL__' },
  { pattern: 'app barrio', canonicalName: '__INTERNAL__' },
  { pattern: 'svb y desa', canonicalName: '__INTERNAL__' },
  { pattern: 'josue', canonicalName: '__INTERNAL__' },
  { pattern: 'josé', canonicalName: '__INTERNAL__' },
  { pattern: 'jose', canonicalName: '__INTERNAL__' },
  { pattern: 'dominguez', canonicalName: '__INTERNAL__' },
  { pattern: 'pastor', canonicalName: '__INTERNAL__' },
  { pattern: 'ia jose', canonicalName: '__INTERNAL__' },
  { pattern: 'duca di buonvicino', canonicalName: 'Duca di Buonvicino' },
  { pattern: 'acompañar', canonicalName: '__INTERNAL__' },
  { pattern: 'manos abiertas', canonicalName: '__INTERNAL__' },
  { pattern: 'conservatorio guerrero', canonicalName: '__INTERNAL__' },
];

// Extract school name from event summary
export function extractSchoolName(summary: string): string | null {
  const lowerSummary = summary.toLowerCase();
  
  for (const mapping of SCHOOL_NAME_MAP) {
    if (lowerSummary.includes(mapping.pattern.toLowerCase())) {
      if (mapping.canonicalName === '__INTERNAL__') {
        return null; // Skip internal events
      }
      return mapping.canonicalName;
    }
  }
  
  return null; // No school found
}

// Parse ICS content into events
export function parseICS(content: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const vevents = content.split('BEGIN:VEVENT');
  
  for (let i = 1; i < vevents.length; i++) {
    const vevent = vevents[i];
    
    const uid = extractField(vevent, 'UID');
    const summary = extractField(vevent, 'SUMMARY');
    const description = extractField(vevent, 'DESCRIPTION');
    const location = extractField(vevent, 'LOCATION');
    const categoriesStr = extractField(vevent, 'CATEGORIES');
    const who = extractField(vevent, 'X-TEAMUP-WHO');
    const isAllDay = vevent.includes('X-MICROSOFT-CDO-ALLDAYEVENT:TRUE');
    
    const dtStartRaw = extractRawField(vevent, 'DTSTART');
    const dtEndRaw = extractRawField(vevent, 'DTEND');
    
    if (!dtStartRaw || !summary) continue;
    
    const dtStart = parseICSDate(dtStartRaw, isAllDay);
    const dtEnd = parseICSDate(dtEndRaw || dtStartRaw, isAllDay);
    
    if (!dtStart || isNaN(dtStart.getTime())) continue;
    
    const categories = categoriesStr ? categoriesStr.split(',').map(c => c.trim()) : [];
    
    const schoolName = extractSchoolName(summary);
    if (!schoolName) continue; // Skip events without a school
    
    events.push({
      uid: uid || '',
      summary: summary.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';'),
      description: description ? description.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';') : null,
      location: location ? location.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';') : null,
      categories,
      dtStart,
      dtEnd: dtEnd || dtStart,
      isAllDay,
      who: who ? who.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';') : null,
      rawIcsName: schoolName,
    });
  }
  
  return events;
}

function extractField(content: string, fieldName: string): string | null {
  const match = content.match(new RegExp(`${fieldName}:(.+?)(?:\\r?\\n|\\r)`, 's'));
  return match ? match[1].trim() : null;
}

function extractRawField(content: string, fieldName: string): string | null {
  const match = content.match(new RegExp(`${fieldName}[^:]*[:;]([^\\r\\n]+)`, 's'));
  return match ? match[1].trim() : null;
}

function parseICSDate(dateStr: string, isAllDay: boolean): Date | null {
  if (!dateStr) return null;
  
  // Handle VALUE=DATE:YYYYMMDD format
  if (dateStr.includes('VALUE=DATE:')) {
    const datePart = dateStr.replace('VALUE=DATE:', '');
    const year = parseInt(datePart.substring(0, 4));
    const month = parseInt(datePart.substring(4, 6)) - 1;
    const day = parseInt(datePart.substring(6, 8));
    return new Date(year, month, day);
  }
  
  // Handle TZID format: DTSTART;TZID=Europe/Madrid:20251211T093000
  if (dateStr.includes('TZID=')) {
    const timePart = dateStr.split(':').slice(1).join(':');
    const year = parseInt(timePart.substring(0, 4));
    const month = parseInt(timePart.substring(4, 6)) - 1;
    const day = parseInt(timePart.substring(6, 8));
    const hour = parseInt(timePart.substring(9, 11));
    const minute = parseInt(timePart.substring(11, 13));
    const second = parseInt(timePart.substring(13, 15)) || 0;
    return new Date(year, month, day, hour, minute, second);
  }
  
  // Handle simple format: YYYYMMDDTHHMMSS
  if (dateStr.includes('T')) {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    const hour = parseInt(dateStr.substring(9, 11));
    const minute = parseInt(dateStr.substring(11, 13));
    const second = parseInt(dateStr.substring(13, 15)) || 0;
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  }
  
  // Handle simple date: YYYYMMDD
  if (dateStr.length === 8) {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
  }
  
  return null;
}
