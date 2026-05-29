import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import type { User, Group, Prediction, SystemState, ChatMessage, Duel } from '../services/dataService';
import type { Match } from '../data/matches2026';
import { TEAMS } from '../data/matches2026';
import { liveFeedService } from '../services/liveFeedService';
import { soundService } from '../services/soundService';

interface ProdeContextType {
  currentUser: User | null;
  currentGroup: Group | null;
  users: User[];
  groups: Group[];
  matches: Match[];
  predictions: Prediction[];
  chatMessages: ChatMessage[];
  systemState: SystemState;
  duels: Duel[];
  login: (username: string, pin: string) => boolean;
  logout: () => void;
  registerWithInvite: (username: string, pin: string, inviteToken: string) => boolean;
  saveUserPrediction: (matchId: string, scoreA: number, scoreB: number, isJoker: boolean) => { success: boolean; error?: string; animation?: boolean };
  updateMatchResult: (matchId: string, scoreA: number, scoreB: number, status: 'pending' | 'live' | 'finished') => void;
  getSystemTime: () => Date;
  updateSystemTimeOffset: (minutes: number) => void;
  toggleAdminMode: () => void;
  generateInviteLink: (groupId: string) => string;
  createGroup: (name: string, inviteToken: string) => Group;
  sendChatMessage: (message: string) => void;
  recentAchievementUnlocked: { title: string; desc: string; icon: string } | null;
  clearRecentAchievement: () => void;
  liveSimulatedScores: Record<string, { scoreA: number; scoreB: number }> | null;
  setLiveSimulatedScores: React.Dispatch<React.SetStateAction<Record<string, { scoreA: number; scoreB: number }> | null>>;
  createDuel: (challengedId: string, matchId: string) => { success: boolean; error?: string };
  respondToDuel: (duelId: string, action: 'accept' | 'decline') => void;
  saveUserJersey: (jersey: User['jersey']) => void;
}

const TEAM_CONTINENTS: Record<string, string> = {
  // America
  MEX: 'America', ECU: 'America', CAN: 'America', COL: 'America',
  USA: 'America', URU: 'America', ARG: 'America', BRA: 'America',
  PER: 'America', CRC: 'America', PAN: 'America', JAM: 'America', CHI: 'America',
  // Europa
  POL: 'Europa', SWE: 'Europa', DEN: 'Europa', FRA: 'Europa',
  SUI: 'Europa', GER: 'Europa', ESP: 'Europa', CRO: 'Europa',
  BEL: 'Europa', POR: 'Europa', ENG: 'Europa', NED: 'Europa',
  ITA: 'Europa', UKR: 'Europa', AUT: 'Europa', TUR: 'Europa', WAL: 'Europa',
  // Asia
  KSA: 'Asia', KOR: 'Asia', JPN: 'Asia', IRN: 'Asia', IRQ: 'Asia', QAT: 'Asia',
  // Africa
  CMR: 'Africa', SEN: 'Africa', MAR: 'Africa', GHA: 'Africa',
  TUN: 'Africa', ALG: 'Africa', NGA: 'Africa', EGY: 'Africa', CIV: 'Africa', RSA: 'Africa',
  // Oceania
  NZL: 'Oceania', AUS: 'Oceania'
};

const ProdeContext = createContext<ProdeContextType | undefined>(undefined);

