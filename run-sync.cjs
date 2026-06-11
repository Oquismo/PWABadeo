const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ICS_URL = 'https://ics.teamup.com/feed/ksampdkmv21a529vhx/0.ics';
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
console.log('Filtering events from:', TODAY.toISOString());

async function run() {
  console.log('Fetching ICS...');
  const res = await fetch(ICS_URL, { cache: 'no-store' });
  const content = await res.text();

  const vevents = content.split('BEGIN:VEVENT');
  const parsedEvents = [];

  const skipPatterns = ['call ', 'entrevista', 'vacaciones', 'no est', 'esce alle', 'sale a las', 'smart', 'teletrabajo', 'oficina cerrada', 'cena de empresa', 'riunione', 'reunion', 'concierto', 'tussam', 'acompa', 'visita empresa', 'llamada ', 'videochiamata', 'parlare con', 'chiamare ', 'alcazar', 'madrid', 'bulgar', 'ia en el aula', 'ice breaking', 'cv & linkedin', 'social dilemma', 'english class', 'viene veronica', 'vien', 'van ', 'primer d'];

  const patterns = [
    ['marea adu', 'Marea ADU'], ['marea ', 'Marea ADU'],
    ['mater adu', 'Mater ADU'], ['matera adu', 'Mater ADU'], ['mater ', 'Mater ADU'],
    ['minzoni', 'Minzoni'],
    ['volta aversa', 'VOLTA AVERSA'], ['volta di aversa', 'VOLTA AVERSA'],
    ['amari mercuri', 'Amari Mercuri'],
    ['marconi di torre', 'Marconi'], ['marconi torre', 'Marconi'], ['marconi vet', 'Marconi'], ['marconi giugliano', 'Marconi'], ['marconi di giugliano', 'Marconi'], ['marconi di giuliano', 'Marconi'], ['marconi ', 'Marconi'],
    ['lombardo radice', 'Lombardo Radice'],
    ['nitti', 'Nitti'],
    ['cuoco campanella', 'Liceo Cuoco Campanella'], ['liceo cuoco', 'Liceo Cuoco Campanella'],
    ['galvani', 'ITIS Galvani'], ['is galvani', 'ITIS Galvani'],
    ['duca di buonvicino', 'Duca di Buonvicino'], ['duca di buon vicino', 'Duca di Buonvicino'], ['buonivicino', 'Duca di Buonvicino'],
    ['tassinari', 'Tassinari'],
    ['moscati', 'Liceo Moscati'], ['liceo moscati', 'Liceo Moscati'], ['isis moscati', 'Liceo Moscati'],
    ['villari', 'Liceo Villari'], ['liceo villari', 'Liceo Villari'],
    ['liceo medi', 'Liceo Medi'], ['medi ', 'Liceo Medi'],
    ['filangieri', 'Filangieri'],
    ['marie curie', 'Marie Curie'],
    ['sereni', 'IS E. Sereni'], ['e. sereni', 'IS E. Sereni'], ['is seren', 'IS E. Sereni'], ['pcto seren', 'IS E. Sereni'],
    ['manzi maffucci', 'IS Manzi-Maffucci'], ['manzi ', 'IS Manzi-Maffucci'],
    ['vittorio veneto', 'IS Vittorio Veneto'], ['is vittorio veneto', 'IS Vittorio Veneto'], ['isis vittorio veneto', 'IS Vittorio Veneto'],
    ['prosit', 'Prosit'],
    ['sinergie', 'Sinergie'],
    ['cicerone', 'IIS Cicerone'], ['iis cicero', 'IIS Cicerone'],
    ['bernini', 'Bernini-De Sanctis'], ['bernini de sanctis', 'Bernini-De Sanctis'],
    ['carinola', 'IC Carinola Falciano'], ['carinola falciano', 'IC Carinola Falciano'],
    ['hadjidimovo', 'Hadjidimovo'],
    ['comenio', 'Liceo Comenio'], ['liceo comenio', 'Liceo Comenio'],
    ['mantegna', 'ITET Mantegna'], ['itet mantegna', 'ITET Mantegna'],
    ['nicolai', 'IC Nicolai'], ['ic nicolai', 'IC Nicolai'],
    ['san nicola', 'San Nicola La Strada'], ['ic san nicola', 'San Nicola La Strada'],
    ['cappell', 'Liceo Chris Cappell'], ['chris cappell', 'Liceo Chris Cappell'], ['liceo chris cappell', 'Liceo Chris Cappell'],
    ['dauria nosengo', "IC D'Auria Nosengo"], ["d'auria nosengo", "IC D'Auria Nosengo"], ['ic dauria', "IC D'Auria Nosengo"],
    ['russolillo', 'Russolillo'],
    ['della porta porzio', 'Della Porta Porzio'],
    ['don milani', 'Don Lorenzo Milani'], ['liceo don milani', 'Don Lorenzo Milani'], ['san isidoro', 'Don Lorenzo Milani'],
    ['hyrpini', 'Hyrpinia Lab'], ['hirpini', 'Hyrpinia Lab'],
    ['azuni', 'Azuni'], ['liceo azuni', 'Azuni'],
    ['merco', 'Mercogliano Guadagni'], ['guadagni', 'Mercogliano Guadagni'], ['ic merco', 'Mercogliano Guadagni'],
    ['castellana sicula', 'IC Castellana Sicula'], ['castellana polizzi', 'IC Castellana Sicula'], ['ic castellana', 'IC Castellana Sicula'],
    ['panzini', 'ISTITUTO COMPRENSIVO 2 PANZINI'], ['ic panzini', 'ISTITUTO COMPRENSIVO 2 PANZINI'],
    ['samokov', 'Samokov OU'], ['fakali', 'Samokov OU'],
    ['michelangelo augusto', 'Michelangelo Augusto'], ['ic michelangelo', 'Michelangelo Augusto'],
    ['vanoni', 'IS Ezio Vanoni'], ['ezio vanoni', 'IS Ezio Vanoni'], ['is ezio vanoni', 'IS Ezio Vanoni'], ['iiss ezio vanoni', 'IS Ezio Vanoni'],
    ['caselli', 'Caselli'], ['caselli palizzi', 'Caselli'],
    ['cavalcanti', 'Cavalcanti'],
    ['galiani', 'Galiani Da Vinci'], ['galiani da vinci', 'Galiani Da Vinci'], ['pcto galiani', 'Galiani Da Vinci'],
    ['unitre', 'Unitre Fossano'], ['unitre fossano', 'Unitre Fossano'],
    ['da collo', 'Francesco Da Collo'], ['francesco da collo', 'Francesco Da Collo'],
    ['dante alighieri', 'IC Dante Alighieri'], ['ic dante alighieri', 'IC Dante Alighieri'], ['dante alighieri bellona', 'IC Dante Alighieri'], ['c dante alighieri', 'IC Dante Alighieri'], ['ic dante', 'IC Dante Alighieri'],
    ['giordano bruno', 'IC Giordano Bruno-Fiore-Sanseverino'], ['ic giordano bruno', 'IC Giordano Bruno-Fiore-Sanseverino'],
    ['ferdinando russo', 'ICS Ferdinando Russo'], ['ics ferdinando russo', 'ICS Ferdinando Russo'], ['ics ferdinando', 'ICS Ferdinando Russo'],
    ['gandhi', 'IISS M.K. GANDHI'], ['iiss m.k. gandhi', 'IISS M.K. GANDHI'],
    ['sauro morelli', 'Sauro Morelli'],
    ['pacioli', 'IIS Pacioli'], ['iis pacioli', 'IIS Pacioli'],
    ['de gasperi', 'De Gasperi'],
    ['forio', 'IC Forio'],
    ['piscopo', 'Piscopo'],
    ['polizzi generosa', 'Polizzi Generosa'],
    ['archime', 'Archimede'],
    ['colletta', 'Pietro Colletta'], ['pietro colletta', 'Pietro Colletta'],
    ['ceschelli', 'IC Ceschelli'],
    ['caboto', 'Caboto'],
    ['de caro', 'IC De Caro'], ['ic de caro', 'IC De Caro'],
    ['de petra', 'IC De Petra'], ['ic de petra', 'IC De Petra'],
    ['cpia ragusa', 'CPIA Ragusa'],
    ['mercato san severino', 'ICS Mercato San Severino'], ['ics mercato', 'ICS Mercato San Severino'],
    ['montessori', 'IC Montessori'], ['ic montessori', 'IC Montessori'],
    ['eleonora', "Eleonora D'Arborea"],
    ['osvaldo conti', 'ISIS OSVALDO CONTI'], ['isis osvaldo conti', 'ISIS OSVALDO CONTI'],
    ['majorana', 'ISIS Majorana'], ['isis majorana', 'ISIS Majorana'],
    ['leonardo spadola', 'Leonardo Spadola'],
    ['conservatorio', 'Conservatorio Guerrero'], ['guerrero', 'Conservatorio Guerrero'],
    ['heliopoli', 'Heliopolis'],
    ['giovanni cena', 'Giovanni Cena'],
    ['gobetti', 'Maristas Gobetti'], ['maristas gobetti', 'Maristas Gobetti'], ['de filippo', 'Maristas Gobetti'],
    ['liceo segre', 'Liceo Segre'], ['segr', 'Liceo Segre'],
    ['ruggiero caserta', 'Ruggiero di Caserta'], ['ruggieri caserta', 'Ruggiero di Caserta'], ['ruggero di caserta', 'Ruggiero di Caserta'],
    ['d este', "D'Este"], ['deste', "D'Este"],
    ['pascoli', 'Pascoli'], ['pascoli colliano', 'Pascoli'],
    ['ferrari', 'Ferrari'],
    ['dalla chiesa', 'Dalla Chiesa'], ['dall', 'Dalla Chiesa'],
    ['imbriani', 'Imbriani'],
    ['san giorgio', 'IP San Giorgio'], ['ip san giorgio', 'IP San Giorgio'],
    ['barsanti', 'Barsanti'],
    ['pablo de la torre', 'Pablo de la Torre'],
    ['hispalis', 'IES Hispalis'],
  ];

  function cleanText(t) {
    return t.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
  }

  function parseDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr.includes('VALUE=DATE:')) {
      const d = dateStr.replace('VALUE=DATE:', '');
      return new Date(parseInt(d.substring(0,4)), parseInt(d.substring(4,6))-1, parseInt(d.substring(6,8)));
    }
    if (dateStr.includes('TZID=')) {
      const t = dateStr.split(':').slice(1).join(':');
      return new Date(parseInt(t.substring(0,4)), parseInt(t.substring(4,6))-1, parseInt(t.substring(6,8)), parseInt(t.substring(9,11)), parseInt(t.substring(11,13)), parseInt(t.substring(13,15))||0);
    }
    if (dateStr.includes('T')) {
      return new Date(Date.UTC(parseInt(dateStr.substring(0,4)), parseInt(dateStr.substring(4,6))-1, parseInt(dateStr.substring(6,8)), parseInt(dateStr.substring(9,11)), parseInt(dateStr.substring(11,13)), parseInt(dateStr.substring(13,15))||0));
    }
    if (dateStr.length === 8) {
      return new Date(parseInt(dateStr.substring(0,4)), parseInt(dateStr.substring(4,6))-1, parseInt(dateStr.substring(6,8)));
    }
    return null;
  }

  for (let i = 1; i < vevents.length; i++) {
    const ev = vevents[i];
    const uid = ev.match(/UID:(.+?)(?:\r?\n|\r)/)?.[1]?.trim();
    const summary = ev.match(/SUMMARY:(.+?)(?:\r?\n|\r)/)?.[1]?.trim();
    if (!uid || !summary) continue;

    const lower = summary.toLowerCase();
    let skip = false;
    for (const p of skipPatterns) { if (lower.includes(p)) { skip = true; break; } }
    if (skip) continue;

    let schoolName = null;
    for (const [pattern, name] of patterns) {
      if (lower.includes(pattern)) { schoolName = name; break; }
    }
    if (!schoolName) continue;

    const dtStartRaw = ev.match(/DTSTART[^:]*[:;]([^\r\n]+)/)?.[1]?.trim();
    if (!dtStartRaw) continue;
    const dtStart = parseDate(dtStartRaw);
    if (!dtStart || isNaN(dtStart.getTime())) continue;

    // ONLY events from today onwards
    if (dtStart < TODAY) continue;

    const description = ev.match(/DESCRIPTION:(.+?)(?:\r?\n|\r)/)?.[1]?.trim();
    const location = ev.match(/LOCATION:(.+?)(?:\r?\n|\r)/)?.[1]?.trim();
    const categories = ev.match(/CATEGORIES:(.+?)(?:\r?\n|\r)/)?.[1]?.trim();
    const who = ev.match(/X-TEAMUP-WHO:(.+?)(?:\r?\n|\r)/)?.[1]?.trim();
    const isAllDay = ev.includes('X-MICROSOFT-CDO-ALLDAYEVENT:TRUE');
    const dtEndRaw = ev.match(/DTEND[^:]*[:;]([^\r\n]+)/)?.[1]?.trim();
    const dtEnd = parseDate(dtEndRaw || dtStartRaw);

    parsedEvents.push({
      uid,
      summary: cleanText(summary),
      description: description ? cleanText(description) : null,
      location: location ? cleanText(location) : null,
      categories: categories ? categories.split(',').map(c => c.trim()) : [],
      dtStart,
      dtEnd: dtEnd || dtStart,
      isAllDay,
      who: who ? cleanText(who) : null,
      schoolName,
    });
  }

  console.log(`Parsed ${parsedEvents.length} events (from today onwards)`);

  // Delete old events first
  const deletedOld = await prisma.schoolEvent.deleteMany({
    where: { date: { lt: TODAY } }
  });
  console.log(`Deleted ${deletedOld.count} old events`);

  const allSchools = await prisma.school.findMany();
  console.log(`${allSchools.length} schools in DB`);

  const bySchool = new Map();
  for (const ev of parsedEvents) {
    if (!bySchool.has(ev.schoolName)) bySchool.set(ev.schoolName, []);
    bySchool.get(ev.schoolName).push(ev);
  }
  console.log(`${bySchool.size} unique schools`);

  let schoolsCreated = 0, schoolsFound = 0, eventsCreated = 0, eventsUpdated = 0;

  for (const [schoolName, events] of bySchool) {
    const target = schoolName.toLowerCase();
    let school = allSchools.find(s => s.name.toLowerCase() === target);
    if (!school) {
      school = allSchools.find(s => { const db = s.name.toLowerCase(); return target.includes(db) || db.includes(target); });
    }
    if (!school) {
      const words = target.split(/\s+/).filter(w => w.length > 2);
      if (words.length > 0) school = allSchools.find(s => s.name.toLowerCase().includes(words[0]));
    }

    if (!school) {
      school = await prisma.school.create({
        data: { name: schoolName, country: 'Italia', type: 'pública', level: 'secondaria_secondo', description: `Importada desde Teamup (${events.length} eventos)` }
      });
      allSchools.push(school);
      schoolsCreated++;
    } else {
      schoolsFound++;
    }

    for (const ev of events) {
      const existing = await prisma.schoolEvent.findFirst({ where: { uid: ev.uid } });
      const data = {
        title: ev.summary, description: ev.description, date: ev.dtStart, endDate: ev.dtEnd,
        location: ev.location, category: ev.categories.join(', '), who: ev.who,
        isAllDay: ev.isAllDay, rawSummary: ev.summary, schoolId: school.id,
      };
      if (existing) {
        await prisma.schoolEvent.update({ where: { id: existing.id }, data });
        eventsUpdated++;
      } else {
        await prisma.schoolEvent.create({ data: { ...data, uid: ev.uid } });
        eventsCreated++;
      }
    }
  }

  console.log('\n=== RESULTS ===');
  console.log(`Schools created: ${schoolsCreated}`);
  console.log(`Schools found: ${schoolsFound}`);
  console.log(`Events created: ${eventsCreated}`);
  console.log(`Events updated: ${eventsUpdated}`);
  console.log(`Total events in DB: ${eventsCreated + eventsUpdated}`);

  await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
