import { INITIAL_MATCHES } from '../data/matches2026';
import type { Match } from '../data/matches2026';

export interface User {
  id: string;
  name: string;
  pin: string; // PIN de 4 dígitos creado por el usuario en su primer ingreso
  groupId: string; // ID del grupo aislado al que pertenece
  points: number;
  streak: number; // Racha actual de partidos acertados seguidos
  achievements: string[]; // Lista de IDs de logros desbloqueados ('profeta', 'invicto', etc.)
  jokersUsedGroup: number; // Máximo 1 comodín usado por jornada
  jokersUsedFinal: number; // Máximo 1 comodín en fase final
  jersey?: {
    primaryColor: string;
    secondaryColor: string;
    pattern: 'solid' | 'striped' | 'hoops' | 'sash';
    number: number;
  };
}

export interface Group {
  id: string;
  name: string;
  inviteToken: string; // Token para links de invitación (?invite=token)
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedScoreA: number;
  predictedScoreB: number;
  isJoker: boolean; // Si aplicó Comodín a este partido
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'user' | 'system';
}

export interface SystemState {
  simulatedTimeOffset: number; // En milisegundos (permite viajar en el tiempo para la demo de bloqueos)
  isAdmin: boolean;
}

export interface Duel {
  id: string;
  matchId: string;
  challengerId: string;
  challengedId: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  winnerId?: string; // challengerId | challengedId | 'draw'
  timestamp: string;
}

// Claves de LocalStorage
const KEYS = {
  USERS: 'prode_2026_users',
  GROUPS: 'prode_2026_groups',
  PREDICTIONS: 'prode_2026_predictions',
  MATCHES: 'prode_2026_matches',
  STATE: 'prode_2026_system_state',
  CHAT: 'prode_2026_chat',
  DUELS: 'prode_2026_duels'
};

// Datos Demo Iniciales para poblar la base de datos local
const INITIAL_GROUPS: Group[] = [
  { id: 'G-OFICINA', name: 'Oficina Planta Alta 💻', inviteToken: 'oficina-2026' },
  { id: 'G-AMIGOS', name: 'Los Pibes de los Jueves ⚽', inviteToken: 'pibes-futbol' }
];

const INITIAL_USERS: User[] = [
  // Grupo Oficina
  { id: 'U-LIONEL', name: 'Lionel', pin: '1010', groupId: 'G-OFICINA', points: 14, streak: 3, achievements: ['profeta', 'invicto'], jokersUsedGroup: 1, jokersUsedFinal: 0, jersey: { primaryColor: 'hsl(198, 90%, 65%)', secondaryColor: '#ffffff', pattern: 'striped', number: 10 } },
  { id: 'U-NEYMAR', name: 'Neymar Jr', pin: '1111', groupId: 'G-OFICINA', points: 10, streak: 1, achievements: ['fiel'], jokersUsedGroup: 0, jokersUsedFinal: 0, jersey: { primaryColor: 'hsl(55, 90%, 50%)', secondaryColor: 'hsl(140, 80%, 40%)', pattern: 'solid', number: 10 } },
  { id: 'U-KYLIAN', name: 'Kylian', pin: '0707', groupId: 'G-OFICINA', points: 9, streak: 0, achievements: ['francotirador'], jokersUsedGroup: 1, jokersUsedFinal: 0, jersey: { primaryColor: 'hsl(220, 85%, 45%)', secondaryColor: '#ffffff', pattern: 'striped', number: 7 } },
  { id: 'U-CR7', name: 'Cristiano', pin: '0700', groupId: 'G-OFICINA', points: 5, streak: 0, achievements: [], jokersUsedGroup: 0, jokersUsedFinal: 0, jersey: { primaryColor: 'hsl(355, 80%, 35%)', secondaryColor: 'hsl(140, 80%, 40%)', pattern: 'solid', number: 7 } },
  
  // Grupo Amigos
  { id: 'U-ROMAN', name: 'Román', pin: '1010', groupId: 'G-AMIGOS', points: 12, streak: 4, achievements: ['invicto'], jokersUsedGroup: 0, jokersUsedFinal: 0, jersey: { primaryColor: 'hsl(215, 90%, 35%)', secondaryColor: 'hsl(48, 95%, 50%)', pattern: 'hoops', number: 10 } },
  { id: 'U-ZIZOU', name: 'Zinedine', pin: '0505', groupId: 'G-AMIGOS', points: 8, streak: 2, achievements: ['fiel'], jokersUsedGroup: 1, jokersUsedFinal: 0, jersey: { primaryColor: 'hsl(220, 85%, 45%)', secondaryColor: '#ffffff', pattern: 'solid', number: 5 } },
  { id: 'U-MARA', name: 'Diego', pin: '1986', groupId: 'G-AMIGOS', points: 15, streak: 5, achievements: ['profeta', 'invicto', 'matagigantes'], jokersUsedGroup: 1, jokersUsedFinal: 0, jersey: { primaryColor: 'hsl(198, 90%, 65%)', secondaryColor: '#ffffff', pattern: 'sash', number: 10 } }
];

