// ICS Parser for Teamup calendar
// Maps ICS event summaries to real schools in the database

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
  schoolName: string; // Canonical school name
}

// Each entry: [pattern to match in summary (lowercase), canonical school name]
// Order matters: more specific patterns first
const SCHOOL_MAP: Array<[string, string]> = [
  // Multi-school events - match the first school
  ['giovanni cena', 'Giovanni Cena'],
  ['gobetti', 'Maristas Gobetti'],
  ['de filippo', 'Maristas Gobetti'],
  ['maristas gobetti', 'Maristas Gobetti'],

  // Individual schools
  ['marea adu', 'Marea ADU'],
  ['marea ', 'Marea ADU'],

  ['mater adu', 'Mater ADU'],
  ['matera adu', 'Mater ADU'],
  ['mater ', 'Mater ADU'],
  ['piazz', 'Mater ADU'],
  ['pacioli', 'IIS Pacioli'],
  ['ferrara', 'Mater ADU'],

  ['barsanti', 'Barsanti'],

  ['minzoni', 'Minzoni'],

  ['volta aversa', 'VOLTA AVERSA'],
  ['volta di aversa', 'VOLTA AVERSA'],

  ['amari mercuri', 'Amari Mercuri'],

  ['marconi di torre', 'Marconi'],
  ['marconi torre', 'Marconi'],
  ['marconi vet', 'Marconi'],
  ['marconi giugliano', 'Marconi'],
  ['marconi di giugliano', 'Marconi'],
  ['marconi di giuliano', 'Marconi'],
  ['marconi ', 'Marconi'],

  ['lombardo radice', 'Lombardo Radice'],

  ['imbriani', 'Imbriani'],

  ['nitti', 'Nitti'],

  ['cuoco campanella', 'Liceo Cuoco Campanella'],
  ['liceo cuoco', 'Liceo Cuoco Campanella'],

  ['liceo segre', 'Liceo Segre'],
  ['segr', 'Liceo Segre'],

  ['galvani', 'ITIS Galvani'],
  ['is galvani', 'ITIS Galvani'],

  ['duca di buonvicino', 'Duca di Buonvicino'],
  ['duca di buon vicino', 'Duca di Buonvicino'],
  ['buonivicino', 'Duca di Buonvicino'],

  ['de gasperi', 'De Gasperi'],

  ['forio', 'IC Forio'],

  ['tassinari', 'Tassinari'],

  ['moscati', 'Liceo Moscati'],
  ['liceo moscati', 'Liceo Moscati'],
  ['isis moscati', 'Liceo Moscati'],

  ['ruggiero caserta', 'Ruggiero di Caserta'],
  ['ruggieri caserta', 'Ruggiero di Caserta'],
  ['ruggero di caserta', 'Ruggiero di Caserta'],

  ["d'este", "D'Este"],
  ['deste', "D'Este"],

  ['villari', 'Liceo Villari'],
  ['liceo villari', 'Liceo Villari'],

  ['pascoli', 'Pascoli'],
  ['pascoli colliano', 'Pascoli'],

  ['ferrari', 'Ferrari'],

  ['liceo medi', 'Liceo Medi'],
  ['medi ', 'Liceo Medi'],

  ['filangieri', 'Filangieri'],

  ['dalla chiesa', 'Dalla Chiesa'],
  ['dall[a] chiesa', 'Dalla Chiesa'],

  ['piscopo', 'Piscopo'],

  ['polizzi generosa', 'Polizzi Generosa'],

  ['marie curie', 'Marie Curie'],

  ['archime', 'Archimede'],

  ['sereni', 'IS E. Sereni'],
  ['e. sereni', 'IS E. Sereni'],
  ['is seren', 'IS E. Sereni'],
  ['pcto seren', 'IS E. Sereni'],

  ['manzi maffucci', 'IS Manzi-Maffucci'],
  ['manzi ', 'IS Manzi-Maffucci'],

  ['san giorgio', 'IP San Giorgio'],
  ['ip san giorgio', 'IP San Giorgio'],

  ['vittorio veneto', 'IS Vittorio Veneto'],
  ['is vittorio veneto', 'IS Vittorio Veneto'],
  ['isis vittorio veneto', 'IS Vittorio Veneto'],

  ['prosit', 'Prosit'],

  ['sinergie', 'Sinergie'],

  ['cicerone', 'IIS Cicerone'],
  ['iis cicero', 'IIS Cicerone'],

  ['colletta', 'Pietro Colletta'],
  ['pietro colletta', 'Pietro Colletta'],

  ['ceschelli', 'IC Ceschelli'],

  ['caboto', 'Caboto'],

  ['bernini', 'Bernini-De Sanctis'],
  ['bernini de sanctis', 'Bernini-De Sanctis'],

  ['carinola', 'IC Carinola Falciano'],
  ['carinola falciano', 'IC Carinola Falciano'],

  ['hadjidimovo', 'Hadjidimovo'],

  ['comenio', 'Liceo Comenio'],
  ['liceo comenio', 'Liceo Comenio'],

  ['mantegna', 'ITET Mantegna'],
  ['itet mantegna', 'ITET Mantegna'],

  ['nicolai', 'IC Nicolai'],
  ['ic nicolai', 'IC Nicolai'],

  ['san nicola', 'San Nicola La Strada'],
  ['ic san nicola', 'San Nicola La Strada'],

  ['cappell', 'Liceo Chris Cappell'],
  ['chris cappell', 'Liceo Chris Cappell'],
  ['liceo chris cappell', 'Liceo Chris Cappell'],

  ['mercato san severino', 'ICS Mercato San Severino'],
  ['ics mercato', 'ICS Mercato San Severino'],

  ["d'auria nosengo", "IC D'Auria Nosengo"],
  ['dauria nosengo', "IC D'Auria Nosengo"],
  ['ic dauria', "IC D'Auria Nosengo"],
  ['ic d\'auria', "IC D'Auria Nosengo"],

  ['russolillo', 'Russolillo'],

  ['della porta porzio', 'Della Porta Porzio'],

  ['don milani', 'Don Lorenzo Milani'],
  ['liceo don milani', 'Don Lorenzo Milani'],

  ['san isidoro', 'Don Lorenzo Milani'],

  ['hyrpini', 'Hyrpinia Lab'],
  ['hirpini', 'Hyrpinia Lab'],

  ['de caro', 'IC De Caro'],

  ['azuni', 'Azuni'],
  ['liceo azuni', 'Azuni'],

  ['merco[gl]iano', 'Mercogliano Guadagni'],
  ['guadagni', 'Mercogliano Guadagni'],
  ['ic merco', 'Mercogliano Guadagni'],

  ['castellana sicula', 'IC Castellana Sicula'],
  ['castellana polizzi', 'IC Castellana Sicula'],
  ['ic castellana', 'IC Castellana Sicula'],

  ['panzini', 'ISTITUTO COMPRENSIVO 2 PANZINI'],
  ['ic panzini', 'ISTITUTO COMPRENSIVO 2 PANZINI'],
  ['panzini di castellammare', 'ISTITUTO COMPRENSIVO 2 PANZINI'],

  ['hispalis', 'IES Hispalis'],

  ['pablo de la torre', 'Pablo de la Torre'],

  ['cpia ragusa', 'CPIA Ragusa'],

  ['de petra', 'IC De Petra'],
  ['ic de petra', 'IC De Petra'],

  ['samokov', 'Samokov OU'],
  ['fakali', 'Samokov OU'],

  ['michelangelo augusto', 'Michelangelo Augusto'],
  ['ic michelangelo', 'Michelangelo Augusto'],

  ['vanoni', 'IS Ezio Vanoni'],
  ['ezio vanoni', 'IS Ezio Vanoni'],
  ['is ezio vanoni', 'IS Ezio Vanoni'],
  ['iiss ezio vanoni', 'IS Ezio Vanoni'],

  ['caselli', 'Caselli'],
  ['caselli palizzi', 'Caselli'],

  ['cavalcanti', 'Cavalcanti'],

  ['eleonora d\'arborea', 'Eleonora D\'Arborea'],
  ['eleonora d arborea', 'Eleonora D\'Arborea'],

  ['montessori', 'IC Montessori'],
  ['ic montessori', 'IC Montessori'],

  ['galiani', 'Galiani Da Vinci'],
  ['galiani da vinci', 'Galiani Da Vinci'],
  ['pcto galiani', 'Galiani Da Vinci'],

  ['celleti', 'Celleti'],

  ['unitre', 'Unitre Fossano'],
  ['unitre fossano', 'Unitre Fossano'],

  ['conservatorio', 'Conservatorio Guerrero'],
  ['guerrero', 'Conservatorio Guerrero'],

  ['heliopoli', 'Heliopolis'],

  ['da collo', 'Francesco Da Collo'],
  ['francesco da collo', 'Francesco Da Collo'],

  ['dante alighieri', 'IC Dante Alighieri'],
  ['ic dante alighieri', 'IC Dante Alighieri'],
  ['dante alighieri bellona', 'IC Dante Alighieri'],
  ['c dante alighieri', 'IC Dante Alighieri'],
  ['ic dante', 'IC Dante Alighieri'],

  ['giordano bruno', 'IC Giordano Bruno-Fiore-Sanseverino'],
  ['ic giordano bruno', 'IC Giordano Bruno-Fiore-Sanseverino'],

  ['ferdinando russo', 'ICS Ferdinando Russo'],
  ['ics ferdinando russo', 'ICS Ferdinando Russo'],
  ['ics ferdinando', 'ICS Ferdinando Russo'],

  ['gandhi', 'IISS M.K. GANDHI'],
  ['iiss m.k. gandhi', 'IISS M.K. GANDHI'],

  ['sauro morelli', 'Sauro Morelli'],

  ['osvaldo conti', 'ISIS OSVALDO CONTI'],
  ['isis osvaldo conti', 'ISIS OSVALDO CONTI'],

  ['majorana', 'ISIS Majorana'],
  ['isis majorana', 'ISIS Majorana'],

  ['leonardo spadola', 'Leonardo Spadola'],

  ['ic buccino', 'IC Buccino'],

  ['ic villaggio coppola', 'IC Villaggio Coppola'],

  ['bulgaro', 'Bulgaros'],
  ['bulgari', 'Bulgaros'],
];

