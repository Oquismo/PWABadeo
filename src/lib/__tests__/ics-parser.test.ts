import { describe, it, expect } from 'vitest';
import { extractSchoolName, parseICS, ParsedEvent } from '../ics-parser';

describe('extractSchoolName', () => {
  it('returns null for internal events', () => {
    expect(extractSchoolName('Riunione Coordinamento')).toBeNull();
    expect(extractSchoolName('Staff Meeting')).toBeNull();
    expect(extractSchoolName('Team Planning')).toBeNull();
  });

  it('extracts Minzoni base name', () => {
    expect(extractSchoolName('Minzoni - Marketing')).toBe('Minzoni');
  });

  it('extracts Minzoni with flux', () => {
    expect(extractSchoolName('Minzoni FLUSSO VI - Marketing')).toBe('Minzoni VI');
  });

  it('extracts Minzoni with flux V', () => {
    expect(extractSchoolName('Minzoni FLUSSO V - Marketing')).toBe('Minzoni V');
  });

  it('extracts Marea ADU', () => {
    expect(extractSchoolName('Marea ADU - Evento')).toBe('Marea ADU');
    expect(extractSchoolName('Marea - Marketing')).toBe('Marea ADU');
  });

  it('extracts Mater ADU', () => {
    expect(extractSchoolName('Mater ADU - Clase')).toBe('Mater ADU');
  });

  it('extracts IIS Pacioli', () => {
    expect(extractSchoolName('Pacioli - Matematica')).toBe('IIS Pacioli');
  });

  it('extracts Barsanti', () => {
    expect(extractSchoolName('Barsanti - Scienze')).toBe('Barsanti');
  });

  it('extracts Marconi schools', () => {
    expect(extractSchoolName('Marconi di Torre - Lab')).toBe('Marconi');
    expect(extractSchoolName('Marconi Giugliano - Info')).toBe('Marconi');
  });

  it('extracts VOLTA AVERSA', () => {
    expect(extractSchoolName('Volta Aversa - Fisica')).toBe('VOLTA AVERSA');
  });

  it('extracts Amari Mercuri', () => {
    expect(extractSchoolName('Amari Mercuri - Diritto')).toBe('Amari Mercuri');
  });

  it('extracts Giovanni Cena', () => {
    expect(extractSchoolName('Giovanni Cena - Arte')).toBe('Giovanni Cena');
  });

  it('extracts Gobetti', () => {
    expect(extractSchoolName('Gobetti - Storia')).toBe('Maristas Gobetti');
    expect(extractSchoolName('De Filippo - Filosofia')).toBe('Maristas Gobetti');
    expect(extractSchoolName('Maristas Gobetti - Scienze')).toBe('Maristas Gobetti');
  });

  it('extracts Liceo Segre', () => {
    expect(extractSchoolName('Segre - Letteratura')).toBe('Liceo Segre');
  });

  it('extracts Marie Curie', () => {
    expect(extractSchoolName('Marie Curie - Chimica')).toBe('Marie Curie');
  });

  it('extracts Liceo Moscati', () => {
    expect(extractSchoolName('Liceo Moscati - Scienze')).toBe('Liceo Moscati');
    expect(extractSchoolName('Moscati - Biologia')).toBe('Liceo Moscati');
  });

  it('extracts Dalla Chiesa', () => {
    expect(extractSchoolName('Dalla Chiesa - Diritto')).toBe('Dalla Chiesa');
  });

  it('extracts Pascoli', () => {
    expect(extractSchoolName('Pascoli - Letteratura')).toBe('Pascoli');
  });

  it('extracts Ferrari', () => {
    expect(extractSchoolName('Ferrari - Meccanica')).toBe('Ferrari');
  });

  it('extracts Lombardo Radice', () => {
    expect(extractSchoolName('Lombardo Radice - Pedagogia')).toBe('Lombardo Radice');
  });

  it('handles unknown events gracefully', () => {
    expect(extractSchoolName('Some random event title')).toBeNull();
  });
});

describe('extractField', () => {
  it('should be tested via parseICS integration');
});

