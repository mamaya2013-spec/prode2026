export interface Team {
  id: string;
  name: string;
  short: string;
  color: string; // Color HSL principal para sombras y gradientes de escudo
  emoji: string;
}

export interface Match {
  id: string;
  teamA: string; // ID de la selección A
  teamB: string; // ID de la selección B
  date: string;  // ISO String con fecha de kickoff
  stadium: string;
  phase: string;  // 'Grupo A', 'Dieciseisavos', 'Octavos', etc.
  scoreA?: number; // Resultado real del partido
  scoreB?: number;
  status: 'pending' | 'live' | 'finished';
}

// 48 Selecciones del Mundial 2026 clasificadas
export const TEAMS: Record<string, Team> = {
  // Grupo A
  MEX: { id: 'MEX', name: 'México', short: 'MEX', color: 'hsl(145, 80%, 40%)', emoji: '🇲🇽' },
  ECU: { id: 'ECU', name: 'Ecuador', short: 'ECU', color: 'hsl(48, 90%, 55%)', emoji: '🇪🇨' },
  KSA: { id: 'KSA', name: 'Arabia Saudita', short: 'KSA', color: 'hsl(145, 90%, 25%)', emoji: '🇸🇦' },
  CMR: { id: 'CMR', name: 'Camerún', short: 'CMR', color: 'hsl(135, 75%, 35%)', emoji: '🇨🇲' },
  // Grupo B
  CAN: { id: 'CAN', name: 'Canadá', short: 'CAN', color: 'hsl(0, 85%, 45%)', emoji: '🇨🇦' },
  COL: { id: 'COL', name: 'Colombia', short: 'COL', color: 'hsl(48, 95%, 50%)', emoji: '🇨🇴' },
  KOR: { id: 'KOR', name: 'Corea del Sur', short: 'KOR', color: 'hsl(215, 85%, 50%)', emoji: '🇰🇷' },
  POL: { id: 'POL', name: 'Polonia', short: 'POL', color: 'hsl(355, 80%, 50%)', emoji: '🇵🇱' },
  // Grupo C
  USA: { id: 'USA', name: 'Estados Unidos', short: 'USA', color: 'hsl(215, 90%, 35%)', emoji: '🇺🇸' },
  URU: { id: 'URU', name: 'Uruguay', short: 'URU', color: 'hsl(198, 85%, 55%)', emoji: '🇺🇾' },
  JPN: { id: 'JPN', name: 'Japón', short: 'JPN', color: 'hsl(220, 80%, 40%)', emoji: '🇯🇵' },
  SEN: { id: 'SEN', name: 'Senegal', short: 'SEN', color: 'hsl(140, 80%, 40%)', emoji: '🇸🇳' },
  // Grupo D
  ARG: { id: 'ARG', name: 'Argentina', short: 'ARG', color: 'hsl(198, 90%, 65%)', emoji: '🇦🇷' },
  SWE: { id: 'SWE', name: 'Suecia', short: 'SWE', color: 'hsl(210, 80%, 40%)', emoji: '🇸🇪' },
  IRN: { id: 'IRN', name: 'Irán', short: 'IRN', color: 'hsl(145, 75%, 40%)', emoji: '🇮🇷' },
  MAR: { id: 'MAR', name: 'Marruecos', short: 'MAR', color: 'hsl(348, 85%, 40%)', emoji: '🇲🇦' },
  // Grupo E
  BRA: { id: 'BRA', name: 'Brasil', short: 'BRA', color: 'hsl(55, 90%, 50%)', emoji: '🇧🇷' },
  DEN: { id: 'DEN', name: 'Dinamarca', short: 'DEN', color: 'hsl(355, 85%, 45%)', emoji: '🇩🇰' },
  AUS: { id: 'AUS', name: 'Australia', short: 'AUS', color: 'hsl(215, 90%, 30%)', emoji: '🇦🇺' },
  GHA: { id: 'GHA', name: 'Ghana', short: 'GHA', color: 'hsl(45, 90%, 50%)', emoji: '🇬🇭' },
  // Grupo F
  FRA: { id: 'FRA', name: 'Francia', short: 'FRA', color: 'hsl(220, 85%, 45%)', emoji: '🇫🇷' },
  SUI: { id: 'SUI', name: 'Suiza', short: 'SUI', color: 'hsl(355, 80%, 50%)', emoji: '🇨🇭' },
  TUN: { id: 'TUN', name: 'Túnez', short: 'TUN', color: 'hsl(355, 85%, 45%)', emoji: '🇹🇳' },
  IRQ: { id: 'IRQ', name: 'Irak', short: 'IRQ', color: 'hsl(145, 70%, 30%)', emoji: '🇮🇶' },
  // Grupo G
  GER: { id: 'GER', name: 'Alemania', short: 'GER', color: 'hsl(0, 0%, 95%)', emoji: '🇩🇪' },
  PER: { id: 'PER', name: 'Perú', short: 'PER', color: 'hsl(355, 80%, 50%)', emoji: '🇵🇪' },
  NZL: { id: 'NZL', name: 'Nueva Zelanda', short: 'NZL', color: 'hsl(0, 0%, 15%)', emoji: '🇳🇿' },
  ALG: { id: 'ALG', name: 'Argelia', short: 'ALG', color: 'hsl(145, 75%, 35%)', emoji: '🇩🇿' },
  // Grupo H
  ESP: { id: 'ESP', name: 'España', short: 'ESP', color: 'hsl(355, 90%, 50%)', emoji: '🇪🇸' },
  CRO: { id: 'CRO', name: 'Croacia', short: 'CRO', color: 'hsl(355, 80%, 55%)', emoji: '🇭🇷' },
  CHI: { id: 'CHI', name: 'Chile', short: 'CHI', color: 'hsl(355, 85%, 45%)', emoji: '🇨🇱' },
  NGA: { id: 'NGA', name: 'Nigeria', short: 'NGA', color: 'hsl(145, 85%, 30%)', emoji: '🇳🇬' },
  // Grupo I
  BEL: { id: 'BEL', name: 'Bélgica', short: 'BEL', color: 'hsl(355, 75%, 40%)', emoji: '🇧🇪' },
  POR: { id: 'POR', name: 'Portugal', short: 'POR', color: 'hsl(355, 80%, 35%)', emoji: '🇵🇹' },
  CRC: { id: 'CRC', name: 'Costa Rica', short: 'CRC', color: 'hsl(215, 80%, 40%)', emoji: '🇨🇷' },
  EGY: { id: 'EGY', name: 'Egipto', short: 'EGY', color: 'hsl(355, 80%, 40%)', emoji: '🇪🇬' },
  // Grupo J
  ENG: { id: 'ENG', name: 'Inglaterra', short: 'ENG', color: 'hsl(210, 80%, 50%)', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  NED: { id: 'NED', name: 'Países Bajos', short: 'NED', color: 'hsl(25, 95%, 50%)', emoji: '🇳🇱' },
  QAT: { id: 'QAT', name: 'Catar', short: 'QAT', color: 'hsl(340, 85%, 35%)', emoji: '🇶🇦' },
  CIV: { id: 'CIV', name: 'Costa de Marfil', short: 'CIV', color: 'hsl(28, 90%, 50%)', emoji: '🇨🇮' },
  // Grupo K
  ITA: { id: 'ITA', name: 'Italia', short: 'ITA', color: 'hsl(215, 90%, 45%)', emoji: '🇮🇹' },
  UKR: { id: 'UKR', name: 'Ucrania', short: 'UKR', color: 'hsl(48, 95%, 55%)', emoji: '🇺🇦' },
  PAN: { id: 'PAN', name: 'Panamá', short: 'PAN', color: 'hsl(215, 85%, 45%)', emoji: '🇵🇦' },
  RSA: { id: 'RSA', name: 'Sudáfrica', short: 'RSA', color: 'hsl(145, 80%, 35%)', emoji: '🇿🇦' },
  // Grupo L
  AUT: { id: 'AUT', name: 'Austria', short: 'AUT', color: 'hsl(355, 80%, 50%)', emoji: '🇦🇹' },
  TUR: { id: 'TUR', name: 'Turquía', short: 'TUR', color: 'hsl(355, 85%, 45%)', emoji: '🇹🇷' },
  JAM: { id: 'JAM', name: 'Jamaica', short: 'JAM', color: 'hsl(55, 90%, 45%)', emoji: '🇯🇲' },
  WAL: { id: 'WAL', name: 'Gales', short: 'WAL', color: 'hsl(355, 80%, 40%)', emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' }
};

// Mapeo de grupos a selecciones para generar partidos
const GROUP_TEAMS: Record<string, string[]> = {
  'Grupo A': ['MEX', 'ECU', 'KSA', 'CMR'],
  'Grupo B': ['CAN', 'COL', 'KOR', 'POL'],
  'Grupo C': ['USA', 'URU', 'JPN', 'SEN'],
  'Grupo D': ['ARG', 'SWE', 'IRN', 'MAR'],
  'Grupo E': ['BRA', 'DEN', 'AUS', 'GHA'],
  'Grupo F': ['FRA', 'SUI', 'TUN', 'IRQ'],
  'Grupo G': ['GER', 'PER', 'NZL', 'ALG'],
  'Grupo H': ['ESP', 'CRO', 'CHI', 'NGA'],
  'Grupo I': ['BEL', 'POR', 'CRC', 'EGY'],
  'Grupo J': ['ENG', 'NED', 'QAT', 'CIV'],
  'Grupo K': ['ITA', 'UKR', 'PAN', 'RSA'],
  'Grupo L': ['AUT', 'TUR', 'JAM', 'WAL']
};

const STADIUMS = [
  'Estadio Azteca (CDMX, México)',
  'MetLife Stadium (NY/NJ, USA)',
  'SoFi Stadium (LA, USA)',
  'Mercedes-Benz Stadium (Atlanta, USA)',
  'BC Place (Vancouver, Canadá)',
  'Hard Rock Stadium (Miami, USA)',
  'Gillette Stadium (Boston, USA)',
  'AT&T Stadium (Dallas, USA)',
  'Arrowhead Stadium (Kansas, USA)',
  'Lincoln Financial Field (Filadelfia, USA)',
  'Estadio BBVA (Monterrey, México)',
  'Estadio Akron (Guadalajara, México)',
  'Lumen Field (Seattle, USA)',
  'Levi Stadium (San Francisco, USA)',
  'BMO Field (Toronto, Canadá)',
  'NRG Stadium (Houston, USA)'
];

// Generador programático estructurado de los 104 partidos del fixture
const generateFixture = (): Match[] => {
  const list: Match[] = [];
  let matchIdCounter = 1;

  // Fecha base inicial del torneo: 11 de Junio de 2026
  const tournamentStartDate = new Date('2026-06-11T16:00:00Z');

  // 1. Fase de Grupos (72 partidos, 6 partidos por cada uno de los 12 grupos)
  // Cada grupo tiene 4 equipos: A-B, C-D, A-C, B-D, A-D, B-C.
  const groups = Object.keys(GROUP_TEAMS);
  
  groups.forEach((groupName, groupIdx) => {
    const teams = GROUP_TEAMS[groupName];
    const matchPairs = [
      [teams[0], teams[1]], // A vs B
      [teams[2], teams[3]], // C vs D
      [teams[0], teams[2]], // A vs C
      [teams[1], teams[3]], // B vs D
      [teams[0], teams[3]], // A vs D
      [teams[1], teams[2]]  // B vs C
    ];

    matchPairs.forEach((pair, pairIdx) => {
      // Repartir en fechas cronológicas realistas a lo largo de 15 días de fase de grupos
      const daysOffset = groupIdx + Math.floor(pairIdx / 2) * 2;
      const hoursOffset = (pairIdx % 2) * 3 + (groupIdx % 3);
      const matchDate = new Date(tournamentStartDate.getTime());
      matchDate.setUTCDate(tournamentStartDate.getUTCDate() + daysOffset);
      matchDate.setUTCHours(tournamentStartDate.getUTCHours() + hoursOffset);

      list.push({
        id: `M${matchIdCounter++}`,
        teamA: pair[0],
        teamB: pair[1],
        date: matchDate.toISOString(),
        stadium: STADIUMS[(matchIdCounter) % STADIUMS.length],
        phase: groupName,
        status: 'pending'
      });
    });
  });

  // 2. Ronda de 32 (Dieciseisavos - 16 partidos)
  // Comienza el 27 de Junio de 2026
  const r32StartDate = new Date('2026-06-27T15:00:00Z');
  // Se cruzan primeros y segundos de grupo + mejores terceros. 
  // Para la demo completa, emparejamos combinaciones icónicas de las selecciones cabeza de serie
  const r32Cruces = [
    ['MEX', 'COL'], ['CAN', 'ECU'], ['USA', 'SWE'], ['ARG', 'JPN'],
    ['BRA', 'SUI'], ['FRA', 'DEN'], ['GER', 'CRO'], ['ESP', 'PER'],
    ['BEL', 'NED'], ['ENG', 'POR'], ['ITA', 'TUR'], ['AUT', 'UKR'],
    ['URU', 'KOR'], ['COL', 'POL'], ['MAR', 'SEN'], ['CIV', 'TUN']
  ];

  r32Cruces.forEach((cruce, idx) => {
    const matchDate = new Date(r32StartDate.getTime());
    matchDate.setUTCDate(r32StartDate.getUTCDate() + Math.floor(idx / 4));
    matchDate.setUTCHours(r32StartDate.getUTCHours() + (idx % 4) * 3);

    list.push({
      id: `M${matchIdCounter++}`,
      teamA: cruce[0],
      teamB: cruce[1],
      date: matchDate.toISOString(),
      stadium: STADIUMS[(idx + 4) % STADIUMS.length],
      phase: 'Dieciseisavos',
      status: 'pending'
    });
  });

  // 3. Octavos de Final (8 partidos)
  // Comienza el 2 de Julio de 2026
  const r16StartDate = new Date('2026-07-02T16:00:00Z');
  const r16Cruces = [
    ['MEX', 'ARG'], ['BRA', 'FRA'], ['GER', 'ESP'], ['BEL', 'ENG'],
    ['ITA', 'URU'], ['COL', 'USA'], ['MAR', 'POR'], ['NED', 'JPN']
  ];

  r16Cruces.forEach((cruce, idx) => {
    const matchDate = new Date(r16StartDate.getTime());
    matchDate.setUTCDate(r16StartDate.getUTCDate() + Math.floor(idx / 4));
    matchDate.setUTCHours(r16StartDate.getUTCHours() + (idx % 2) * 4);

    list.push({
      id: `M${matchIdCounter++}`,
      teamA: cruce[0],
      teamB: cruce[1],
      date: matchDate.toISOString(),
      stadium: STADIUMS[(idx + 2) % STADIUMS.length],
      phase: 'Octavos',
      status: 'pending'
    });
  });

  // 4. Cuartos de Final (4 partidos)
  // Comienza el 9 de Julio de 2026
  const qfStartDate = new Date('2026-07-09T18:00:00Z');
  const qfCruces = [
    ['ARG', 'BRA'], ['FRA', 'GER'], ['ESP', 'ENG'], ['ITA', 'COL']
  ];

  qfCruces.forEach((cruce, idx) => {
    const matchDate = new Date(qfStartDate.getTime());
    matchDate.setUTCDate(qfStartDate.getUTCDate() + Math.floor(idx / 2));
    matchDate.setUTCHours(qfStartDate.getUTCHours() + (idx % 2) * 4);

    list.push({
      id: `M${matchIdCounter++}`,
      teamA: cruce[0],
      teamB: cruce[1],
      date: matchDate.toISOString(),
      stadium: STADIUMS[(idx * 3) % STADIUMS.length],
      phase: 'Cuartos',
      status: 'pending'
    });
  });

  // 5. Semifinales (2 partidos)
  // Comienza el 14 de Julio de 2026
  const sfStartDate = new Date('2026-07-14T20:00:00Z');
  const sfCruces = [
    ['ARG', 'FRA'], ['ESP', 'ITA']
  ];

  sfCruces.forEach((cruce, idx) => {
    const matchDate = new Date(sfStartDate.getTime());
    matchDate.setUTCDate(sfStartDate.getUTCDate() + idx * 2);

    list.push({
      id: `M${matchIdCounter++}`,
      teamA: cruce[0],
      teamB: cruce[1],
      date: matchDate.toISOString(),
      stadium: STADIUMS[idx ? 1 : 2], // SoFi o MetLife
      phase: 'Semifinal',
      status: 'pending'
    });
  });

  // 6. Tercer Puesto (1 partido)
  // 18 de Julio de 2026
  list.push({
    id: `M${matchIdCounter++}`,
    teamA: 'FRA',
    teamB: 'ESP',
    date: new Date('2026-07-18T18:00:00Z').toISOString(),
    stadium: 'Hard Rock Stadium (Miami, USA)',
    phase: 'Tercer Puesto',
    status: 'pending'
  });

  // 7. Gran Final (1 partido)
  // 19 de Julio de 2026
  list.push({
    id: `M${matchIdCounter++}`,
    teamA: 'ARG',
    teamB: 'ITA',
    date: new Date('2026-07-19T20:00:00Z').toISOString(),
    stadium: 'MetLife Stadium (NY/NJ, USA)',
    phase: 'Final',
    status: 'pending'
  });

  return list;
};

export const INITIAL_MATCHES = generateFixture();