// Patterns that indicate internal/non-school events (should be skipped)
// IMPORTANT: School matching runs FIRST, so these only apply to events without a school name
const INTERNAL_PATTERNS = [
  'vacaciones', 'no est', 'sale a las', 'esce alle', 'vuelve',
  'llegada', 'arriv', 'smart', 'teletrabajo', 'oficina cerrada',
  'cerramos', 'cena de empresa', 'riunione', 'reunion',
  'concierto', 'tussam', 'app barrio', 'svb y desa',
  'acompa', 'manos abiertas', 'horario intensivo',
  'institutos cerrados', 'todo el mundo',
  'viene veronica', 'viene al',
  'fuori ',
  'primer d',
  'llamada ',
  'videochiamata',
  'parlare con',
  'chiamare ',
  'visita empresa', 'visitas empresa',
  'pcto ',
  'ia en el aula',
  'ice breaking',
  'cv & linkedin',
  'social dilemma',
  'english class',
  'goodbye',
];

// Check if event is internal (not a school event)
function isInternalEvent(summary: string): boolean {
  const lower = summary.toLowerCase();

  // Skip calls
  if (lower.startsWith('call ') || lower.includes('[fatto] call')) {
    return true;
  }

  // Skip interviews
  if (lower.includes('entrevista') || lower.includes('intervista')) {
    return true;
  }

  for (const pattern of INTERNAL_PATTERNS) {
    if (lower.includes(pattern.toLowerCase())) {
      // Special case: some patterns like "pcto" appear in school names too
      // Only skip if it's purely a PCTO event without a school name
      if (pattern === 'pcto ') {
        // Check if there's a school name in the summary
        const hasSchool = SCHOOL_MAP.some(([p]) => {
          if (p === 'pcto') return false;
          return lower.includes(p.toLowerCase());
        });
        if (!hasSchool) return true;
      } else {
        return true;
      }
    }
  }

  // Skip personal notes (pier, guido, carmen, etc. without school context)
  const personalPatterns = [
    /^pier\s+$/, /^guido\s*$/, /^carmen\s*$/, /^blanca\s*$/,
    /^daniela\s*$/, /^stefano\s*$/, /^lucia\s*$/, /^diletta\s*$/,
    /^sabri\s*$/, /^irene\s*$/, /^mg\s*$/, /^paloma\s*$/,
    /^veronica\s*$/, /^enrique\s*$/, /^leonardo\s*$/, /^francesca\s*$/,
    /^montse\s*$/, /^jean\s*$/, /^yo\s*$/,
  ];

  for (const regex of personalPatterns) {
    if (regex.test(lower.trim())) {
      return true;
    }
  }

  return false;
}

