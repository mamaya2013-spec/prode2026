import React, { useState, useEffect } from 'react';
import { useProde } from '../context/ProdeContext';
import ShieldSvg from './ShieldSvg';
import { BADGES } from './Achievements';
import { TEAMS } from '../data/matches2026';
import JerseySvg from './JerseySvg';

interface UserPerformanceProps {
  onNavigate?: (tab: 'dashboard' | 'standings' | 'matches' | 'medals' | 'group' | 'admin' | 'chat') => void;
}

export const UserPerformance: React.FC<UserPerformanceProps> = ({ onNavigate }) => {
  const { currentUser, predictions, matches, users, sendChatMessage } = useProde();
  const [mode, setMode] = useState<'points' | 'achievements'>('points');
  const [activeSubTab, setActiveSubTab] = useState<'resumen' | 'rivales' | 'chicanas' | 'duelos'>('resumen');
  const [selectedCategory, setSelectedCategory] = useState<'exact' | 'simple' | 'wrong' | null>(null);
  const [chicanaSuccess, setChicanaSuccess] = useState<string | null>(null);
  const [selectedRivalId, setSelectedRivalId] = useState<string>('');
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [duelSuccess, setDuelSuccess] = useState<string | null>(null);
  const [duelError, setDuelError] = useState<string | null>(null);

  const { duels, createDuel, respondToDuel, getSystemTime } = useProde();

  useEffect(() => {
    const handleNavigate = () => {
      setActiveSubTab('duelos');
    };
    window.addEventListener('navigate_to_duelos', handleNavigate);
    return () => window.removeEventListener('navigate_to_duelos', handleNavigate);
  }, []);

  useEffect(() => {
    const preId = sessionStorage.getItem('challenge_target_user_id');
    if (preId) {
      setSelectedRivalId(preId);
      sessionStorage.removeItem('challenge_target_user_id');
    }
  }, [activeSubTab]);

  if (!currentUser) return null;

  // Filtrar predicciones del usuario sobre partidos finalizados
  const userPreds = predictions.filter(p => p.userId === currentUser.id);
  const finishedMatches = matches.filter(m => m.status === 'finished');
  
  let totalPredictedFinished = 0;
  let exactCount = 0;
  let simpleCount = 0;

  userPreds.forEach(pred => {
    const match = finishedMatches.find(m => m.id === pred.matchId);
    if (match) {
      totalPredictedFinished++;
      const realA = match.scoreA!;
      const realB = match.scoreB!;
      const predA = pred.predictedScoreA;
      const predB = pred.predictedScoreB;

      if (realA === predA && realB === predB) {
        exactCount++;
      } else if (
        (realA > realB && predA > predB) ||
        (realA < realB && predA < predB) ||
        (realA === realB && predA === predB)
      ) {
        simpleCount++;
      }
    }
  });

  const wrongCount = totalPredictedFinished - exactCount - simpleCount;
  const successCount = exactCount + simpleCount;
  const efficiency = totalPredictedFinished > 0 
    ? Math.round((successCount / totalPredictedFinished) * 100) 
    : 0;

  // Buscar posición del ranking del grupo (filtrado por el modo de juego o logros)
  const groupCompetitors = users
    .filter(u => u.groupId === currentUser.groupId)
    .sort((a, b) => {
      if (mode === 'achievements') {
        if (b.achievements.length !== a.achievements.length) {
          return b.achievements.length - a.achievements.length;
        }
        return b.points - a.points;
      } else {
        if (b.points !== a.points) return b.points - a.points;
        return b.streak - a.streak;
      }
    });
  
  const currentRank = groupCompetitors.findIndex(u => u.id === currentUser.id) + 1;

  // Comodines disponibles
  const groupJokerLeft = 1 - currentUser.jokersUsedGroup;
  const finalJokerLeft = 1 - currentUser.jokersUsedFinal;

  // Calcular tendencias de equipos preferidos/odiados en predicciones
  const teamWinCounts: Record<string, number> = {};
  const teamLossCounts: Record<string, number> = {};

  userPreds.forEach(pred => {
    const match = matches.find(m => m.id === pred.matchId);
    if (!match) return;
    const scoreA = pred.predictedScoreA;
    const scoreB = pred.predictedScoreB;
    if (scoreA > scoreB) {
      teamWinCounts[match.teamA] = (teamWinCounts[match.teamA] || 0) + 1;
      teamLossCounts[match.teamB] = (teamLossCounts[match.teamB] || 0) + 1;
    } else if (scoreA < scoreB) {
      teamWinCounts[match.teamB] = (teamWinCounts[match.teamB] || 0) + 1;
      teamLossCounts[match.teamA] = (teamLossCounts[match.teamA] || 0) + 1;
    }
  });

  let favoriteTeamId = '';
  let maxWins = 0;
  Object.entries(teamWinCounts).forEach(([teamId, wins]) => {
    if (wins > maxWins) {
      maxWins = wins;
      favoriteTeamId = teamId;
    }
  });

  let leastFavoriteTeamId = '';
  let maxLosses = 0;
  Object.entries(teamLossCounts).forEach(([teamId, losses]) => {
    if (losses > maxLosses) {
      maxLosses = losses;
      leastFavoriteTeamId = teamId;
    }
  });

  // Encontrar la lista de partidos de la categoría seleccionada en el gráfico interactivo
  const getSelectedMatches = () => {
    if (!selectedCategory) return [];
    return userPreds.filter(pred => {
      const match = finishedMatches.find(m => m.id === pred.matchId);
      if (!match) return false;
      const realA = match.scoreA!;
      const realB = match.scoreB!;
      const predA = pred.predictedScoreA;
      const predB = pred.predictedScoreB;

      const isExact = realA === predA && realB === predB;
      const isSimple = !isExact && (
        (realA > realB && predA > predB) ||
        (realA < realB && predA < predB) ||
        (realA === realB && predA === predB)
      );
      const isWrong = !isExact && !isSimple;

      if (selectedCategory === 'exact') return isExact;
      if (selectedCategory === 'simple') return isSimple;
      return isWrong;
    }).map(pred => {
      const match = matches.find(m => m.id === pred.matchId)!;
      return { match, pred };
    });
  };

  // Rivales directos
  const userIndex = groupCompetitors.findIndex(u => u.id === currentUser.id);
  const rivalsToShow: { user: typeof currentUser; relativePos: number; rank: number }[] = [];
  if (userIndex > 0) {
    rivalsToShow.push({ user: groupCompetitors[userIndex - 1], relativePos: -1, rank: userIndex });
  }
  rivalsToShow.push({ user: currentUser, relativePos: 0, rank: userIndex + 1 });
  if (userIndex < groupCompetitors.length - 1) {
    rivalsToShow.push({ user: groupCompetitors[userIndex + 1], relativePos: 1, rank: userIndex + 2 });
  }

  // Lista de chicanas disponibles para chatear
  const BANTER_PHRASES = [
    `¡Tiemblen todos! Mi efectividad es del ${efficiency}% y voy derechito a la cima 🚀🔥`,
    `¿Quién de ustedes compró el VAR hoy? Sospechosos resultados... 🧐⚽`,
    `¡A paso firme! Con una racha de ${currentUser.streak} partidos invicto, no me para nadie 🏃💨`,
    `Tengo el comodín listo para la fase final. El que tenga miedo de morir, que no nazca 🎟️🏆`,
    `¿Qué pasó ahí abajo? Hace frío a la sombra de mi posición #${currentRank} ❄️👑`
  ];

  const handlePostBanter = (phrase: string) => {
    sendChatMessage(phrase);
    setChicanaSuccess("¡Chicana enviada al chat grupal! 🗣️");
    setTimeout(() => setChicanaSuccess(null), 4000);
  };

  // Calcular porcentajes para la barra de efectividad
  const total = Math.max(1, totalPredictedFinished);
  const exactPct = (exactCount / total) * 100;
  const simplePct = (simpleCount / total) * 100;
  const wrongPct = (wrongCount / total) * 100;

  // Círculo de racha
  const highestStreakInGroup = Math.max(...groupCompetitors.map(u => u.streak), 1);
  const streakPercentage = Math.min(100, (currentUser.streak / highestStreakInGroup) * 100);

  const selectedMatchesList = getSelectedMatches();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="page-swipe">
      
      {/* ────────────────── SECCIÓN 1: BIENVENIDA Y RESUMEN RÁPIDO ────────────────── */}
      <div 
        className="glass-panel" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '1.25rem',
          background: 'linear-gradient(135deg, hsla(240, 45%, 12%, 0.85) 0%, hsla(240, 35%, 8%, 0.95) 100%)',
          borderLeft: '4px solid var(--color-primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div 
            style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              background: 'var(--gradient-neon)', 
              color: 'var(--color-text-dark)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 900,
              fontSize: '1.3rem',
              fontFamily: 'var(--font-sporty)',
              boxShadow: 'var(--glass-shadow-primary)'
            }}
          >
            {currentUser.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>¡Hola, {currentUser.name}!</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Cancha lista 🏟️ • Grupo {currentRank}° lugar {mode === 'achievements' ? 'en Logros 🏅' : 'en Puntos 🏆'}
            </span>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div className="sport-font text-neon-yellow" style={{ fontSize: '1.6rem', fontWeight: 900 }}>
            {mode === 'achievements' ? currentUser.achievements.length : currentUser.points}
          </div>
          <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            {mode === 'achievements' ? 'Logros Obtenidos' : 'Puntos Totales'}
          </span>
        </div>
      </div>

      {/* SELECTOR GLOBAL DE MODO (PUNTOS VS LOGROS) */}
      <div 
        style={{ 
          display: 'flex', 
          background: 'hsla(240, 35%, 8%, 0.6)', 
          borderRadius: '8px', 
          padding: '0.2rem',
          border: '1px solid hsla(0,0%,100%,0.04)',
          marginTop: '-0.25rem'
        }}
      >
        <button
          onClick={() => setMode('points')}
          className="sport-font"
          style={{
            flex: 1,
            background: mode === 'points' ? 'var(--gradient-neon)' : 'none',
            color: mode === 'points' ? 'var(--color-text-dark)' : 'var(--color-text-muted)',
            border: 'none',
            padding: '0.45rem 0',
            borderRadius: '6px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            boxShadow: mode === 'points' ? '0 0 8px var(--color-primary)' : 'none'
          }}
        >
          🏆 Tabla de Puntos
        </button>
        <button
          onClick={() => setMode('achievements')}
          className="sport-font"
          style={{
            flex: 1,
            background: mode === 'achievements' ? 'var(--gradient-neon)' : 'none',
            color: mode === 'achievements' ? 'var(--color-text-dark)' : 'var(--color-text-muted)',
            border: 'none',
            padding: '0.45rem 0',
            borderRadius: '6px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            boxShadow: mode === 'achievements' ? '0 0 8px var(--color-primary)' : 'none'
          }}
        >
          🏅 Competencia de Logros
        </button>
      </div>

      {/* ────────────────── SECCIÓN 2: SELECTOR DE TABS INTERNOS ────────────────── */}
      <div 
        style={{ 
          display: 'flex', 
          background: 'hsla(240, 35%, 8%, 0.6)', 
          borderRadius: '8px', 
          padding: '0.25rem',
          border: '1px solid hsla(0,0%,100%,0.04)'
        }}
      >
        <button
          onClick={() => setActiveSubTab('resumen')}
          className="sport-font"
          style={{
            flex: 1,
            background: activeSubTab === 'resumen' ? 'var(--gradient-neon)' : 'none',
            color: activeSubTab === 'resumen' ? 'var(--color-text-dark)' : 'var(--color-text-muted)',
            border: 'none',
            padding: '0.5rem 0',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease'
          }}
        >
          📊 Resumen
        </button>
        <button
          onClick={() => setActiveSubTab('rivales')}
          className="sport-font"
          style={{
            flex: 1,
            background: activeSubTab === 'rivales' ? 'var(--gradient-neon)' : 'none',
            color: activeSubTab === 'rivales' ? 'var(--color-text-dark)' : 'var(--color-text-muted)',
            border: 'none',
            padding: '0.5rem 0',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease'
          }}
        >
          ⚔️ Rivalidades
        </button>
        <button
          onClick={() => setActiveSubTab('chicanas')}
          className="sport-font"
          style={{
            flex: 1,
            background: activeSubTab === 'chicanas' ? 'var(--gradient-neon)' : 'none',
            color: activeSubTab === 'chicanas' ? 'var(--color-text-dark)' : 'var(--color-text-muted)',
            border: 'none',
            padding: '0.5rem 0',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease'
          }}
        >
          💬 Chicanas
        </button>
        <button
          onClick={() => setActiveSubTab('duelos')}
          className="sport-font"
          style={{
            flex: 1,
            background: activeSubTab === 'duelos' ? 'var(--gradient-neon)' : 'none',
            color: activeSubTab === 'duelos' ? 'var(--color-text-dark)' : 'var(--color-text-muted)',
            border: 'none',
            padding: '0.5rem 0',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease'
          }}
        >
          ⚔️ Duelos
        </button>
      </div>

      {/* ────────────────── CONTENIDO: TAB 1: RESUMEN GRÁFICO ────────────────── */}
      {activeSubTab === 'resumen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="page-swipe">
          
          {/* Círculos de Progreso Dinámicos */}
          <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '1.25rem 0.5rem' }}>
            
            {/* Círculo 1: Efectividad */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                <svg width="100" height="100" viewBox="0 0 120 120">
                  <defs>
                    <linearGradient id="neon-green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(135, 90%, 65%)" />
                      <stop offset="100%" stopColor="hsl(145, 95%, 45%)" />
                    </linearGradient>
                  </defs>
                  {/* Círculo base */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="hsla(240, 20%, 15%, 0.7)" strokeWidth="9" />
                  {/* Círculo animado */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#neon-green-grad)"
                    strokeWidth="9"
                    strokeDasharray="314.16"
                    strokeDashoffset={314.16 - (314.16 * efficiency) / 100}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      filter: 'drop-shadow(0 0 5px hsla(135, 90%, 55%, 0.4))'
                    }}
                  />
                  <text x="60" y="68" textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="var(--font-sporty)">
                    {efficiency}%
                  </text>
                </svg>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Efectividad
              </span>
            </div>

            {/* Círculo 2: Racha o Progreso de Logros */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                {mode === 'points' ? (
                  <>
                    {currentUser.streak >= 3 && (
                      <div 
                        style={{ 
                          position: 'absolute', 
                          top: '-10px', 
                          right: '32px', 
                          fontSize: '1.2rem',
                          animation: 'flameRise 1.2s infinite ease-in-out' 
                        }}
                      >
                        🔥
                      </div>
                    )}
                    <svg width="100" height="100" viewBox="0 0 120 120">
                      <defs>
                        <linearGradient id="neon-fire-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(30, 100%, 65%)" />
                          <stop offset="100%" stopColor="hsl(10, 100%, 50%)" />
                        </linearGradient>
                      </defs>
                      <circle cx="60" cy="60" r="50" fill="none" stroke="hsla(240, 20%, 15%, 0.7)" strokeWidth="9" />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="url(#neon-fire-grad)"
                        strokeWidth="9"
                        strokeDasharray="314.16"
                        strokeDashoffset={314.16 - (314.16 * streakPercentage) / 100}
                        strokeLinecap="round"
                        style={{
                          transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                          filter: 'drop-shadow(0 0 5px hsl(20, 100%, 55%, 0.45))'
                        }}
                      />
                      <text x="60" y="68" textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="var(--font-sporty)">
                        {currentUser.streak}
                      </text>
                    </svg>
                  </>
                ) : (
                  <>
                    {currentUser.achievements.length >= 8 && (
                      <div 
                        style={{ 
                          position: 'absolute', 
                          top: '-10px', 
                          right: '32px', 
                          fontSize: '1.2rem',
                          animation: 'flameRise 1.2s infinite ease-in-out' 
                        }}
                      >
                        👑
                      </div>
                    )}
                    <svg width="100" height="100" viewBox="0 0 120 120">
                      <defs>
                        <linearGradient id="neon-ach-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ffd700" />
                          <stop offset="100%" stopColor="#b90df2" />
                        </linearGradient>
                      </defs>
                      <circle cx="60" cy="60" r="50" fill="none" stroke="hsla(240, 20%, 15%, 0.7)" strokeWidth="9" />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="url(#neon-ach-grad)"
                        strokeWidth="9"
                        strokeDasharray="314.16"
                        strokeDashoffset={314.16 - (314.16 * (currentUser.achievements.length / BADGES.length * 100)) / 100}
                        strokeLinecap="round"
                        style={{
                          transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                          filter: 'drop-shadow(0 0 5px #b90df277)'
                        }}
                      />
                      <text x="60" y="68" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="var(--font-sporty)">
                        {currentUser.achievements.length}/{BADGES.length}
                      </text>
                    </svg>
                  </>
                )}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                {mode === 'points' ? 'Racha Activa' : 'Logros Obtenidos'}
              </span>
            </div>
          </div>

          {/* Gráfico Interactivo de Desglose de Resultados */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="sport-font" style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
                Aciertos por Categoría
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                {totalPredictedFinished} Predichos
              </span>
            </div>

            {/* Barra Stacked */}
            <div 
              style={{ 
                display: 'flex', 
                height: '24px', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                border: '1px solid hsla(0,0%,100%,0.04)',
                background: 'hsla(240, 30%, 6%, 0.8)' 
              }}
            >
              <div 
                onClick={() => setSelectedCategory(selectedCategory === 'exact' ? null : 'exact')}
                style={{ 
                  width: `${exactPct}%`, 
                  background: 'var(--color-primary)', 
                  cursor: 'pointer', 
                  transition: 'width 0.6s ease',
                  borderRight: exactPct > 0 && (simplePct > 0 || wrongPct > 0) ? '1px solid hsla(240,30%,5%,0.3)' : 'none',
                  opacity: selectedCategory === null || selectedCategory === 'exact' ? 1 : 0.4
                }} 
                title={`Aciertos Exactos (3pts): ${exactCount}`}
              />
              <div 
                onClick={() => setSelectedCategory(selectedCategory === 'simple' ? null : 'simple')}
                style={{ 
                  width: `${simplePct}%`, 
                  background: 'var(--color-secondary)', 
                  cursor: 'pointer', 
                  transition: 'width 0.6s ease',
                  borderRight: simplePct > 0 && wrongPct > 0 ? '1px solid hsla(240,30%,5%,0.3)' : 'none',
                  opacity: selectedCategory === null || selectedCategory === 'simple' ? 1 : 0.4
                }} 
                title={`Ganador/Empate Acertado (1pt): ${simpleCount}`}
              />
              <div 
                onClick={() => setSelectedCategory(selectedCategory === 'wrong' ? null : 'wrong')}
                style={{ 
                  width: `${wrongPct}%`, 
                  background: 'var(--color-accent)', 
                  cursor: 'pointer', 
                  transition: 'width 0.6s ease',
                  opacity: selectedCategory === null || selectedCategory === 'wrong' ? 1 : 0.4
                }} 
                title={`Errores (0pts): ${wrongCount}`}
              />
            </div>

            {/* Leyenda Interactiva */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              <div 
                onClick={() => setSelectedCategory('exact')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', opacity: selectedCategory === 'exact' ? 1 : 0.65 }}
              >
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }} />
                <span>Exacto: <strong>{exactCount}</strong></span>
              </div>
              <div 
                onClick={() => setSelectedCategory('simple')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', opacity: selectedCategory === 'simple' ? 1 : 0.65 }}
              >
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-secondary)' }} />
                <span>Ganador: <strong>{simpleCount}</strong></span>
              </div>
              <div 
                onClick={() => setSelectedCategory('wrong')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', opacity: selectedCategory === 'wrong' ? 1 : 0.65 }}
              >
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent)' }} />
                <span>Errado: <strong>{wrongCount}</strong></span>
              </div>
            </div>

            {/* Listado Interactivo de Pronósticos según la categoría seleccionada */}
            {selectedCategory && (
              <div 
                className="page-swipe"
                style={{ 
                  marginTop: '0.5rem', 
                  background: 'hsla(240,30%,6%,0.5)', 
                  borderRadius: '8px', 
                  border: '1px solid hsla(0,0%,100%,0.04)', 
                  padding: '0.65rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsla(0,0%,100%,0.05)', paddingBottom: '0.35rem', marginBottom: '0.4rem' }}>
                  <span className="sport-font" style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: selectedCategory === 'exact' ? 'var(--color-primary)' : selectedCategory === 'simple' ? 'var(--color-secondary)' : 'var(--color-accent)' }}>
                    Detalle: {selectedCategory === 'exact' ? 'Aciertos Exactos 🎯' : selectedCategory === 'simple' ? 'Resultados Simples ✓' : 'Pronósticos Errados ✗'}
                  </span>
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem', padding: '0 0.25rem' }}
                  >
                    ✕ Cerrar
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '140px', overflowY: 'auto', paddingRight: '0.2rem' }}>
                  {selectedMatchesList.length > 0 ? (
                    selectedMatchesList.map(({ match, pred }) => {
                      const tA = match.teamA;
                      const tB = match.teamB;
                      return (
                        <div 
                          key={match.id}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            fontSize: '0.75rem', 
                            background: 'hsla(0,0%,100%,0.02)',
                            padding: '0.3rem 0.5rem',
                            borderRadius: '4px'
                          }}
                        >
                          <span style={{ color: 'var(--color-text-main)', fontWeight: 'bold' }}>{tA} vs {tB}</span>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Pred: {pred.predictedScoreA}-{pred.predictedScoreB}</span>
                            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                            <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>Real: {match.scoreA}-{match.scoreB}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
                      No tienes partidos finalizados en esta categoría.
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedCategory && (
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', borderTop: '1px dotted hsla(0,0%,100%,0.06)', paddingTop: '0.4rem', textAlign: 'center' }}>
                💡 Haz clic en los colores de la barra para desglosar tus aciertos.
              </div>
            )}
          </div>

          {/* Radar de Afinidad de Selecciones (Preferencia/Prejuicio) */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <span className="sport-font" style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', textTransform: 'uppercase', borderBottom: '1px solid hsla(0,0%,100%,0.06)', paddingBottom: '0.35rem' }}>
              Tendencias de Equipos
            </span>

            {favoriteTeamId || leastFavoriteTeamId ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.2rem' }}>
                  {/* Favorito */}
                  {favoriteTeamId && (
                    <div style={{ background: 'hsla(135,90%,55%,0.03)', border: '1px solid hsla(135,90%,55%,0.1)', borderRadius: '8px', padding: '0.65rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        Tu Favorito 👍
                      </span>
                      <ShieldSvg teamId={favoriteTeamId} size={56} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{TEAMS[favoriteTeamId]?.name || favoriteTeamId}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                        {maxWins} victorias pronosticadas
                      </span>
                    </div>
                  )}

                  {/* Menos Fe */}
                  {leastFavoriteTeamId && (
                    <div style={{ background: 'hsla(355,90%,55%,0.03)', border: '1px solid hsla(355,90%,55%,0.1)', borderRadius: '8px', padding: '0.65rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-accent)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        Menos Fe 👎
                      </span>
                      <ShieldSvg teamId={leastFavoriteTeamId} size={56} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{TEAMS[leastFavoriteTeamId]?.name || leastFavoriteTeamId}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                        {maxLosses} derrotas pronosticadas
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', borderTop: '1px dotted hsla(0,0%,100%,0.06)', paddingTop: '0.4rem', textAlign: 'center' }}>
                  💡 Se calcula automáticamente según tus victorias/derrotas pronosticadas.
                </div>
              </>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '0.75rem 0' }}>
                Pronostica victorias y derrotas para calcular la afinidad con tus selecciones preferidas.
              </div>
            )}
          </div>

          {/* Tarjeta de Comodines Restantes */}
          <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.85rem' }}>
            <div style={{ borderRight: '1px solid hsla(0,0%,100%,0.06)', paddingRight: '0.5rem' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.15rem' }}>Comodín Grupos 🎟️</span>
              <span className={groupJokerLeft > 0 ? 'text-neon-green' : 'text-neon-red'} style={{ fontWeight: '800', fontSize: '0.9rem', fontFamily: 'var(--font-sporty)' }}>
                {groupJokerLeft > 0 ? 'DISPONIBLE (1)' : 'AGOTADO (0)'}
              </span>
            </div>
            <div style={{ paddingLeft: '0.25rem' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.15rem' }}>Comodín Finales 🌟</span>
              <span className={finalJokerLeft > 0 ? 'text-neon-green' : 'text-neon-red'} style={{ fontWeight: '800', fontSize: '0.9rem', fontFamily: 'var(--font-sporty)' }}>
                {finalJokerLeft > 0 ? 'DISPONIBLE (1)' : 'AGOTADO (0)'}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* ────────────────── CONTENIDO: TAB 2: RIVALIDADES DIRECTAS ────────────────── */}
      {activeSubTab === 'rivales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }} className="page-swipe">
          
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <span className="sport-font" style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', textTransform: 'uppercase', display: 'block' }}>
                Tu Lucha en el Grupo
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                Competidores inmediatamente arriba y abajo tuyo {mode === 'achievements' ? 'en la competencia de logros' : 'en la tabla de posiciones'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
              {rivalsToShow.map(({ user, relativePos, rank }) => {
                const isMe = user.id === currentUser.id;
                const initials = user.name.substring(0, 2).toUpperCase();
                const unlockedBadges = BADGES.filter(b => user.achievements.includes(b.id));
                const tierColors = {
                  bronze: '#cd7f32',
                  silver: '#c0c0c0',
                  gold: '#ffb700',
                  legendary: '#d946ef'
                };

                return (
                  <div 
                    key={user.id}
                    className={`leaderboard-row ${isMe ? 'row-current-user' : ''}`}
                    style={{ 
                      padding: '0.75rem 1rem', 
                      background: isMe ? 'hsla(135,90%,55%,0.04)' : 'hsla(240, 30%, 8%, 0.4)',
                      borderColor: isMe ? 'var(--color-primary)' : 'hsla(0,0%,100%,0.04)',
                      opacity: isMe ? 1 : 0.85
                    }}
                  >
                    <span className="rank-number" style={{ fontSize: '1rem', width: '22px' }}>#{rank}</span>
                    
                    <div 
                      className="user-avatar-mini" 
                      style={{ 
                        width: '30px', 
                        height: '30px', 
                        fontSize: '0.8rem',
                        borderColor: isMe ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'
                      }}
                    >
                      {initials}
                    </div>

                    <div className="user-info">
                      <div className="user-name-row">
                        <span className="user-name-text" style={{ fontSize: '0.85rem', fontWeight: isMe ? 'bold' : 'normal' }}>
                          {user.name}
                        </span>
                        {isMe && (
                          <span style={{ fontSize: '0.55rem', background: 'var(--color-primary)', color: 'var(--color-text-dark)', padding: '1px 3px', borderRadius: '3px', fontWeight: 'bold' }}>
                            TÚ
                          </span>
                        )}
                        {mode === 'points' && user.streak >= 3 && <span title="Racha de Fuego" style={{ display: 'inline-block', animation: 'bounceSpin 1.5s infinite' }}>🔥</span>}
                        {mode === 'achievements' && user.achievements.includes('leyenda') && <span title="Leyenda de las Predicciones" style={{ display: 'inline-block', animation: 'bounceSpin 1.5s infinite' }}>👑</span>}
                      </div>
                      
                      {mode === 'achievements' ? (
                        <div style={{ display: 'flex', gap: '3px', marginTop: '0.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          {unlockedBadges.length > 0 ? (
                            unlockedBadges.map(badge => (
                              <span 
                                key={badge.id} 
                                title={`${badge.title} (${badge.tier.toUpperCase()})`}
                                style={{ 
                                  width: '6px', 
                                  height: '6px', 
                                  borderRadius: '50%', 
                                  background: tierColors[badge.tier],
                                  boxShadow: badge.tier === 'legendary' || badge.tier === 'gold' ? `0 0 3px ${tierColors[badge.tier]}` : 'none',
                                  display: 'inline-block'
                                }}
                              />
                            ))
                          ) : (
                            <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin logros</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.65rem', color: relativePos === -1 ? 'var(--color-accent)' : relativePos === 1 ? 'var(--color-secondary)' : 'var(--color-text-muted)' }}>
                          {relativePos === -1 ? '🎯 Próximo Objetivo' : relativePos === 1 ? '👣 Te pisa los talones' : '📍 Posición actual'}
                        </span>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {mode === 'achievements' ? (
                        <>
                          <span className="points-text" style={{ fontSize: '1.05rem' }}>🏅 {user.achievements.length}</span>
                          <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)' }}>
                            {Math.round((user.achievements.length / BADGES.length) * 100)}%
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="points-text" style={{ fontSize: '1.05rem' }}>{user.points} Pts</span>
                          {user.streak >= 3 && (
                            <div style={{ fontSize: '0.65rem', color: 'hsl(30, 100%, 55%)' }}>🔥 Racha: {user.streak}</div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {onNavigate && (
              <button
                className="btn-premium btn-secondary"
                onClick={() => onNavigate('standings')}
                style={{ width: '100%', fontSize: '0.75rem', marginTop: '0.5rem', padding: '0.5rem' }}
              >
                Ver Tabla de Posiciones Completa 🏆
              </button>
            )}
          </div>

        </div>
      )}

      {/* ────────────────── CONTENIDO: TAB 3: CHICANAS RÁPIDAS ────────────────── */}
      {activeSubTab === 'chicanas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }} className="page-swipe">
          
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <span className="sport-font" style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', textTransform: 'uppercase', display: 'block' }}>
                Buzón de Chicanas 💬
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                Envía chicanas picantes al chat grupal en un solo clic basado en tus estadísticas actuales.
              </span>
            </div>

            {chicanaSuccess && (
              <div 
                className="page-swipe"
                style={{ 
                  background: 'rgba(135,90,55,0.08)', 
                  border: '1px solid var(--color-primary)', 
                  color: 'var(--color-primary)', 
                  padding: '0.65rem', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{chicanaSuccess}</span>
                {onNavigate && (
                  <button 
                    onClick={() => onNavigate('chat')}
                    className="btn-premium"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', textTransform: 'none' }}
                  >
                    Ir al Chat 💬
                  </button>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
              {BANTER_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePostBanter(phrase)}
                  style={{
                    background: 'hsla(240, 30%, 8%, 0.4)',
                    border: '1px solid hsla(0,0%,100%,0.04)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    color: 'var(--color-text-main)',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.background = 'hsla(240, 35%, 12%, 0.7)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'hsla(0,0%,100%,0.04)';
                    e.currentTarget.style.background = 'hsla(240, 30%, 8%, 0.4)';
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>📣</span>
                  <span style={{ flex: 1 }}>{phrase}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ────────────────── CONTENIDO: TAB 4: DUELOS 1v1 ────────────────── */}
      {activeSubTab === 'duelos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }} className="page-swipe">
          
          {/* Crear Duelo */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <span className="sport-font" style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', textTransform: 'uppercase', display: 'block' }}>
              ⚔️ Desafiar a un Amigo
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Reta a un compañero de tu grupo en un partido del fixture. ¡El que consiga más puntos en ese partido gana el duelo!
            </span>

            {duelSuccess && (
              <div style={{ padding: '0.5rem', background: 'rgba(135,90,55,0.08)', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                {duelSuccess}
              </div>
            )}
            {duelError && (
              <div style={{ padding: '0.5rem', background: 'rgba(328,100,54,0.08)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                {duelError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <div>
                <label style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Seleccionar Rival</label>
                <select 
                  className="input-field" 
                  value={selectedRivalId}
                  onChange={e => setSelectedRivalId(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', background: 'hsla(240, 35%, 8%, 0.8)' }}
                >
                  <option value="">-- Elige un competidor --</option>
                  {users.filter(u => u.groupId === currentUser.groupId && u.id !== currentUser.id).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Seleccionar Partido</label>
                <select 
                  className="input-field" 
                  value={selectedMatchId}
                  onChange={e => setSelectedMatchId(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', background: 'hsla(240, 35%, 8%, 0.8)' }}
                >
                  <option value="">-- Elige un partido pendiente --</option>
                  {matches.filter(m => {
                    const kickTime = new Date(m.date).getTime();
                    const sysTime = getSystemTime().getTime();
                    return m.status === 'pending' && (kickTime - sysTime > 60 * 60 * 1000);
                  }).map(m => {
                    const teamAName = TEAMS[m.teamA]?.name || m.teamA;
                    const teamBName = TEAMS[m.teamB]?.name || m.teamB;
                    return (
                      <option key={m.id} value={m.id}>
                        {teamAName} vs {teamBName} ({m.phase})
                      </option>
                    );
                  })}
                </select>
              </div>

              <button 
                className="btn-premium"
                style={{ marginTop: '0.4rem', width: '100%' }}
                onClick={() => {
                  setDuelSuccess(null);
                  setDuelError(null);
                  if (!selectedRivalId || !selectedMatchId) {
                    setDuelError('Por favor selecciona un rival y un partido.');
                    return;
                  }
                  const res = createDuel(selectedRivalId, selectedMatchId);
                  if (res.success) {
                    setDuelSuccess('¡Desafío enviado con éxito! Se notificó en el chat del grupo.');
                    setSelectedMatchId('');
                  } else {
                    setDuelError(res.error || 'Ocurrió un error al crear el desafío.');
                  }
                }}
              >
                ⚔️ Enviar Desafío de Duelo
              </button>
            </div>
          </div>

          {/* Desafíos Pendientes por Aceptar */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="sport-font" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
              📩 Desafíos Recibidos
            </span>
            {(() => {
              const received = duels.filter(d => d.challengedId === currentUser.id && d.status === 'pending');
              if (received.length === 0) {
                return <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', margin: '0.5rem 0' }}>No tienes desafíos pendientes.</p>;
              }
              return received.map(d => {
                const challenger = users.find(u => u.id === d.challengerId);
                const matchObj = matches.find(m => m.id === d.matchId);
                const teamA = TEAMS[matchObj?.teamA || '']?.name || 'Local';
                const teamB = TEAMS[matchObj?.teamB || '']?.name || 'Visitante';
                return (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {challenger?.jersey && (
                        <JerseySvg primaryColor={challenger.jersey.primaryColor} secondaryColor={challenger.jersey.secondaryColor} pattern={challenger.jersey.pattern} number={challenger.jersey.number} size={24} />
                      )}
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block' }}>{challenger?.name} te retó</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>En {teamA} vs {teamB}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button 
                        onClick={() => respondToDuel(d.id, 'accept')}
                        className="btn-premium"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', textTransform: 'none' }}
                      >
                        Aceptar
                      </button>
                      <button 
                        onClick={() => respondToDuel(d.id, 'decline')}
                        className="btn-premium btn-secondary"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', textTransform: 'none' }}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Duelos Activos */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="sport-font" style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
              🏟️ Duelos Activos
            </span>
            {(() => {
              const active = duels.filter(d => 
                (d.challengerId === currentUser.id || d.challengedId === currentUser.id) &&
                (d.status === 'accepted' || (d.challengerId === currentUser.id && d.status === 'pending'))
              );
              if (active.length === 0) {
                return <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', margin: '0.5rem 0' }}>No tienes duelos activos en este momento.</p>;
              }
              return active.map(d => {
                const challenger = users.find(u => u.id === d.challengerId);
                const challenged = users.find(u => u.id === d.challengedId);
                const matchObj = matches.find(m => m.id === d.matchId);
                const teamA = TEAMS[matchObj?.teamA || '']?.name || 'Local';
                const teamB = TEAMS[matchObj?.teamB || '']?.name || 'Visitante';
                
                const matchKickoff = new Date(matchObj?.date || '').getTime();
                const sysTime = getSystemTime().getTime();
                const isLocked = matchKickoff - sysTime <= 60 * 60 * 1000;

                const predChallenger = predictions.find(p => p.userId === d.challengerId && p.matchId === d.matchId);
                const predChallenged = predictions.find(p => p.userId === d.challengedId && p.matchId === d.matchId);

                const getPredStr = (pred: typeof predChallenger) => {
                  if (!pred) return 'Sin Pronóstico';
                  if (!isLocked && pred.userId !== currentUser.id) return '🔒 Oculto';
                  return `${pred.predictedScoreA} - ${pred.predictedScoreB}${pred.isJoker ? ' ⭐' : ''}`;
                };

                return (
                  <div key={d.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid hsla(0,0%,100%,0.04)', padding: '0.65rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-text-muted)', borderBottom: '1px dashed rgba(255,255,255,0.06)', paddingBottom: '0.2rem' }}>
                      <span>{matchObj?.phase}</span>
                      <span className={d.status === 'pending' ? 'text-neon-yellow' : 'text-neon-green'}>
                        {d.status === 'pending' ? 'Esperando rival' : 'Activo'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center', margin: '0.15rem 0' }}>
                      {teamA} vs {teamB}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', width: '45%' }}>
                        {challenger?.jersey && <JerseySvg primaryColor={challenger.jersey.primaryColor} secondaryColor={challenger.jersey.secondaryColor} pattern={challenger.jersey.pattern} number={challenger.jersey.number} size={16} />}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{challenger?.name}</span>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', width: '10%', textAlign: 'center' }}>VS</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', width: '45%', justifyContent: 'flex-end' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{challenged?.name}</span>
                        {challenged?.jersey && <JerseySvg primaryColor={challenged.jersey.primaryColor} secondaryColor={challenged.jersey.secondaryColor} pattern={challenged.jersey.pattern} number={challenged.jersey.number} size={16} />}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', padding: '0 0.25rem' }}>
                      <span>Retador: {getPredStr(predChallenger)}</span>
                      <span>Retado: {getPredStr(predChallenged)}</span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Historial de Duelos */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="sport-font" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              📜 Historial de Duelos
            </span>
            {(() => {
              const history = duels.filter(d => 
                (d.challengerId === currentUser.id || d.challengedId === currentUser.id) &&
                (d.status === 'completed' || d.status === 'declined')
              );
              if (history.length === 0) {
                return <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', margin: '0.5rem 0' }}>Aún no tienes duelos finalizados.</p>;
              }
              return history.map(d => {
                const challenger = users.find(u => u.id === d.challengerId);
                const challenged = users.find(u => u.id === d.challengedId);
                const matchObj = matches.find(m => m.id === d.matchId);
                const teamA = TEAMS[matchObj?.teamA || '']?.name || matchObj?.teamA;
                const teamB = TEAMS[matchObj?.teamB || '']?.name || matchObj?.teamB;

                if (d.status === 'declined') {
                  return (
                    <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      <span>⚔️ {challenger?.name} vs {challenged?.name}</span>
                      <span>Rechazado 🏳️</span>
                    </div>
                  );
                }

                const isWinnerChallenger = d.winnerId === d.challengerId;
                const isWinnerChallenged = d.winnerId === d.challengedId;
                const isDraw = d.winnerId === 'draw';

                let resultStr = 'Empate 🤝';
                let isWinnerMe = false;
                if (d.winnerId === currentUser.id) {
                  resultStr = '¡Ganaste! 🏆';
                  isWinnerMe = true;
                } else if (d.winnerId !== 'draw') {
                  resultStr = 'Perdiste ❌';
                }

                return (
                  <div 
                    key={d.id} 
                    style={{ 
                      background: isDraw ? 'rgba(255,255,255,0.01)' : (isWinnerMe ? 'rgba(135,90,55,0.04)' : 'rgba(328,100,54,0.01)'),
                      border: isDraw ? '1px solid hsla(0,0%,100%,0.04)' : (isWinnerMe ? '1px solid rgba(135,90,55,0.2)' : '1px solid rgba(328,100,54,0.08)'),
                      padding: '0.5rem 0.65rem', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.2rem' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                      <span>{teamA} {matchObj?.scoreA} - {matchObj?.scoreB} {teamB}</span>
                      <span style={{ fontWeight: 'bold', color: isWinnerMe ? 'var(--color-primary)' : 'inherit' }}>{resultStr}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', alignItems: 'center' }}>
                      <span style={{ textDecoration: isWinnerChallenger ? 'underline' : 'none' }}>
                        {challenger?.name}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>vs</span>
                      <span style={{ textDecoration: isWinnerChallenged ? 'underline' : 'none' }}>
                        {challenged?.name}
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

        </div>
      )}

    </div>
  );
};

export default UserPerformance;