export const ProdeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [systemState, setSystemState] = useState<SystemState>({ simulatedTimeOffset: 0, isAdmin: false });
  const [recentAchievementUnlocked, setRecentAchievementUnlocked] = useState<{ title: string; desc: string; icon: string } | null>(null);
  const [liveSimulatedScores, setLiveSimulatedScores] = useState<Record<string, { scoreA: number; scoreB: number }> | null>(null);
  const [duels, setDuels] = useState<Duel[]>([]);

  // Cargar base de datos inicial al montar
  useEffect(() => {
    dataService.initDatabase();
    setUsers(dataService.getUsers());
    setGroups(dataService.getGroups());
    setPredictions(dataService.getPredictions());
    setChatMessages(dataService.getChatMessages());
    setDuels(dataService.getDuels());
    
    const savedState = dataService.getSystemState();
    setSystemState(savedState);

    // Inicializar partidos evaluando con la hora actual
    const savedMatches = dataService.getMatches();
    const systemTime = new Date(new Date().getTime() + savedState.simulatedTimeOffset);
    const updated = savedMatches.map(m => {
      if (m.status === 'finished' && m.scoreA !== undefined) return m;

      const live = liveFeedService.calculateLiveMatchState(m, systemTime);
      if (live.status !== m.status || live.currentScoreA !== m.scoreA || live.currentScoreB !== m.scoreB) {
        return {
          ...m,
          status: live.status,
          scoreA: live.status !== 'pending' ? live.currentScoreA : undefined,
          scoreB: live.status !== 'pending' ? live.currentScoreB : undefined
        };
      }
      return m;
    });

    setMatches(updated);
    dataService.saveMatches(updated);

    // Auto-login de sesión
    const savedUserId = sessionStorage.getItem('prode_logged_user_id');
    if (savedUserId) {
      const allUsers = dataService.getUsers();
      const user = allUsers.find(u => u.id === savedUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, []);

  const getSystemTime = () => {
    const realTime = new Date();
    return new Date(realTime.getTime() + systemState.simulatedTimeOffset);
  };

  // Helper para desbloquear logros y sonar chime
  const unlockAchievement = (ach: { title: string; desc: string; icon: string }) => {
    setRecentAchievementUnlocked(ach);
    soundService.playAchievement();
  };

  // Hilo de intervalo para actualizar marcadores automáticos en vivo y alertas de goles
  useEffect(() => {
    const interval = setInterval(() => {
      const systemTime = getSystemTime();
      let matchesUpdated = false;
      let pointsNeedRecalculate = false;
      let lastMatchFinishedId = undefined;

      const updated = matches.map(m => {
        if (m.status === 'finished' && m.scoreA !== undefined && !matches.find(orig => orig.id === m.id && orig.status === 'live')) {
          return m;
        }

        const live = liveFeedService.calculateLiveMatchState(m, systemTime);
        
        if (live.status !== m.status || live.currentScoreA !== m.scoreA || live.currentScoreB !== m.scoreB) {
          matchesUpdated = true;

          if (live.status === 'finished' && m.status !== 'finished') {
            pointsNeedRecalculate = true;
            lastMatchFinishedId = m.id;
          }

          if (live.isGoalJustScored && live.goalMessage && currentUser) {
            injectSystemChatMessage(currentUser.groupId, live.goalMessage);
            soundService.playGoal(); // Trigger del sonido de gol en vivo
          }

          return {
            ...m,
            status: live.status,
            scoreA: live.status !== 'pending' ? live.currentScoreA : undefined,
            scoreB: live.status !== 'pending' ? live.currentScoreB : undefined
          };
        }
        return m;
      });

      if (matchesUpdated) {
        setMatches(updated);
        dataService.saveMatches(updated);

        if (pointsNeedRecalculate) {
          recalculatePoints(updated, lastMatchFinishedId);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [matches, currentUser, systemState.simulatedTimeOffset]);

  const updateSystemTimeOffset = (minutes: number) => {
    const offsetMs = minutes * 60 * 1000;
    const newState = { ...systemState, simulatedTimeOffset: offsetMs };
    setSystemState(newState);
    dataService.saveSystemState(newState);

    const savedMatches = dataService.getMatches();
    const systemTime = new Date(new Date().getTime() + offsetMs);
    let lastFinishedId = undefined;

    const updated = savedMatches.map(m => {
      const live = liveFeedService.calculateLiveMatchState(m, systemTime);
      if (live.status !== m.status || live.currentScoreA !== m.scoreA || live.currentScoreB !== m.scoreB) {
        if (live.status === 'finished' && m.status !== 'finished') {
          lastFinishedId = m.id;
        }
        return {
          ...m,
          status: live.status,
          scoreA: live.status !== 'pending' ? live.currentScoreA : undefined,
          scoreB: live.status !== 'pending' ? live.currentScoreB : undefined
        };
      }
      return m;
    });

    setMatches(updated);
    dataService.saveMatches(updated);
    
    recalculatePoints(updated, lastFinishedId);
  };

  const toggleAdminMode = () => {
    const newState = { ...systemState, isAdmin: !systemState.isAdmin };
    setSystemState(newState);
    dataService.saveSystemState(newState);
  };

  const login = (username: string, pin: string): boolean => {
    const foundUser = users.find(
      u => u.name.toLowerCase() === username.toLowerCase() && u.pin === pin
    );
    if (foundUser) {
      setCurrentUser(foundUser);
      sessionStorage.setItem('prode_logged_user_id', foundUser.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('prode_logged_user_id');
  };

  const registerWithInvite = (username: string, pin: string, inviteToken: string): boolean => {
    const targetGroup = groups.find(g => g.inviteToken === inviteToken);
    if (!targetGroup) return false;

    const nameTaken = users.some(
      u => u.name.toLowerCase() === username.toLowerCase() && u.groupId === targetGroup.id
    );
    if (nameTaken) return false;

    const newUser: User = {
      id: `U-${Date.now()}`,
      name: username,
      pin: pin,
      groupId: targetGroup.id,
      points: 0,
      streak: 0,
      achievements: [],
      jokersUsedGroup: 0,
      jokersUsedFinal: 0,
      jersey: {
        primaryColor: '#00d4ff',
        secondaryColor: '#ffffff',
        pattern: 'solid',
        number: 10
      }
    };

    const newUsersList = [...users, newUser];
    setUsers(newUsersList);
    dataService.saveUsers(newUsersList);

    setCurrentUser(newUser);
    sessionStorage.setItem('prode_logged_user_id', newUser.id);

    injectSystemChatMessage(targetGroup.id, `👋 ¡Démosle la bienvenida a ${username} que se acaba de unir al prode del grupo! ⚽🔥`);

    return true;
  };

  const generateInviteLink = (groupId: string): string => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return '';
    return `${window.location.origin}${window.location.pathname}?invite=${group.inviteToken}`;
  };

  const createGroup = (name: string, inviteToken: string): Group => {
    const newGroup: Group = {
      id: `G-${Date.now()}`,
      name,
      inviteToken: inviteToken || `invite-${Math.random().toString(36).substring(2, 7)}`
    };
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    dataService.saveGroups(updatedGroups);
    return newGroup;
  };

  const injectSystemChatMessage = (groupId: string, message: string) => {
    const newMsg: ChatMessage = {
      id: `C-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      groupId,
      userId: 'system',
      userName: 'FIFA 2026',
      message,
      timestamp: getSystemTime().toISOString(),
      type: 'system'
    };

    setChatMessages(prev => {
      const updated = [...prev, newMsg];
      dataService.saveChatMessages(updated);
      return updated;
    });
  };

  const sendChatMessage = (message: string) => {
    if (!currentUser) return;
    const newMsg: ChatMessage = {
      id: `C-${Date.now()}`,
      groupId: currentUser.groupId,
      userId: currentUser.id,
      userName: currentUser.name,
      message,
      timestamp: getSystemTime().toISOString(),
      type: 'user'
    };

    setChatMessages(prev => {
      const updated = [...prev, newMsg];
      dataService.saveChatMessages(updated);
      return updated;
    });
  };

  // Guardar o modificar predicción
  const saveUserPrediction = (
    matchId: string,
    scoreA: number,
    scoreB: number,
    isJoker: boolean
  ): { success: boolean; error?: string; animation?: boolean } => {
    if (!currentUser) return { success: false, error: 'Inicia sesión para guardar tu predicción.' };

    const match = matches.find(m => m.id === matchId);
    if (!match) return { success: false, error: 'Partido no encontrado.' };

    const matchKickoff = new Date(match.date).getTime();
    const systemTime = getSystemTime().getTime();
    const oneHourInMs = 60 * 60 * 1000;

    if (matchKickoff - systemTime <= oneHourInMs) {
      return { success: false, error: 'La predicción está bloqueada. Cerró 1 hora antes del partido.' };
    }

    const isFinalPhase = ['Dieciseisavos', 'Octavos', 'Cuartos', 'Semifinal', 'Tercer Puesto', 'Final'].includes(match.phase);
    
    if (isJoker) {
      if (isFinalPhase && currentUser.jokersUsedFinal >= 1) {
        const existingPred = predictions.find(p => p.userId === currentUser.id && p.matchId === matchId);
        if (!existingPred || !existingPred.isJoker) {
          return { success: false, error: 'Ya usaste tu comodín para la fase final.' };
        }
      } else if (!isFinalPhase && currentUser.jokersUsedGroup >= 1) {
        const existingPred = predictions.find(p => p.userId === currentUser.id && p.matchId === matchId);
        if (!existingPred || !existingPred.isJoker) {
          return { success: false, error: 'Ya usaste tu comodín para la fase de grupos.' };
        }
      }
    }

    const updatedPredictions = [...predictions];
    const predictionIdx = updatedPredictions.findIndex(
      p => p.userId === currentUser.id && p.matchId === matchId
    );

    let predWasJoker = false;
    if (predictionIdx >= 0) {
      predWasJoker = updatedPredictions[predictionIdx].isJoker;
      updatedPredictions[predictionIdx] = {
        ...updatedPredictions[predictionIdx],
        predictedScoreA: scoreA,
        predictedScoreB: scoreB,
        isJoker,
        timestamp: getSystemTime().toISOString()
      };
    } else {
      updatedPredictions.push({
        id: `P-${Date.now()}`,
        userId: currentUser.id,
        matchId,
        predictedScoreA: scoreA,
        predictedScoreB: scoreB,
        isJoker,
        timestamp: getSystemTime().toISOString()
      });
    }

    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        let jokersUsedGroup = u.jokersUsedGroup;
        let jokersUsedFinal = u.jokersUsedFinal;

        if (isJoker && !predWasJoker) {
          if (isFinalPhase) jokersUsedFinal += 1;
          else jokersUsedGroup += 1;
        } else if (!isJoker && predWasJoker) {
          if (isFinalPhase) jokersUsedFinal = Math.max(0, jokersUsedFinal - 1);
          else jokersUsedGroup = Math.max(0, jokersUsedGroup - 1);
        }

        const newAchievements = [...u.achievements];
        if (isJoker && !newAchievements.includes('apuestaTodo')) {
          newAchievements.push('apuestaTodo');
          unlockAchievement({
            title: 'All-In',
            desc: 'Usaste tu primer comodín en un partido.',
            icon: 'star'
          });
        }

        const timeDiff = matchKickoff - systemTime;
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (timeDiff >= twentyFourHours && !newAchievements.includes('fiel')) {
          newAchievements.push('fiel');
          unlockAchievement({
            title: 'Ticket Holográfico',
            desc: 'Guardaste una predicción con más de 24 horas de antelación.',
            icon: 'ticket'
          });
        }

        const updated = { ...u, jokersUsedGroup, jokersUsedFinal, achievements: newAchievements };
        setCurrentUser(updated);
        return updated;
      }
      return u;
    });

    setPredictions(updatedPredictions);
    setUsers(updatedUsers);
    dataService.savePredictions(updatedPredictions);
    dataService.saveUsers(updatedUsers);

    // Reproducir silbato de árbitro ante el cambio de predicción
    soundService.playWhistle();

    return { success: true, animation: true };
  };

  const recalculatePoints = (updatedMatchesList: Match[], triggerMatchId?: string) => {
    const allPredictions = dataService.getPredictions();
    const allUsers = dataService.getUsers();

    const previousLeaders: Record<string, string> = {};
    const groupIds = Array.from(new Set(allUsers.map(u => u.groupId)));
    
    groupIds.forEach(gId => {
      const sorted = [...allUsers].filter(u => u.groupId === gId).sort((a,b) => b.points - a.points);
      if (sorted.length > 0) {
        previousLeaders[gId] = sorted[0].id;
      }
    });

    const finishedMatches = [...updatedMatchesList]
      .filter(m => m.status === 'finished')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const recalculatedUsers = allUsers.map(user => {
      let totalPoints = 0;
      let currentStreak = 0;
      let maxStreak = 0;
      let exactMatchesCount = 0;
      let winnerCorrectCount = 0;
      let hasCeroACero = false;
      let hasMatagigantes = false;
      let hasFrancotirador = false;
      let hasDobleComodin = false;
      const correctContinents = new Set<string>();

      finishedMatches.forEach(match => {
        const pred = allPredictions.find(p => p.userId === user.id && p.matchId === match.id);
        if (!pred) {
          currentStreak = 0;
          return;
        }

        const realA = match.scoreA!;
        const realB = match.scoreB!;
        const predA = pred.predictedScoreA;
        const predB = pred.predictedScoreB;

        const isExact = realA === predA && realB === predB;
        const isWinnerCorrect =
          (realA > realB && predA > predB) ||
          (realA < realB && predA < predB) ||
          (realA === realB && predA === predB);

        let pointsEarned = 0;

        if (isExact) {
          pointsEarned = 3;
          exactMatchesCount++;
        } else if (isWinnerCorrect) {
          pointsEarned = 1;
        }

        if (pred.isJoker) {
          pointsEarned *= 2;
        }

        if (isWinnerCorrect) {
          winnerCorrectCount++;
          const winningTeam = realA > realB ? match.teamA : (realA < realB ? match.teamB : null);
          if (winningTeam) {
            const continent = TEAM_CONTINENTS[winningTeam];
            if (continent) {
              correctContinents.add(continent);
            }
          }
        }

        if (isExact && realA === 0 && realB === 0) {
          hasCeroACero = true;
        }

        if (pred.isJoker && pointsEarned > 0) {
          hasDobleComodin = true;
        }

        if (isExact && (realA + realB >= 4)) {
          hasFrancotirador = true;
        }

        const underdogWins = 
          (match.teamA === 'KSA' && realA > realB && ['ARG', 'FRA', 'BRA', 'GER', 'ESP'].includes(match.teamB)) ||
          (match.teamB === 'KSA' && realB > realA && ['ARG', 'FRA', 'BRA', 'GER', 'ESP'].includes(match.teamA)) ||
          (match.teamA === 'JAM' && realA > realB && ['ARG', 'FRA', 'BRA', 'GER', 'ESP'].includes(match.teamB)) ||
          (match.teamB === 'JAM' && realB > realA && ['ARG', 'FRA', 'BRA', 'GER', 'ESP'].includes(match.teamA));
        
        if (underdogWins && isWinnerCorrect) {
          hasMatagigantes = true;
        }

        if (pointsEarned > 0) {
          if (currentStreak >= 3) {
            pointsEarned += 1;
          }
          currentStreak++;
          if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
          currentStreak = 0;
        }

        totalPoints += pointsEarned;
      });

      const achievements = [...user.achievements];
      
      // primerGol
      if (winnerCorrectCount >= 1 && !achievements.includes('primerGol')) {
        achievements.push('primerGol');
        if (currentUser && user.id === currentUser.id) {
          unlockAchievement({
            title: 'Primer Gol',
            desc: 'Acertaste el ganador de un partido por primera vez.',
            icon: 'net'
          });
        }
      }

      // ceroACero
      if (hasCeroACero && !achievements.includes('ceroACero')) {
        achievements.push('ceroACero');
        if (currentUser && user.id === currentUser.id) {
          unlockAchievement({
            title: 'Muro Infranqueable',
            desc: 'Predeciste correctamente un empate 0-0.',
            icon: 'gloves'
          });
        }
      }

      // invicto
      if (maxStreak >= 3 && !achievements.includes('invicto')) {
        achievements.push('invicto');
        if (currentUser && user.id === currentUser.id) {
          unlockAchievement({
            title: 'Silbato de Oro',
            desc: 'Encadenaste una Racha de Fuego de 3 partidos sumando puntos.',
            icon: 'whistle'
          });
        }
      }

      // francotirador
      if (hasFrancotirador && !achievements.includes('francotirador')) {
        achievements.push('francotirador');
        if (currentUser && user.id === currentUser.id) {
          unlockAchievement({
            title: 'Botín de Oro',
            desc: 'Acertaste un resultado exacto con 4 o más goles.',
            icon: 'boot'
          });
        }
      }

      // matagigantes
      if (hasMatagigantes && !achievements.includes('matagigantes')) {
        achievements.push('matagigantes');
        if (currentUser && user.id === currentUser.id) {
          unlockAchievement({
            title: 'Escudo del León',
            desc: 'Predeciste la victoria de un equipo débil frente a una potencia.',
            icon: 'shield'
          });
        }
      }

      // goleador
      if (winnerCorrectCount >= 5 && !achievements.includes('goleador')) {
        achievements.push('goleador');
        if (currentUser && user.id === currentUser.id) {
          unlockAchievement({
            title: 'Máquina de Goles',
            desc: 'Acertaste 5 ganadores correctos en total.',
            icon: 'rocket'
          });
        }
      }

      // dobleComodin
      if (hasDobleComodin && !achievements.includes('dobleComodin')) {
        achievements.push('dobleComodin');
        if (currentUser && user.id === currentUser.id) {
          unlockAchievement({
            title: 'Jugador de Póker',
            desc: 'Ganaste puntos dobles con un comodín activo.',
            icon: 'lightning'
          });
        }
      }

      // profeta
      if (exactMatchesCount >= 3 && !achievements.includes('profeta')) {
        achievements.push('profeta');
        if (currentUser && user.id === currentUser.id) {
          unlockAchievement({
            title: 'Pelota de Cristal',
            desc: 'Lograste 3 aciertos exactos de marcadores en el prode.',
            icon: 'crystal'
          });
        }
      }

      // rachaFuego
      if (maxStreak >= 5 && !achievements.includes('rachaFuego')) {
        achievements.push('rachaFuego');
        if (currentUser && user.id === currentUser.id) {
          unlockAchievement({
            title: 'Racha Infernal',
            desc: 'Encadenaste una racha de 5 o más partidos acertando.',
            icon: 'flame'
          });
        }
      }

      // globalista
      if (correctContinents.size >= 4 && !achievements.includes('globalista')) {
        achievements.push('globalista');
        if (currentUser && user.id === currentUser.id) {
          unlockAchievement({
            title: 'Trotamundos',
            desc: 'Acertaste ganadores de 4 continentes diferentes.',
            icon: 'globe'
          });
        }
      }

      // leyenda
      if (exactMatchesCount >= 5 && !achievements.includes('leyenda')) {
        achievements.push('leyenda');
        if (currentUser && user.id === currentUser.id) {
          unlockAchievement({
            title: 'Leyenda Absoluta',
            desc: 'Acertaste 5 marcadores exactos en el prode.',
            icon: 'crown'
          });
        }
      }

      // diamante
      if (totalPoints >= 30 && !achievements.includes('diamante')) {
        achievements.push('diamante');
        if (currentUser && user.id === currentUser.id) {
          unlockAchievement({
            title: 'Diamante Eterno',
            desc: 'Acumulaste 30 o más puntos en el prode.',
            icon: 'diamond'
          });
        }
      }

      return {
        ...user,
        points: totalPoints,
        streak: currentStreak,
        achievements
      };
    });

    const finalRecalculatedUsers = groupIds.flatMap(gId => {
      const sortedInGroup = recalculatedUsers.filter(u => u.groupId === gId).sort((a, b) => b.points - a.points);
      return sortedInGroup.map((u, index) => {
        const achievements = [...u.achievements];
        if (index < 3 && !achievements.includes('top3')) {
          achievements.push('top3');
          if (currentUser && u.id === currentUser.id) {
            unlockAchievement({
              title: 'Podio Mundial',
              desc: 'Alcanzaste el Top 3 de tu grupo en el leaderboard.',
              icon: 'medal'
            });
          }
        }
        const updatedUser = {
          ...u,
          achievements
        };

        if (currentUser && u.id === currentUser.id) {
          setCurrentUser(prev => prev ? { ...prev, points: updatedUser.points, streak: updatedUser.streak, achievements: updatedUser.achievements } : null);
        }
        return updatedUser;
      });
    });

    setUsers(finalRecalculatedUsers);
    dataService.saveUsers(finalRecalculatedUsers);

    // Resoluciones de Duelos 1v1
    const currentDuels = dataService.getDuels();
    let duelsUpdated = false;
    const resolvedDuels = currentDuels.map(d => {
      if (d.status !== 'accepted') return d;
      const match = updatedMatchesList.find(m => m.id === d.matchId);
      if (!match || match.status !== 'finished') return d;

      duelsUpdated = true;

      const calcPointsForPred = (userId: string) => {
        const pred = allPredictions.find(p => p.userId === userId && p.matchId === d.matchId);
        if (!pred) return 0;
        const realA = match.scoreA!;
        const realB = match.scoreB!;
        const predA = pred.predictedScoreA;
        const predB = pred.predictedScoreB;
        const isExact = realA === predA && realB === predB;
        const isWinner = (realA > realB && predA > predB) || (realA < realB && predA < predB) || (realA === realB && predA === predB);
        let pts = isExact ? 3 : (isWinner ? 1 : 0);
        if (pred.isJoker) pts *= 2;
        return pts;
      };

      const pointsChallenger = calcPointsForPred(d.challengerId);
      const pointsChallenged = calcPointsForPred(d.challengedId);

      let winnerId: string;
      if (pointsChallenger > pointsChallenged) winnerId = d.challengerId;
      else if (pointsChallenger < pointsChallenged) winnerId = d.challengedId;
      else winnerId = 'draw';

      const challengerName = finalRecalculatedUsers.find(u => u.id === d.challengerId)?.name || 'Retador';
      const challengedName = finalRecalculatedUsers.find(u => u.id === d.challengedId)?.name || 'Retado';
      const teamAName = TEAMS[match.teamA]?.name || match.teamA;
      const teamBName = TEAMS[match.teamB]?.name || match.teamB;

      if (winnerId === 'draw') {
        injectSystemChatMessage(
          finalRecalculatedUsers.find(u => u.id === d.challengerId)?.groupId || '',
          `🤝 [Duelo] Empate entre ${challengerName} (${pointsChallenger} pts) y ${challengedName} (${pointsChallenged} pts) en el partido ${teamAName} vs ${teamBName}.`
        );
      } else {
        const winnerName = winnerId === d.challengerId ? challengerName : challengedName;
        const loserName = winnerId === d.challengerId ? challengedName : challengerName;
        const winnerPts = winnerId === d.challengerId ? pointsChallenger : pointsChallenged;
        const loserPts = winnerId === d.challengerId ? pointsChallenged : pointsChallenger;
        injectSystemChatMessage(
          finalRecalculatedUsers.find(u => u.id === d.challengerId)?.groupId || '',
          `🏆 [Duelo] ¡${winnerName} (${winnerPts} Pts) venció a ${loserName} (${loserPts} Pts) en el partido ${teamAName} vs ${teamBName}! ⚔️`
        );
      }

      return {
        ...d,
        status: 'completed',
        winnerId
      } as Duel;
    });

    if (duelsUpdated) {
      setDuels(resolvedDuels);
      dataService.saveDuels(resolvedDuels);
    }

    if (triggerMatchId) {
      const match = updatedMatchesList.find(m => m.id === triggerMatchId);
      if (match) {
        finalRecalculatedUsers.forEach(u => {
          const pred = allPredictions.find(p => p.userId === u.id && p.matchId === match.id);
          if (pred && pred.predictedScoreA === match.scoreA && pred.predictedScoreB === match.scoreB) {
            injectSystemChatMessage(u.groupId, `🎯 ¡${u.name} clavó el resultado exacto en ${match.teamA} ${match.scoreA}-${match.scoreB} ${match.teamB}! Se lleva +${pred.isJoker ? 6 : 3} Puntos. 🔥`);
          }
        });

        groupIds.forEach(gId => {
          const prevLeaderId = previousLeaders[gId];
          const sortedNew = [...finalRecalculatedUsers].filter(u => u.groupId === gId).sort((a,b) => b.points - a.points);
          if (sortedNew.length > 0 && prevLeaderId && sortedNew[0].id !== prevLeaderId) {
            const oldLeader = finalRecalculatedUsers.find(u => u.id === prevLeaderId);
            injectSystemChatMessage(gId, `🚨 ¡${sortedNew[0].name} le acaba de arrebatar el trono a ${oldLeader?.name || 'su rival'} en la tabla de posiciones! 👑🔥`);
          }
        });
      }
    }
  };

  const updateMatchResult = (
    matchId: string,
    scoreA: number,
    scoreB: number,
    status: 'pending' | 'live' | 'finished'
  ) => {
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        return { ...m, scoreA, scoreB, status };
      }
      return m;
    });

    setMatches(updatedMatches);
    dataService.saveMatches(updatedMatches);

    if (status === 'finished') {
      recalculatePoints(updatedMatches, matchId);
    }
  };

  const createDuel = (challengedId: string, matchId: string): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Inicia sesión para crear un duelo.' };
    if (currentUser.id === challengedId) return { success: false, error: 'No puedes desafiarte a ti mismo.' };

    const matchObj = matches.find(m => m.id === matchId);
    if (!matchObj) return { success: false, error: 'Partido no encontrado.' };

    const matchKickoff = new Date(matchObj.date).getTime();
    const systemTime = getSystemTime().getTime();
    if (matchKickoff - systemTime <= 60 * 60 * 1000) {
      return { success: false, error: 'El partido cierra en menos de una hora o ya empezó.' };
    }

    const existing = duels.find(d => 
      ((d.challengerId === currentUser.id && d.challengedId === challengedId) ||
       (d.challengerId === challengedId && d.challengedId === currentUser.id)) &&
      d.matchId === matchId && d.status !== 'declined'
    );
    if (existing) return { success: false, error: 'Ya existe un duelo pendiente o activo con este jugador para este partido.' };

    const newDuel: Duel = {
      id: `D-${Date.now()}`,
      matchId,
      challengerId: currentUser.id,
      challengedId,
      status: 'pending',
      timestamp: getSystemTime().toISOString()
    };

    const updated = [...duels, newDuel];
    setDuels(updated);
    dataService.saveDuels(updated);

    const challengedName = users.find(u => u.id === challengedId)?.name || 'Rival';
    const teamAName = TEAMS[matchObj.teamA]?.name || matchObj.teamA;
    const teamBName = TEAMS[matchObj.teamB]?.name || matchObj.teamB;
    injectSystemChatMessage(currentUser.groupId, `⚔️ [Duelo] ¡${currentUser.name} ha desafiado a ${challengedName} en el partido ${teamAName} vs ${teamBName}!`);

    return { success: true };
  };

  const respondToDuel = (duelId: string, action: 'accept' | 'decline') => {
    const updated = duels.map(d => {
      if (d.id !== duelId) return d;
      
      const matchObj = matches.find(m => m.id === d.matchId);
      const teamAName = TEAMS[matchObj?.teamA || '']?.name || 'Local';
      const teamBName = TEAMS[matchObj?.teamB || '']?.name || 'Visitante';
      const challengerName = users.find(u => u.id === d.challengerId)?.name || 'Retador';
      const challengedName = users.find(u => u.id === d.challengedId)?.name || 'Retado';

      const groupOfDuel = users.find(u => u.id === d.challengerId)?.groupId || currentUser?.groupId || '';
      if (action === 'accept') {
        injectSystemChatMessage(groupOfDuel, `⚔️ [Duelo] ¡${challengedName} aceptó el desafío de ${challengerName} en el partido ${teamAName} vs ${teamBName}! ¡Que gane el mejor! ⚽🔥`);
        return { ...d, status: 'accepted' } as Duel;
      } else {
        injectSystemChatMessage(groupOfDuel, `🏳️ [Duelo] ${challengedName} arrugó y rechazó el desafío de ${challengerName} en el partido ${teamAName} vs ${teamBName}. 😜`);
        return { ...d, status: 'declined' } as Duel;
      }
    });

    setDuels(updated);
    dataService.saveDuels(updated);
  };

  const saveUserJersey = (jersey: User['jersey']) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, jersey };
    setCurrentUser(updatedUser);

    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    dataService.saveUsers(updatedUsers);
  };

  const clearRecentAchievement = () => {
    setRecentAchievementUnlocked(null);
  };

  const currentGroup = currentUser
    ? groups.find(g => g.id === currentUser.groupId) || null
    : null;

  return (
    <ProdeContext.Provider
      value={{
        currentUser,
        currentGroup,
        users,
        groups,
        matches,
        predictions,
        chatMessages,
        systemState,
        duels,
        login,
        logout,
        registerWithInvite,
        saveUserPrediction,
        updateMatchResult,
        getSystemTime,
        updateSystemTimeOffset,
        toggleAdminMode,
        generateInviteLink,
        createGroup,
        sendChatMessage,
        recentAchievementUnlocked,
        clearRecentAchievement,
        liveSimulatedScores,
        setLiveSimulatedScores,
        createDuel,
        respondToDuel,
        saveUserJersey
      }}
    >
      {children}
    </ProdeContext.Provider>
  );
};

export const useProde = () => {
  const context = useContext(ProdeContext);
  if (!context) throw new Error('useProde debe usarse dentro de un ProdeProvider');
  return context;
};