// Program type keywords extracted from event summaries (priority order)
const PROGRAM_TYPES = [
  // SHORT, PCTO, VET define distinct programs - higher priority
  { pattern: /\bSHORT\b/i, name: 'Short' },
  { pattern: /\bPCTO\b/i, name: 'PCTO' },
  { pattern: /\bVET\b/i, name: 'VET' },
  // Job Shadowing is often an activity within another program, so lower priority
  { pattern: /\bJOB\s*SHADOW(ING)?\b/i, name: 'Job Shadowing' },
  { pattern: /\bJOB\b/i, name: 'Job Shadowing' },
  { pattern: /\bJS\b/i, name: 'Job Shadowing' },
  // ADU is the most generic type, lowest priority
  { pattern: /\bADU\b/i, name: 'ADU' },
];

// When a school base name includes a program type but the event is a different type,
// replace the type in the name rather than appending (e.g., "Marea ADU" + VET → "Marea VET")
type TypeReplacement = { include: string; type: string; replace: string };

const TYPE_REPLACEMENTS: TypeReplacement[] = [
  // Base contains "ADU" but event is VET → replace ADU with VET
  { include: 'adu', type: 'vet', replace: 'VET' },
  // Base contains "ADU" but event is Job Shadowing → append
  // (no replacement needed, just append)
];

