import type { Match } from '../data/matches2026';

// Generador de hashes deterministicos a partir de strings para resultados constantes
const getDeterministicHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

// Obtiene el resultado final deterministico de un partido si no fue cargado manualmente
export const getDeterministicFinalScore = (match: Match): { scoreA: number; scoreB: number } => {
  const hash = getDeterministicHash(match.id + match.teamA + match.teamB);
  
  // Lógica para que los resultados sean futbolísticos y realistas (promedio de 0 a 4 goles)
  let scoreA = hash % 4;
  let scoreB = (hash >> 3) % 3;

  // Ajustes especiales para que haya empates y partidos con más emoción
  if ((hash % 10) === 0) {
    scoreA = 0;
    scoreB = 0;
  } else if ((hash % 8) === 1) {
    scoreA = 2;
    scoreB = 2;
  } else if (match.teamA === 'ARG' && scoreA < scoreB) {
    // Un poco de favoritismo deportivo demo
    scoreA = scoreB + 1;
  }

  return { scoreA, scoreB };
};

// Calcula los minutos del partido en que se marcarán los goles para la simulación
export const getGoalTimings = (
  matchId: string,
  goalsA: number,
  goalsB: number
): { timingsA: number[]; timingsB: number[] } => {
  const hash = getDeterministicHash(matchId + 'goals');
  
  const getTimes = (count: number, shift: number) => {
    const times: number[] = [];
    for (let i = 0; i < count; i++) {
      // Repartir goles a lo largo de los 90 minutos de forma pseudo-aleatoria
      const minute = 5 + ((hash >> (i + shift)) % 80) + (i * 3);
      times.push(Math.min(89, minute));
    }
    return times.sort((a, b) => a - b);
  };

  return {
    timingsA: getTimes(goalsA, 1),
    timingsB: getTimes(goalsB, 4)
  };
};

export const liveFeedService = {
  // Retorna el estado en vivo calculado de un partido según la hora del sistema
  calculateLiveMatchState(
    match: Match,
    systemTime: Date
  ): {
    status: 'pending' | 'live' | 'finished';
    currentScoreA: number;
    currentScoreB: number;
    gameMinute: number;
    isGoalJustScored: boolean; // Si acaba de ocurrir un gol en este minuto
    goalMessage?: string; // Alerta de gol en el chat
  } {
    const kickoff = new Date(match.date).getTime();
    const now = systemTime.getTime();
    const diffMs = now - kickoff;
    
    // Tiempos en MS
    const matchDurationMs = 110 * 60 * 1000; // 90 mins + 20 mins entretiempo y adiciones

    // Caso 1: Partido no ha comenzado
    if (diffMs < 0) {
      return {
        status: 'pending',
        currentScoreA: match.scoreA ?? 0,
        currentScoreB: match.scoreB ?? 0,
        gameMinute: 0,
        isGoalJustScored: false
      };
    }

    // Obtener marcadores finales deterministicos o los guardados por el admin
    let finalScoreA = match.scoreA;
    let finalScoreB = match.scoreB;
    
    if (finalScoreA === undefined || finalScoreB === undefined) {
      const def = getDeterministicFinalScore(match);
      finalScoreA = def.scoreA;
      finalScoreB = def.scoreB;
    }

    // Caso 2: Partido Finalizado
    if (diffMs >= matchDurationMs) {
      return {
        status: 'finished',
        currentScoreA: finalScoreA,
        currentScoreB: finalScoreB,
        gameMinute: 90,
        isGoalJustScored: false
      };
    }

    // Caso 3: Partido En Curso (LIVE 🔴)
    // Mapear el tiempo transcurrido (0 a 110m) a los minutos oficiales del partido (0 a 90)
    const elapsedMinutes = Math.floor(diffMs / (60 * 1000));
    let gameMinute = Math.min(90, Math.floor(elapsedMinutes * (90 / 110)));
    if (gameMinute < 1) gameMinute = 1;

    // Calcular cuántos goles se han marcado hasta este minuto de juego
    const { timingsA, timingsB } = getGoalTimings(match.id, finalScoreA, finalScoreB);
    
    const liveScoreA = timingsA.filter(t => t <= gameMinute).length;
    const liveScoreB = timingsB.filter(t => t <= gameMinute).length;

    // Verificar si se acaba de marcar un gol exactamente en este minuto
    const isGoalA = timingsA.includes(gameMinute) && elapsedMinutes % 2 === 0; // Evitar duplicar alertas
    const isGoalB = timingsB.includes(gameMinute) && elapsedMinutes % 2 === 0;
    
    let isGoalJustScored = isGoalA || isGoalB;
    let goalMessage = undefined;

    if (isGoalJustScored) {
      const scoringTeam = isGoalA ? match.teamA : match.teamB;
      goalMessage = `⚽ ¡GOL DE ${scoringTeam}! Al minuto ${gameMinute}', anota el gol del partido. Marcador provisional: ${match.teamA} ${liveScoreA} - ${liveScoreB} ${match.teamB} 🔴`;
    }

    return {
      status: 'live',
      currentScoreA: liveScoreA,
      currentScoreB: liveScoreB,
      gameMinute,
      isGoalJustScored,
      goalMessage
    };
  }
};
export default liveFeedService;