// Predicciones pre-cargadas para la demo (Partidos M1, M2, M3, M4)
const generateInitialPredictions = (): Prediction[] => {
  return [
    // Lionel
    { id: 'P-L-1', userId: 'U-LIONEL', matchId: 'M1', predictedScoreA: 2, predictedScoreB: 1, isJoker: true, timestamp: new Date().toISOString() },
    { id: 'P-L-2', userId: 'U-LIONEL', matchId: 'M2', predictedScoreA: 1, predictedScoreB: 1, isJoker: false, timestamp: new Date().toISOString() },
    { id: 'P-L-3', userId: 'U-LIONEL', matchId: 'M3', predictedScoreA: 3, predictedScoreB: 0, isJoker: false, timestamp: new Date().toISOString() },
    
    // Neymar
    { id: 'P-N-1', userId: 'U-NEYMAR', matchId: 'M1', predictedScoreA: 1, predictedScoreB: 1, isJoker: false, timestamp: new Date().toISOString() },
    { id: 'P-N-2', userId: 'U-NEYMAR', matchId: 'M2', predictedScoreA: 0, predictedScoreB: 2, isJoker: false, timestamp: new Date().toISOString() },
    
    // Diego (Mara) - Grupo Amigos
    { id: 'P-D-1', userId: 'U-MARA', matchId: 'M1', predictedScoreA: 3, predictedScoreB: 1, isJoker: true, timestamp: new Date().toISOString() },
    { id: 'P-D-2', userId: 'U-MARA', matchId: 'M2', predictedScoreA: 2, predictedScoreB: 0, isJoker: false, timestamp: new Date().toISOString() }
  ];
};

const generateInitialChatMessages = (): ChatMessage[] => {
  return [
    { id: 'C1', groupId: 'G-OFICINA', userId: 'system', userName: 'FIFA 2026', message: '¡Bienvenidos al chat grupal de Oficina Planta Alta! Prepárense para la chicana mundialista. ⚽🔥', timestamp: new Date().toISOString(), type: 'system' },
    { id: 'C2', groupId: 'G-OFICINA', userId: 'U-NEYMAR', userName: 'Neymar Jr', message: '¡Este año el prode es mío! Guarda con mi comodín 😎', timestamp: new Date().toISOString(), type: 'user' },
    { id: 'C3', groupId: 'G-OFICINA', userId: 'U-LIONEL', userName: 'Lionel', message: 'Primero acierta los de fase de grupos Ney jaja 😜', timestamp: new Date().toISOString(), type: 'user' },
    { id: 'C4', groupId: 'G-AMIGOS', userId: 'system', userName: 'FIFA 2026', message: '¡Bienvenidos al chat grupal de Los Pibes de los Jueves! ¿Quién se queda con la copa? 🏆', timestamp: new Date().toISOString(), type: 'system' }
  ];
};