function getProgramType(summary: string): { name: string; matched: boolean } {
  for (const pt of PROGRAM_TYPES) {
    if (pt.pattern.test(summary)) {
      return { name: pt.name, matched: true };
    }
  }
  return { name: '', matched: false };
}

// Flux codes distinguish different groups/flows within a school (e.g., "Minzoni V" vs "Minzoni VI").
// Keyed by base school name (lowercase), each entry has ordered regex patterns (longer match first).
// When a flux code is found, it replaces the generic program type as the differentiator.
const SCHOOL_FLUX_PATTERNS: Record<string, RegExp[]> = {
  'minzoni': [
    // Primary: match roman numeral associated with FLUSSO keyword
    /\b(VI|V|IV|III|II|I)\s+FLUSSO\b/i,
    /\bFLUSSO\s+[-]?\s*(VI|V|IV|III|II|I)\b/i,
    // Fallback: match standalone roman numeral
    /\b(VI)\b/,
    /\b(V)\b/,
    /\b(IV)\b/,
    /\b(III)\b/,
    /\b(II)\b/,
    /\b(I)\b/,
  ],
};

// Extract canonical school name from event summary
export function extractSchoolName(summary: string): string | null {
  const lowerSummary = summary.toLowerCase();

  // Find the first matching school pattern
  for (const [pattern, baseName] of SCHOOL_MAP) {
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedPattern, 'i');
    if (regex.test(lowerSummary)) {
      const baseLower = baseName.toLowerCase();

      // For schools with flux-based separation, flux takes priority
      const fluxPatterns = SCHOOL_FLUX_PATTERNS[baseLower];
      if (fluxPatterns) {
        for (const fp of fluxPatterns) {
          const m = summary.match(fp);
          if (m) {
            const flux = m[1].toUpperCase();
            // Avoid duplicates (e.g., report "Minzoni V" if already "Minzoni V")
            if (!baseLower.includes(flux.toLowerCase())) {
              return `${baseName} ${flux}`;
            }
            return baseName;
          }
        }
        // Flux school but no specific code matched — still create base school
        return baseName;
      }

      // Standard program type logic
      const type = getProgramType(summary);
      if (!type.matched) return baseName;

      const typeLower = type.name.toLowerCase();

      // Check if the type should replace part of the base name
      for (const tr of TYPE_REPLACEMENTS) {
        if (baseLower.includes(tr.include) && typeLower === tr.type) {
          // Replace the matched keyword in the base name with the replacement
          return baseName.replace(new RegExp(tr.include, 'i'), tr.replace);
        }
      }

      // Append the type if not already present in the base name
      if (!baseLower.includes(typeLower)) {
        return `${baseName} ${type.name}`;
      }
      return baseName;
    }
  }

  // If no school matched, filter internal/personal events
  if (isInternalEvent(summary)) {
    return null;
  }

  return null;
}

