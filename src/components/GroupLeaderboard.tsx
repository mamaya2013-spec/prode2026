import React, { useState } from 'react';
import { useProde } from '../context/ProdeContext';
import { BADGES } from './Achievements';
import JerseySvg from './JerseySvg';
import type { User } from '../services/dataService';

interface GroupLeaderboardProps {
  onNavigate?: (tab: 'dashboard' | 'standings' | 'matches' | 'medals' | 'group' | 'admin' | 'chat') => void;
}

export const GroupLeaderboard: React.FC<GroupLeaderboardProps> = ({ onNavigate }) => {
  const { currentUser, currentGroup, users, predictions, matches } = useProde();
  const [mode, setMode] = useState<'points' | 'achievements'>('points');
  const [jornada, setJornada] = useState<string>('all');

  if (!currentUser || !currentGroup) {
    return (
      <div className="glass-panel text-center" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Debes iniciar sesión para ver la tabla de tu grupo.</p>
      </div>
    );
  }

  // Helper para calcular puntos de un competidor en la jornada seleccionada
  const getCompetitorPointsInJornada = (user: User) => {
    if (jornada === 'all') return { points: user.points, streak: user.streak };

    let startMatchId = 1;
    let endMatchId = 104;

    if (jornada === 'j1') { startMatchId = 1; endMatchId = 24; }
    else if (jornada === 'j2') { startMatchId = 25; endMatchId = 48; }
    else if (jornada === 'j3') { startMatchId = 49; endMatchId = 72; }
    else if (jornada === 'elim') { startMatchId = 73; endMatchId = 104; }

    const rangePredictions = predictions.filter(p => {
      const idNum = parseInt(p.matchId.substring(1));
      return p.userId === user.id && idNum >= startMatchId && idNum <= endMatchId;
    });

    const finishedRangeMatches = matches.filter(m => {
      const idNum = parseInt(m.id.substring(1));
      return m.status === 'finished' && idNum >= startMatchId && idNum <= endMatchId;
    });

    let points = 0;
    let streak = 0;
    let currentStreak = 0;

    const sortedMatches = [...finishedRangeMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedMatches.forEach(match => {
      const pred = rangePredictions.find(p => p.matchId === match.id);
      if (!pred) {
        currentStreak = 0;
        return;
      }
      const realA = match.scoreA!;
      const realB = match.scoreB!;
      const predA = pred.predictedScoreA;
      const predB = pred.predictedScoreB;

      const isExact = realA === predA && realB === predB;
      const isWinner = (realA > realB && predA > predB) || (realA < realB && predA < predB) || (realA === realB && predA === predB);

      let pts = isExact ? 3 : (isWinner ? 1 : 0);
      if (pred.isJoker) pts *= 2;

      if (pts > 0) {
        if (currentStreak >= 3) pts += 1;
        currentStreak++;
        if (currentStreak > streak) streak = currentStreak;
      } else {
        currentStreak = 0;
      }
      points += pts;
    });

    return { points, streak };
  };

  // Calcular MVP histórico para una jornada dada
  const getMatchdayMVP = (jornadaKey: 'j1' | 'j2' | 'j3' | 'elim'): { name: string; userName: string; points: number; userObj: User } | null => {
    let start = 1, end = 24, name = 'Jornada 1';
    if (jornadaKey === 'j2') { start = 25; end = 48; name = 'Jornada 2'; }
    else if (jornadaKey === 'j3') { start = 49; end = 72; name = 'Jornada 3'; }
    else if (jornadaKey === 'elim') { start = 73; end = 104; name = 'Eliminatorias'; }

    const finishedMatchesInJornada = matches.filter(m => {
      const idNum = parseInt(m.id.substring(1));
      return m.status === 'finished' && idNum >= start && idNum <= end;
    });

    if (finishedMatchesInJornada.length === 0) return null;

    let bestPoints = -1;
    let mvpUser: User | null = null;
    const competitorsInGroup = users.filter(u => u.groupId === currentGroup.id);

    for (const u of competitorsInGroup) {
      const rangePreds = predictions.filter(p => {
        const idNum = parseInt(p.matchId.substring(1));
        return p.userId === u.id && idNum >= start && idNum <= end;
      });

      let pts = 0;
      let currentStreak = 0;
      const sortedMatches = [...finishedMatchesInJornada].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      sortedMatches.forEach(match => {
        const pred = rangePreds.find(p => p.matchId === match.id);
        if (!pred) {
          currentStreak = 0;
          return;
        }
        const realA = match.scoreA!;
        const realB = match.scoreB!;
        const predA = pred.predictedScoreA;
        const predB = pred.predictedScoreB;

        const isExact = realA === predA && realB === predB;
        const isWinner = (realA > realB && predA > predB) || (realA < realB && predA < predB) || (realA === realB && predA === predB);

        let matchPts = isExact ? 3 : (isWinner ? 1 : 0);
        if (pred.isJoker) matchPts *= 2;

        if (matchPts > 0) {
          if (currentStreak >= 3) matchPts += 1;
          currentStreak++;
        } else {
          currentStreak = 0;
        }
        pts += matchPts;
      });

      if (pts > bestPoints && pts > 0) {
        bestPoints = pts;
        mvpUser = u;
      }
    }

    if (!mvpUser) return null;
    return { name, userName: mvpUser.name, points: bestPoints, userObj: mvpUser };
  };

  // Mapear y ordenar competidores
  const mappedCompetitors = users
    .filter(u => u.groupId === currentGroup.id)
    .map(u => {
      const stats = getCompetitorPointsInJornada(u);
      return {
        ...u,
        points: stats.points,
        streak: stats.streak
      };
    });

  const groupCompetitors = mappedCompetitors.sort((a, b) => {
    if (mode === 'achievements') {
      if (b.achievements.length !== a.achievements.length) {
        return b.achievements.length - a.achievements.length;
      }
      return b.points - a.points;
    } else {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.streak - a.streak;
    }
  });

  const podium = groupCompetitors.slice(0, 3);
  const restOfTable = groupCompetitors.slice(3);

  const renderedPodium = [
    podium[1] || null,
    podium[0] || null,
    podium[2] || null
  ];

  const getRankClass = (idx: number) => {
    if (idx === 0) return 'rank-first';
    if (idx === 1) return 'rank-second';
    if (idx === 2) return 'rank-third';
    return '';
  };

  const tierColors = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffb700',
    legendary: '#d946ef'
  };

  // Hall of fame MVPs
  const mvp1 = getMatchdayMVP('j1');
  const mvp2 = getMatchdayMVP('j2');
  const mvp3 = getMatchdayMVP('j3');
  const mvpElim = getMatchdayMVP('elim');

  const handleChallenge = (userId: string) => {
    sessionStorage.setItem('challenge_target_user_id', userId);
    if (onNavigate) {
      onNavigate('dashboard');
      // Esperar a que la pestaña dashboard cargue, luego en UserPerformance cambiará a la subpestaña 'duelos'
      setTimeout(() => {
        const event = new CustomEvent('navigate_to_duelos');
        window.dispatchEvent(event);
      }, 50);
    }
  };

  return (
    <div className="leaderboard-container page-swipe">
      
      {/* FILTRO DE JORNADAS */}
      <div style={{ padding: '0 1rem 0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
          📅 Filtrar por Jornada del Mundial
        </label>
        <select 
          className="input-field"
          value={jornada}
          onChange={(e) => setJornada(e.target.value)}
          style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', fontSize: '0.8rem', background: 'hsla(240, 35%, 8%, 0.8)' }}
        >
          <option value="all">🏆 Todo el Torneo (104 partidos)</option>
          <option value="j1">⚽ Jornada 1: Fase de Grupos (M1-M24)</option>
          <option value="j2">⚽ Jornada 2: Fase de Grupos (M25-M48)</option>
          <option value="j3">⚽ Jornada 3: Fase de Grupos (M49-M72)</option>
          <option value="elim">⚡ Fases Eliminatorias (M73-M104)</option>
        </select>
      </div>

      {/* SELECTOR DE TABLA (PUNTOS VS LOGROS) */}
      <div 
        style={{ 
          display: 'flex', 
          margin: '0.5rem 1rem 1.25rem 1rem', 
          background: 'hsla(240, 35%, 8%, 0.6)', 
          borderRadius: '8px', 
          padding: '0.25rem',
          border: '1px solid hsla(0,0%,100%,0.04)'
        }}
      >
        <button
          onClick={() => setMode('points')}
          className="sport-font"
          style={{
            flex: 1,
            background: mode === 'points' ? 'var(--gradient-neon)' : 'transparent',
            color: mode === 'points' ? 'var(--color-text-dark)' : 'var(--color-text-muted)',
            border: 'none',
            padding: '0.45rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            boxShadow: mode === 'points' ? '0 0 10px var(--color-primary)' : 'none'
          }}
        >
          🏆 Tabla de Puntos
        </button>
        <button
          onClick={() => setMode('achievements')}
          className="sport-font"
          style={{
            flex: 1,
            background: mode === 'achievements' ? 'var(--gradient-neon)' : 'transparent',
            color: mode === 'achievements' ? 'var(--color-text-dark)' : 'var(--color-text-muted)',
            border: 'none',
            padding: '0.45rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            boxShadow: mode === 'achievements' ? '0 0 10px var(--color-primary)' : 'none'
          }}
        >
          🏅 Competencia de Logros
        </button>
      </div>

      {/* SECCIÓN DEL PODIO (FIFA-STYLE CARDS con JerseySvg) */}
      {podium.length > 0 && (
        <div className="podium-section">
          {renderedPodium.map((user, idx) => {
            if (!user) return <div key={`empty-podium-${idx}`} style={{ width: '95px' }} />;
            
            const isFirst = user.id === podium[0]?.id;
            const isSecond = user.id === podium[1]?.id;
            const isThird = user.id === podium[2]?.id;

            let cardClass = 'fifa-card';
            let crownEmoji = '';
            if (isFirst) {
              cardClass += ' fifa-gold holo-shine-active';
              crownEmoji = '👑';
            } else if (isSecond) {
              cardClass += ' fifa-silver';
              crownEmoji = '🥈';
            } else if (isThird) {
              cardClass += ' fifa-bronze';
              crownEmoji = '🥉';
            }

            const showFlameGlow = (mode === 'points' && user.streak >= 3) || (mode === 'achievements' && user.achievements.length >= 8);

            return (
              <div 
                key={user.id} 
                className={`${cardClass} ${showFlameGlow ? 'medal-shine' : ''}`}
                style={{ 
                  transform: isFirst ? 'scale(1.08) translateY(-4px)' : 'scale(0.95)',
                  zIndex: isFirst ? 2 : 1,
                  animationDelay: `${idx * 0.1}s`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.65rem 0.4rem'
                }}
              >
                {crownEmoji && (
                  <span className="fifa-badge-crown">
                    {jornada !== 'all' && isFirst ? '👑 MVP' : crownEmoji}
                  </span>
                )}
                
                {showFlameGlow && <div className="flame-aura flame-active" />}

                {/* Jersey de Jugador como Avatar */}
                <div style={{ margin: '0.2rem 0' }}>
                  <JerseySvg 
                    primaryColor={user.jersey?.primaryColor || '#00d4ff'} 
                    secondaryColor={user.jersey?.secondaryColor || '#ffffff'} 
                    pattern={user.jersey?.pattern || 'solid'} 
                    number={user.jersey?.number || 10} 
                    size={isFirst ? 62 : 52} 
                  />
                </div>

                <span className="fifa-card-name" style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>{user.name}</span>
                <span className="fifa-card-points" style={{ fontSize: '0.85rem' }}>
                  {mode === 'achievements' ? `${user.achievements.length} Logros` : `${user.points} Pts`}
                </span>
                {mode === 'achievements' ? (
                  <span style={{ fontSize: '0.55rem', color: 'var(--color-secondary)', fontWeight: 'bold' }}>
                    {Math.round((user.achievements.length / BADGES.length) * 100)}%
                  </span>
                ) : (
                  user.streak >= 3 && (
                    <span style={{ fontSize: '0.6rem', color: 'hsl(30, 100%, 55%)' }}>
                      🔥 Racha: {user.streak}
                    </span>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CABECERA DE LA TABLA */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          padding: '0.5rem 1rem 0.25rem 1rem', 
          fontSize: '0.75rem', 
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          borderBottom: '1px solid hsla(0, 0%, 100%, 0.05)',
          fontFamily: 'var(--font-sporty)'
        }}
      >
        <span>Posición & Competidor</span>
        <span>{mode === 'achievements' ? 'Logros' : 'Puntos'}</span>
      </div>

      {/* POSICIONES PODIO EN TABLA */}
      {podium.map((user, idx) => {
        const isCurrentUser = user.id === currentUser.id;
        const unlockedBadges = BADGES.filter(b => user.achievements.includes(b.id));
        const showFlameGlow = (mode === 'points' && user.streak >= 3) || (mode === 'achievements' && user.achievements.length >= 8);

        return (
          <div 
            key={user.id} 
            className={`leaderboard-row ${isCurrentUser ? 'row-current-user' : ''}`}
          >
            {showFlameGlow && <div className="flame-aura flame-active" />}

            <span className={`rank-number ${getRankClass(idx)}`}>
              #{idx + 1}
            </span>

            {/* Jersey Mini en Fila */}
            <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.4rem' }}>
              <JerseySvg 
                primaryColor={user.jersey?.primaryColor} 
                secondaryColor={user.jersey?.secondaryColor} 
                pattern={user.jersey?.pattern} 
                number={user.jersey?.number} 
                size={28} 
              />
            </div>

            <div className="user-info" style={{ flex: 1 }}>
              <div className="user-name-row" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="user-name-text">{user.name}</span>
                {isCurrentUser && (
                  <span style={{ fontSize: '0.65rem', background: 'var(--color-primary)', color: 'var(--color-text-dark)', padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold' }}>
                    TÚ
                  </span>
                )}
                {idx === 0 && jornada !== 'all' && (
                  <span title="MVP Provisional de la Jornada" style={{ fontSize: '0.7rem' }}>👑 MVP</span>
                )}
                {mode === 'points' && user.streak >= 3 && <span title="Racha de Fuego">🔥</span>}
                {mode === 'achievements' && user.achievements.includes('leyenda') && <span title="Leyenda">👑</span>}
                
                {/* Botón de Retar */}
                {!isCurrentUser && (
                  <button 
                    onClick={() => handleChallenge(user.id)}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid hsla(0,0%,100%,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.6rem', padding: '1px 4px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,0,0,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    title="Desafiar en Duelo 1v1"
                  >
                    ⚔️ Retar
                  </button>
                )}
              </div>

              {mode === 'achievements' ? (
                <div style={{ display: 'flex', gap: '3px', marginTop: '0.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>Colección:</span>
                  {unlockedBadges.length > 0 ? (
                    unlockedBadges.map(badge => (
                      <span 
                        key={badge.id} 
                        title={`${badge.title} (${badge.tier.toUpperCase()})`}
                        style={{ 
                          width: '7px', 
                          height: '7px', 
                          borderRadius: '50%', 
                          background: tierColors[badge.tier],
                          display: 'inline-block'
                        }}
                      />
                    ))
                  ) : (
                    <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin logros</span>
                  )}
                </div>
              ) : (
                user.streak > 0 && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                    Racha actual: {user.streak} partidos
                  </span>
                )
              )}
            </div>

            <span className="points-text">
              {mode === 'achievements' ? `🏅 ${user.achievements.length}` : `${user.points} Pts`}
            </span>
          </div>
        );
      })}

      {/* RESTO DE LA CLASIFICACIÓN (Fuera del Podio) */}
      {restOfTable.map((user, idx) => {
        const isCurrentUser = user.id === currentUser.id;
        const rank = idx + 4;
        const unlockedBadges = BADGES.filter(b => user.achievements.includes(b.id));
        const showFlameGlow = (mode === 'points' && user.streak >= 3) || (mode === 'achievements' && user.achievements.length >= 8);

        return (
          <div 
            key={user.id} 
            className={`leaderboard-row ${isCurrentUser ? 'row-current-user' : ''}`}
          >
            {showFlameGlow && <div className="flame-aura flame-active" />}

            <span className="rank-number">
              #{rank}
            </span>

            {/* Jersey Mini en Fila */}
            <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.4rem' }}>
              <JerseySvg 
                primaryColor={user.jersey?.primaryColor} 
                secondaryColor={user.jersey?.secondaryColor} 
                pattern={user.jersey?.pattern} 
                number={user.jersey?.number} 
                size={28} 
              />
            </div>

            <div className="user-info" style={{ flex: 1 }}>
              <div className="user-name-row" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="user-name-text">{user.name}</span>
                {isCurrentUser && (
                  <span style={{ fontSize: '0.65rem', background: 'var(--color-primary)', color: 'var(--color-text-dark)', padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold' }}>
                    TÚ
                  </span>
                )}
                {mode === 'points' && user.streak >= 3 && <span title="Racha de Fuego">🔥</span>}
                {mode === 'achievements' && user.achievements.includes('leyenda') && <span title="Leyenda">👑</span>}

                {/* Botón de Retar */}
                {!isCurrentUser && (
                  <button 
                    onClick={() => handleChallenge(user.id)}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid hsla(0,0%,100%,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.6rem', padding: '1px 4px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,0,0,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    title="Desafiar en Duelo 1v1"
                  >
                    ⚔️ Retar
                  </button>
                )}
              </div>
              {mode === 'achievements' ? (
                <div style={{ display: 'flex', gap: '3px', marginTop: '0.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>Colección:</span>
                  {unlockedBadges.length > 0 ? (
                    unlockedBadges.map(badge => (
                      <span 
                        key={badge.id} 
                        title={`${badge.title} (${badge.tier.toUpperCase()})`}
                        style={{ 
                          width: '7px', 
                          height: '7px', 
                          borderRadius: '50%', 
                          background: tierColors[badge.tier],
                          display: 'inline-block'
                        }}
                      />
                    ))
                  ) : (
                    <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin logros</span>
                  )}
                </div>
              ) : (
                user.streak > 0 && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                    Racha actual: {user.streak} partidos
                  </span>
                )
              )}
            </div>

            <span className="points-text">
              {mode === 'achievements' ? `🏅 ${user.achievements.length}` : `${user.points} Pts`}
            </span>
          </div>
        );
      })}

      {/* SALÓN DE LA FAMA (MVPs Históricos de cada Jornada) */}
      <div className="glass-panel" style={{ margin: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <h4 className="sport-font" style={{ fontSize: '0.85rem', color: 'var(--color-gold)', borderBottom: '1px solid hsla(0,0%,100%,0.08)', paddingBottom: '0.35rem', textTransform: 'uppercase' }}>
          🏆 Salón de la Fama - MVPs
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.50rem' }}>
          {[mvp1, mvp2, mvp3, mvpElim].map((mvp, idx) => {
            const labels = ['Jornada 1', 'Jornada 2', 'Jornada 3', 'Eliminatorias'];
            
            return (
              <div 
                key={idx}
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: mvp ? '1px solid rgba(255, 183, 0, 0.25)' : '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '8px', 
                  padding: '0.45rem', 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.15rem'
                }}
              >
                <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  {labels[idx]}
                </span>
                
                {mvp ? (
                  <>
                    <JerseySvg 
                      primaryColor={mvp.userObj.jersey?.primaryColor} 
                      secondaryColor={mvp.userObj.jersey?.secondaryColor} 
                      pattern={mvp.userObj.jersey?.pattern} 
                      number={mvp.userObj.jersey?.number} 
                      size={24} 
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85px' }}>
                      {mvp.userName}
                    </span>
                    <span className="text-neon-yellow" style={{ fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'var(--font-sporty)' }}>
                      {mvp.points} Pts 👑
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: '0.4rem 0' }}>
                    En disputa ⏳
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default GroupLeaderboard;