export const dataService = {
  // Inicialización de base de datos local
  initDatabase(): void {
    if (!localStorage.getItem(KEYS.GROUPS)) {
      localStorage.setItem(KEYS.GROUPS, JSON.stringify(INITIAL_GROUPS));
    }
    if (!localStorage.getItem(KEYS.USERS)) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(KEYS.MATCHES)) {
      const matches = [...INITIAL_MATCHES];
      matches[0] = { ...matches[0], scoreA: 2, scoreB: 1, status: 'finished' };
      matches[1] = { ...matches[1], scoreA: 1, scoreB: 1, status: 'finished' };
      localStorage.setItem(KEYS.MATCHES, JSON.stringify(matches));
    }
    if (!localStorage.getItem(KEYS.PREDICTIONS)) {
      localStorage.setItem(KEYS.PREDICTIONS, JSON.stringify(generateInitialPredictions()));
    }
    if (!localStorage.getItem(KEYS.STATE)) {
      localStorage.setItem(KEYS.STATE, JSON.stringify({ simulatedTimeOffset: 0, isAdmin: false }));
    }
    if (!localStorage.getItem(KEYS.CHAT)) {
      localStorage.setItem(KEYS.CHAT, JSON.stringify(generateInitialChatMessages()));
    }
    if (!localStorage.getItem(KEYS.DUELS)) {
      localStorage.setItem(KEYS.DUELS, JSON.stringify([]));
    }
  },

  // Lectura y Escritura de Colecciones
  getGroups(): Group[] {
    this.initDatabase();
    return JSON.parse(localStorage.getItem(KEYS.GROUPS) || '[]');
  },

  saveGroups(groups: Group[]): void {
    localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
  },

  getUsers(): User[] {
    this.initDatabase();
    return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  },

  saveUsers(users: User[]): void {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  getMatches(): Match[] {
    this.initDatabase();
    return JSON.parse(localStorage.getItem(KEYS.MATCHES) || '[]');
  },

  saveMatches(matches: Match[]): void {
    localStorage.setItem(KEYS.MATCHES, JSON.stringify(matches));
  },

  getPredictions(): Prediction[] {
    this.initDatabase();
    return JSON.parse(localStorage.getItem(KEYS.PREDICTIONS) || '[]');
  },

  savePredictions(predictions: Prediction[]): void {
    localStorage.setItem(KEYS.PREDICTIONS, JSON.stringify(predictions));
  },

  getChatMessages(): ChatMessage[] {
    this.initDatabase();
    return JSON.parse(localStorage.getItem(KEYS.CHAT) || '[]');
  },

  saveChatMessages(messages: ChatMessage[]): void {
    localStorage.setItem(KEYS.CHAT, JSON.stringify(messages));
  },

  getSystemState(): SystemState {
    this.initDatabase();
    return JSON.parse(localStorage.getItem(KEYS.STATE) || '{"simulatedTimeOffset":0,"isAdmin":false}');
  },

  saveSystemState(state: SystemState): void {
    localStorage.setItem(KEYS.STATE, JSON.stringify(state));
  },

  getDuels(): Duel[] {
    this.initDatabase();
    return JSON.parse(localStorage.getItem(KEYS.DUELS) || '[]');
  },

  saveDuels(duels: Duel[]): void {
    localStorage.setItem(KEYS.DUELS, JSON.stringify(duels));
  },

  // Operaciones de Limpieza e Inicialización Limpia (Hard Reset)
  resetAll(): void {
    localStorage.removeItem(KEYS.GROUPS);
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.MATCHES);
    localStorage.removeItem(KEYS.PREDICTIONS);
    localStorage.removeItem(KEYS.STATE);
    localStorage.removeItem(KEYS.CHAT);
    localStorage.removeItem(KEYS.DUELS);
    this.initDatabase();
  }
};
export default dataService;