// Unfold ICS continuation lines (RFC 5545: lines starting with space/tab)
function unfoldICS(content: string): string {
  return content.replace(/\r?\n[ \t]/g, '');
}

// Parse ICS content into events
export function parseICS(content: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const unfolded = unfoldICS(content);
  const vevents = unfolded.split('BEGIN:VEVENT');

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

    const schoolName = extractSchoolName(summary);
    if (!schoolName) continue;

    const categories = categoriesStr ? categoriesStr.split(',').map(c => c.trim()) : [];

    events.push({
      uid: uid || '',
      summary: cleanICSText(summary),
      description: description ? cleanICSText(description) : null,
      location: location ? cleanICSText(location) : null,
      categories,
      dtStart,
      dtEnd: dtEnd || dtStart,
      isAllDay,
      who: who ? cleanICSText(who) : null,
      schoolName,
    });
  }

  return events;
}

function cleanICSText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function extractField(content: string, fieldName: string): string | null {
  const match = content.match(new RegExp(`${fieldName}:(.+?)(?:\\r?\\n|\\r)`, 's'));
  return match ? match[1].trim() : null;
}

function extractRawField(content: string, fieldName: string): string | null {
  const match = content.match(new RegExp(`${fieldName}[^:]*[:;]([^\\r\\n]+)`));
  if (!match) return null;
  const value = match[1].trim();
  // Preserve TZID if present (e.g., DTSTART;TZID=Europe/Rome:20250619T150000)
  const tzidMatch = content.match(new RegExp(`${fieldName};TZID=([^;:]+)`));
  if (tzidMatch) {
    return `TZID=${tzidMatch[1]}:${value}`;
  }
  return value;
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
    
    // Extract timezone from the dateStr
    const tzMatch = dateStr.match(/TZID=([^;:]+)/);
    const tzid = tzMatch ? tzMatch[1] : 'Europe/Madrid';
    
    // Build ISO string and parse with timezone
    const isoStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
    
    try {
      // Try to parse with timezone info
      const date = new Date(`${isoStr} ${tzid}`);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch {
      // Fallback to local time
    }
    
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