describe('parseICS', () => {
  const minimalICS = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test-1
SUMMARY:Minzoni FLUSSO VI - Marketing
DTSTART:20251211T093000
DTEND:20251211T113000
DESCRIPTION:Clase de marketing
LOCATION:Aula 3
CATEGORIES:Clase
END:VEVENT
END:VCALENDAR`;

  it('parses a basic ICS event', () => {
    const events = parseICS(minimalICS);
    expect(events).toHaveLength(1);
    expect(events[0].uid).toBe('test-1');
    expect(events[0].summary).toBe('Minzoni FLUSSO VI - Marketing');
    expect(events[0].schoolName).toBe('Minzoni VI');
    expect(events[0].description).toBe('Clase de marketing');
    expect(events[0].location).toBe('Aula 3');
  });

  it('parses dates correctly', () => {
    const events = parseICS(minimalICS);
    expect(events[0].dtStart.getTime()).toBeGreaterThan(0);
    expect(events[0].dtEnd.getTime()).toBeGreaterThan(0);
  });

  it('filters out events without school match', () => {
    const icsWithPersonal = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:test-1
SUMMARY:Minzoni - Marketing
DTSTART:20251211T093000
DTEND:20251211T113000
END:VEVENT
BEGIN:VEVENT
UID:test-2
SUMMARY:Cumpleaños personal
DTSTART:20251212T100000
DTEND:20251212T110000
END:VEVENT
END:VCALENDAR`;

    const events = parseICS(icsWithPersonal);
    expect(events).toHaveLength(1);
    expect(events[0].uid).toBe('test-1');
  });

  it('handles TZID in DTSTART', () => {
    const icsWithTZ = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:tz-test
SUMMARY:Minzoni - Clase con TZ
DTSTART;TZID=Europe/Madrid:20251211T093000
DTEND;TZID=Europe/Madrid:20251211T113000
END:VEVENT
END:VCALENDAR`;

    const events = parseICS(icsWithTZ);
    expect(events).toHaveLength(1);
    expect(events[0].schoolName).toBe('Minzoni');
  });
});

describe('parseICS with real-world content', () => {
  const sampleICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Teamup//Teamup Calendar//EN
BEGIN:VEVENT
UID:teamup-abc123@teamup.com
SUMMARY:Minzoni FLUSSO VI - Marketing
DTSTART;TZID=Europe/Madrid:20260302T093000
DTEND;TZID=Europe/Madrid:20260302T113000
DESCRIPTION:Clase de marketing digital\\nTema: Redes sociales
LOCATION:Aula 3 - Edificio Principal
CATEGORIES:Coordinador: María García
X-TEAMUP-WHO:Prof. Juan Pérez
END:VEVENT
BEGIN:VEVENT
UID:teamup-def456@teamup.com
SUMMARY:Marea ADU - Economía
DTSTART;TZID=Europe/Madrid:20260302T120000
DTEND;TZID=Europe/Madrid:20260302T140000
DESCRIPTION:Teoría económica
LOCATION:Aula 5
CATEGORIES:Coordinador: Ana López
END:VEVENT
BEGIN:VEVENT
UID:teamup-ghi789@teamup.com
SUMMARY:Staff Meeting - Coordinadores
DTSTART;TZID=Europe/Madrid:20260302T150000
DTEND;TZID=Europe/Madrid:20260302T160000
END:VEVENT
END:VCALENDAR`;

  it('parses multiple events correctly', () => {
    const events = parseICS(sampleICS);
    expect(events).toHaveLength(2);
    expect(events[0].schoolName).toBe('Minzoni VI');
    expect(events[1].schoolName).toBe('Marea ADU');
  });

  it('preserves TZID in parsed dates', () => {
    const events = parseICS(sampleICS);
    expect(events[0].dtStart.getTime()).toBeGreaterThan(0);
  });

  it('extracts X-TEAMUP-WHO field', () => {
    const events = parseICS(sampleICS);
    expect(events[0].who).toBe('Prof. Juan Pérez');
    expect(events[1].who).toBeNull();
  });

  it('filters out staff/internal events', () => {
    const events = parseICS(sampleICS);
    const staffEvents = events.filter(e => e.uid === 'teamup-ghi789@teamup.com');
    expect(staffEvents).toHaveLength(0);
  });

  it('extracts categories', () => {
    const events = parseICS(sampleICS);
    expect(events[0].categories).toContain('Coordinador: María García');
  });

  it('cleans escaped characters', () => {
    const events = parseICS(sampleICS);
    expect(events[0].description).toBe('Clase de marketing digital\nTema: Redes sociales');
  });
});
