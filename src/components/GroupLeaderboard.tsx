import React, { useState } from 'react';
import { useProde } from '../context/ProdeContext';
import { BADGES } from './Achievements';

export const GroupLeaderboard: React.FC = () => {
  const { currentUser, currentGroup, users } = useProde();
  const [mode, setMode] = useState<'points' | 'achievements'>('points');

  if (!currentUser || !currentGroup) {
    return (
      <div className="glass-panel text-center" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Debes iniciar sesión para ver la tabla de tu grupo.</p>
      </div>
    );
  }

  // Filtrado y ordenamiento de usuarios por puntos o logros según el modo
  const groupCompetitors = users
    .filter(u => u.groupId === currentGroup.id)
    .sort((a, b) => {
      if (mode === 'achievements') {
        if (b.achievements.length !== a.achievements.length) {
          return b.achievements.length - a.achievements.length;
        }
        return b.points - a.points; // Desempate por puntos
      } else {
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        return b.streak - a.streak; // Desempate por mejor racha
      }
    });

  // Dividir en Podio (Top 3) y el resto de la tabla
  const podium = groupCompetitors.slice(0, 3);
  const restOfTable = groupCompetitors.slice(3);

  // Mapear podium a posiciones fijas (2do, 1er, 3er puesto para renderizado visual de podio)
  const renderedPodium = [
    podium[1] || null, // 2do Puesto (Izquierda)
    podium[0] || null, // 1er Puesto (Centro)
    podium[2] || null  // 3er Puesto (Derecha)
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

  return (
    <div className="leaderboard-container page-swipe">
      
      {/* SELECTOR DE MODO (PUNTOS VS LOGROS) */}
      <div 
        style={{ 
          display: 'flex', 
          margin: '0 1rem 1.25rem 1rem', 
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

      {/* SECCIÓN DEL PODIO (FIFA-STYLE CARDS) */}
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

            const initials = user.name.substring(0, 2).toUpperCase();
            const showFlameGlow = (mode === 'points' && user.streak >= 3) || (mode === 'achievements' && user.achievements.length >= 8);

            return (
              <div 
                key={user.id} 
                className={`${cardClass} ${showFlameGlow ? 'medal-shine' : ''}`}
                style={{ 
                  transform: isFirst ? 'scale(1.08) translateY(-4px)' : 'scale(0.95)',
                  zIndex: isFirst ? 2 : 1,
                  animationDelay: `${idx * 0.1}s`
                }}
              >
                {crownEmoji && <span className="fifa-badge-crown">{crownEmoji}</span>}
                
                {/* Aura encendida */}
                {showFlameGlow && (
                  <div className="flame-aura flame-active" />
                )}

                <div className="fifa-avatar">
                  {initials}
                </div>
                <span className="fifa-card-name">{user.name}</span>
                <span className="fifa-card-points">
                  {mode === 'achievements' ? `${user.achievements.length} Logros` : `${user.points} Pts`}
                </span>
                {mode === 'achievements' ? (
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-secondary)', fontWeight: 'bold' }}>
                    {Math.round((user.achievements.length / BADGES.length) * 100)}% Completado
                  </span>
                ) : (
                  user.streak >= 3 && (
                    <span style={{ fontSize: '0.65rem', color: 'hsl(30, 100%, 55%)' }}>
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

      {/* POSICIONES DEL PODIO RENDERIZADAS COMO FILAS (Para consistencia) */}
      {podium.map((user, idx) => {
        const isCurrentUser = user.id === currentUser.id;
        const initials = user.name.substring(0, 2).toUpperCase();
        const unlockedBadges = BADGES.filter(b => user.achievements.includes(b.id));
        const showFlameGlow = (mode === 'points' && user.streak >= 3) || (mode === 'achievements' && user.achievements.length >= 8);

        return (
          <div 
            key={user.id} 
            className={`leaderboard-row ${isCurrentUser ? 'row-current-user' : ''}`}
          >
            {/* Racha de Fuego o Aura de Logros */}
            {showFlameGlow && <div className="flame-aura flame-active" />}

            <span className={`rank-number ${getRankClass(idx)}`}>
              #{idx + 1}
            </span>

            <div className={`user-avatar-mini ${isCurrentUser ? 'avatar-active' : ''}`}>
              {initials}
            </div>

            <div className="user-info">
              <div className="user-name-row">
                <span className="user-name-text">{user.name}</span>
                {isCurrentUser && (
                  <span style={{ fontSize: '0.65rem', background: 'var(--color-primary)', color: 'var(--color-text-dark)', padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold' }}>
                    TÚ
                  </span>
                )}
                {mode === 'points' && user.streak >= 3 && <span title="Racha de Fuego" style={{ animation: 'bounceSpin 1.5s infinite' }}>🔥</span>}
                {mode === 'achievements' && user.achievements.includes('leyenda') && <span title="Leyenda de las Predicciones" style={{ animation: 'bounceSpin 1.5s infinite' }}>👑</span>}
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
                          boxShadow: badge.tier === 'legendary' || badge.tier === 'gold' ? `0 0 4px ${tierColors[badge.tier]}` : 'none',
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
        const initials = user.name.substring(0, 2).toUpperCase();
        const rank = idx + 4;
        const unlockedBadges = BADGES.filter(b => user.achievements.includes(b.id));
        const showFlameGlow = (mode === 'points' && user.streak >= 3) || (mode === 'achievements' && user.achievements.length >= 8);

        return (
          <div 
            key={user.id} 
            className={`leaderboard-row ${isCurrentUser ? 'row-current-user' : ''}`}
          >
            {/* Racha de Fuego o Aura de Logros */}
            {showFlameGlow && <div className="flame-aura flame-active" />}

            <span className="rank-number">
              #{rank}
            </span>

            <div className={`user-avatar-mini ${isCurrentUser ? 'avatar-active' : ''}`}>
              {initials}
            </div>

            <div className="user-info">
              <div className="user-name-row">
                <span className="user-name-text">{user.name}</span>
                {isCurrentUser && (
                  <span style={{ fontSize: '0.65rem', background: 'var(--color-primary)', color: 'var(--color-text-dark)', padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold' }}>
                    TÚ
                  </span>
                )}
                {mode === 'points' && user.streak >= 3 && <span title="Racha de Fuego">🔥</span>}
                {mode === 'achievements' && user.achievements.includes('leyenda') && <span title="Leyenda de las Predicciones">👑</span>}
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
                          boxShadow: badge.tier === 'legendary' || badge.tier === 'gold' ? `0 0 4px ${tierColors[badge.tier]}` : 'none',
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
    </div>
  );
};

export default GroupLeaderboard;
