import React, { useState, useEffect } from 'react';
import { useProde } from '../context/ProdeContext';
import type { Match } from '../data/matches2026';
import { TEAMS } from '../data/matches2026';
import ShieldSvg from './ShieldSvg';

interface MatchCardProps {
  match: Match;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const { currentUser, predictions, saveUserPrediction, getSystemTime, liveSimulatedScores, users } = useProde();
  
  // Buscar predicción existente de este usuario
  const userPred = currentUser
    ? predictions.find(p => p.userId === currentUser.id && p.matchId === match.id)
    : null;

  // Si hay resultados simulados en vivo corriendo en el Admin, los prioritiza
  const currentMatchScoreA = liveSimulatedScores?.[match.id] !== undefined 
    ? liveSimulatedScores[match.id].scoreA 
    : match.scoreA;

  const currentMatchScoreB = liveSimulatedScores?.[match.id] !== undefined 
    ? liveSimulatedScores[match.id].scoreB 
    : match.scoreB;

  const currentMatchStatus = liveSimulatedScores?.[match.id] !== undefined 
    ? (liveSimulatedScores[match.id].scoreA !== undefined ? 'finished' : 'pending')
    : match.status;

  // Estados locales del marcador de predicción
  const [scoreA, setScoreA] = useState<number>(userPred?.predictedScoreA ?? 0);
  const [scoreB, setScoreB] = useState<number>(userPred?.predictedScoreB ?? 0);
  const [isJoker, setIsJoker] = useState<boolean>(userPred?.isJoker ?? false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  
  // Estados para animaciones
  const [activeBallIndex, setActiveBallIndex] = useState<number | null>(null);
  const [netRustle, setNetRustle] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Animación cuando cambia el marcador en vivo oficial
  const [pulseScoreA, setPulseScoreA] = useState(false);
  const [pulseScoreB, setPulseScoreB] = useState(false);

  useEffect(() => {
    if (currentMatchStatus === 'live' && currentMatchScoreA !== undefined) {
      setPulseScoreA(true);
      setNetRustle(true);
      const timer = setTimeout(() => {
        setPulseScoreA(false);
        setNetRustle(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentMatchScoreA, currentMatchStatus]);

  useEffect(() => {
    if (currentMatchStatus === 'live' && currentMatchScoreB !== undefined) {
      setPulseScoreB(true);
      setNetRustle(true);
      const timer = setTimeout(() => {
        setPulseScoreB(false);
        setNetRustle(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentMatchScoreB, currentMatchStatus]);

  // Sincronizar marcadores locales si cambian externamente o por inicio de sesión
  useEffect(() => {
    if (userPred) {
      setScoreA(userPred.predictedScoreA);
      setScoreB(userPred.predictedScoreB);
      setIsJoker(userPred.isJoker);
    } else {
      setScoreA(0);
      setScoreB(0);
      setIsJoker(false);
    }
  }, [userPred]);

  // Chequeo en tiempo real del tiempo de bloqueo a T-60m
  useEffect(() => {
    const checkLockStatus = () => {
      const matchKickoff = new Date(match.date).getTime();
      const systemTime = getSystemTime().getTime();
      const diffMs = matchKickoff - systemTime;
      const oneHourInMs = 60 * 60 * 1000;

      if (diffMs <= oneHourInMs) {
        setIsLocked(true);
        if (currentMatchStatus === 'live') {
          setTimeLeftStr('En Vivo 🔴');
        } else if (currentMatchStatus === 'finished') {
          setTimeLeftStr('Finalizado');
        } else {
          setTimeLeftStr('Cerrado');
        }
      } else {
        setIsLocked(false);
        const hoursLeft = Math.floor(diffMs / (60 * 60 * 1000));
        const minsLeft = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
        
        if (hoursLeft > 24) {
          const days = Math.floor(hoursLeft / 24);
          setTimeLeftStr(`Abre en ${days}d`);
        } else {
          setTimeLeftStr(`Cierra en ${hoursLeft}h ${minsLeft}m`);
        }
      }
    };

    checkLockStatus();
    const interval = setInterval(checkLockStatus, 10000);
    return () => clearInterval(interval);
  }, [match.date, getSystemTime, currentMatchStatus]);

  const handleScoreChange = (team: 'A' | 'B', action: 'inc' | 'dec') => {
    if (isLocked) return;
    setErrorMsg('');

    let currentA = scoreA;
    let currentB = scoreB;

    if (team === 'A') {
      const newVal = action === 'inc' ? scoreA + 1 : Math.max(0, scoreA - 1);
      setScoreA(newVal);
      currentA = newVal;
      setActiveBallIndex(1);
    } else {
      const newVal = action === 'inc' ? scoreB + 1 : Math.max(0, scoreB - 1);
      setScoreB(newVal);
      currentB = newVal;
      setActiveBallIndex(2);
    }

    if (action === 'inc') {
      setNetRustle(true);
      setTimeout(() => setNetRustle(false), 750);
    }

    setTimeout(() => setActiveBallIndex(null), 500);

    const res = saveUserPrediction(match.id, currentA, currentB, isJoker);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleToggleJoker = () => {
    if (isLocked) return;
    setErrorMsg('');
    
    const newVal = !isJoker;
    setIsJoker(newVal);

    const res = saveUserPrediction(match.id, scoreA, scoreB, newVal);
    if (!res.success && res.error) {
      setIsJoker(!newVal);
      setErrorMsg(res.error);
    }
  };

  let pointsEarned = 0;
  let exactMatch = false;
  let winnerCorrect = false;

  if (currentMatchStatus === 'finished' && userPred) {
    const realA = currentMatchScoreA!;
    const realB = currentMatchScoreB!;
    const predA = userPred.predictedScoreA;
    const predB = userPred.predictedScoreB;

    exactMatch = realA === predA && realB === predB;
    winnerCorrect =
      (realA > realB && predA > predB) ||
      (realA < realB && predA < predB) ||
      (realA === realB && predA === predB);

    if (exactMatch) {
      pointsEarned = 3;
    } else if (winnerCorrect) {
      pointsEarned = 1;
    }

    if (userPred.isJoker) {
      pointsEarned *= 2;
    }
  }

  const teamA = TEAMS[match.teamA];
  const teamB = TEAMS[match.teamB];

  const matchDateObj = new Date(match.date);
  const formattedDateTime = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(matchDateObj).replace(',', ' -');

  return (
    <div className={`glass-panel match-card ${isLocked ? 'match-locked-card' : ''}`}>
      
      {/* Cabecera del Partido */}
      <div className="match-info-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span className="phase-tag">{match.phase}</span>
          <span className={`countdown-timer ${isLocked ? (currentMatchStatus === 'live' ? 'text-neon-green' : 'text-neon-red') : 'text-neon-green'}`}>
            {isLocked ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <svg className="locked-icon-svg" style={{ width: '12px', height: '12px', fill: currentMatchStatus === 'live' ? 'var(--color-primary)' : 'var(--color-accent)' }} viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                {timeLeftStr}
              </span>
            ) : (
              <>
                <svg style={{ width: '12px', height: '12px', fill: 'currentColor' }} viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 16h-2v-6h2v6zm0-8h-2V8h2v2z"/>
                </svg>
                {timeLeftStr}
              </>
            )}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', borderTop: '1px solid hsla(0,0%,100%,0.02)', paddingTop: '0.25rem' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }} title={match.stadium}>📍 {match.stadium}</span>
          <span className="text-neon-yellow" style={{ fontWeight: 'bold' }}>📅 {formattedDateTime} hs (ARG)</span>
        </div>
      </div>

      {/* Botón Comodín */}
      {currentUser && !isLocked && (
        <button 
          className={`joker-star-btn ${isJoker ? 'joker-star-active' : ''}`}
          onClick={handleToggleJoker}
          title={isJoker ? 'Comodín Activo (Doble Puntos)' : 'Activar Comodín'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}>
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </button>
      )}

      {/* Contenido Central: Escudos, Marcadores y Red SVG de Fondo */}
      <div className="match-teams-row" style={{ position: 'relative' }}>
        
        {/* Red SVG Goleadora de Fondo */}
        <div 
          className={`searchlights-overlay ${netRustle ? 'net-rustle-active' : ''}`} 
          style={{ 
            opacity: netRustle ? 0.35 : 0.05, 
            transition: 'opacity 0.3s ease',
            height: '80px',
            top: '10px'
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 400 100" fill="none">
            <pattern id="net-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 10 M 0 0 L 10 10" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#net-pattern)" />
            <path d="M 0,0 C 100,20 300,20 400,0 L 400,100 C 300,80 100,80 0,100 Z" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
          </svg>
        </div>

        {/* Selección A */}
        <div className="team-block">
          <ShieldSvg teamId={match.teamA} size={68} />
          <span className="team-name">{teamA?.name}</span>
        </div>

        {/* Panel Central de Controles / Marcador en vivo */}
        <div className="score-inputs" style={{ zIndex: 5 }}>
          {currentUser && !isLocked ? (
            <>
              <button 
                className={`score-control-btn ${activeBallIndex === 1 ? 'ball-active' : ''}`}
                onClick={() => handleScoreChange('A', 'dec')}
              >
                -
              </button>
              <span className="score-display-number">{scoreA}</span>
              <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sporty)' }}>:</span>
              <span className="score-display-number">{scoreB}</span>
              <button 
                className={`score-control-btn ${activeBallIndex === 2 ? 'ball-active' : ''}`}
                onClick={() => handleScoreChange('B', 'inc')}
              >
                +
              </button>
            </>
          ) : (
            <div className="flex-center" style={{ gap: '0.5rem', fontFamily: 'var(--font-sporty)', fontWeight: 800 }}>
              {currentMatchStatus === 'live' ? (
                // Mostrar marcador en vivo destacado al centro de la tarjeta
                <div className="flex-center" style={{ flexDirection: 'column', gap: '0.15rem' }}>
                  <div className="flex-center" style={{ gap: '0.5rem', fontSize: '1.5rem', fontWeight: 900 }}>
                    <span className={pulseScoreA ? 'score-goal-pulse' : 'text-neon-yellow'}>
                      {currentMatchScoreA}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>-</span>
                    <span className={pulseScoreB ? 'score-goal-pulse' : 'text-neon-yellow'}>
                      {currentMatchScoreB}
                    </span>
                  </div>
                  <span className="text-neon-red neon-locked-pulse" style={{ fontSize: '0.6rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    En Vivo 🔴
                  </span>
                </div>
              ) : currentUser ? (
                // Predicción guardada del usuario (bloqueada)
                <div className="flex-center" style={{ gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.2rem', color: isJoker ? 'var(--color-gold)' : 'var(--color-text-muted)' }}>
                    {scoreA}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                  <span style={{ fontSize: '1.2rem', color: isJoker ? 'var(--color-gold)' : 'var(--color-text-muted)' }}>
                    {scoreB}
                  </span>
                  {isJoker && <span style={{ color: 'var(--color-gold)', fontSize: '0.85rem' }}>⭐</span>}
                </div>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Sin Login
                </span>
              )}
            </div>
          )}
        </div>

        {/* Selección B */}
        <div className="team-block team-block-right">
          <ShieldSvg teamId={match.teamB} size={68} />
          <span className="team-name">{teamB?.name}</span>
        </div>
      </div>

      {/* Resultados Oficiales o Detalle de Predicción en Vivo */}
      {isLocked && (
        <div 
          className="glass-panel" 
          style={{ 
            marginTop: '0.25rem', 
            padding: '0.5rem 0.75rem', 
            background: 'hsla(240, 35%, 8%, 0.8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            borderStyle: 'dashed'
          }}
        >
          {currentMatchStatus === 'live' ? (
            // Mostrar la predicción del usuario como detalle inferior cuando el juego está live
            <div className="flex-center" style={{ justifyContent: 'space-between', width: '100%' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Tu Predicción:</span>
              <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: isJoker ? 'var(--color-gold)' : 'var(--color-text-main)' }}>
                {scoreA} - {scoreB} {isJoker ? '⭐' : ''}
              </span>
            </div>
          ) : (
            <>
              <span style={{ color: 'var(--color-text-muted)' }}>Resultado Oficial:</span>
              
              {currentMatchStatus === 'finished' ? (
                <div className="flex-center" style={{ gap: '0.75rem' }}>
                  <span className="text-neon-yellow" style={{ fontFamily: 'var(--font-sporty)', fontWeight: 800, fontSize: '0.95rem' }}>
                    {currentMatchScoreA} - {currentMatchScoreB}
                  </span>
                  
                  {userPred && (
                    <span 
                      className={pointsEarned > 0 ? 'text-neon-green' : 'text-neon-red'}
                      style={{ 
                        fontFamily: 'var(--font-sporty)', 
                        fontWeight: 700, 
                        background: pointsEarned > 0 ? 'rgba(135,90,55,0.1)' : 'rgba(328,100,54,0.1)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px'
                      }}
                    >
                      {pointsEarned > 0 ? `+${pointsEarned} Pts` : '0 Pts'}
                      {exactMatch && ' 🎯'}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-neon-red" style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700 }}>
                  Esperando Partido
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* Pulso de la Tribu */}
      {(() => {
        if (!currentUser) return null;
        const groupUsers = users.filter(u => u.groupId === currentUser.groupId);
        const groupUserIds = groupUsers.map(u => u.id);
        const matchPreds = predictions.filter(p => p.matchId === match.id && groupUserIds.includes(p.userId));

        if (matchPreds.length === 0) return null;

        let localWins = 0;
        let draws = 0;
        let awayWins = 0;

        matchPreds.forEach(p => {
          if (p.predictedScoreA > p.predictedScoreB) localWins++;
          else if (p.predictedScoreA < p.predictedScoreB) awayWins++;
          else draws++;
        });

        const total = matchPreds.length;
        const pctLocal = Math.round((localWins / total) * 100);
        const pctDraw = Math.round((draws / total) * 100);
        const pctAway = Math.round((awayWins / total) * 100);

        return (
          <div className="community-pulse-container" style={{ marginTop: '0.5rem', padding: '0.4rem 0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '0.7rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', marginBottom: '0.2rem', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
              <span>📊 Pulso de la Tribu</span>
              <span>{total} {total === 1 ? 'voto' : 'votos'}</span>
            </div>
            <div className="pulse-bar" style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
              <div style={{ width: `${pctLocal}%`, background: teamA?.color || 'var(--color-primary)', transition: 'width 0.3s ease' }} title={`Gana ${teamA?.name}: ${pctLocal}%`} />
              <div style={{ width: `${pctDraw}%`, background: '#888', transition: 'width 0.3s ease' }} title={`Empate: ${pctDraw}%`} />
              <div style={{ width: `${pctAway}%`, background: teamB?.color || 'var(--color-accent)', transition: 'width 0.3s ease' }} title={`Gana ${teamB?.name}: ${pctAway}%`} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.65rem', fontWeight: 'bold' }}>
              <span style={{ color: teamA?.color || 'var(--color-primary)' }}>{teamA?.short} {pctLocal}%</span>
              <span style={{ color: '#aaa' }}>Empate {pctDraw}%</span>
              <span style={{ color: teamB?.color || 'var(--color-accent)' }}>{teamB?.short} {pctAway}%</span>
            </div>
          </div>
        );
      })()}

      {/* Alertas de error sutiles en la tarjeta */}
      {errorMsg && (
        <div className="text-neon-red" style={{ fontSize: '0.7rem', textAlign: 'center', marginTop: '0.2rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}
    </div>
  );
};
export default MatchCard;
