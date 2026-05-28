import React, { useState } from 'react';
import { useProde } from '../context/ProdeContext';
import type { Match } from '../data/matches2026';
import { TEAMS } from '../data/matches2026';
import ShieldSvg from './ShieldSvg';
import MatchCard from './MatchCard';
import copaDelMundoImg from '../assets/copa_del_mundo.png';

export const TournamentBracket: React.FC = () => {
  const { matches, predictions, liveSimulatedScores, currentUser } = useProde();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Obtener datos consolidados del partido en tiempo real
  const getMatchDisplayData = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return null;

    const userPred = currentUser
      ? predictions.find(p => p.userId === currentUser.id && p.matchId === matchId)
      : null;

    const scoreA = liveSimulatedScores?.[matchId] !== undefined 
      ? liveSimulatedScores[matchId].scoreA 
      : match.scoreA;

    const scoreB = liveSimulatedScores?.[matchId] !== undefined 
      ? liveSimulatedScores[matchId].scoreB 
      : match.scoreB;

    const status = liveSimulatedScores?.[matchId] !== undefined 
      ? (liveSimulatedScores[matchId].scoreA !== undefined ? 'finished' : 'pending')
      : match.status;

    return {
      match,
      pred: userPred,
      scoreA,
      scoreB,
      status
    };
  };

  // Definición ordenada de partidos por ronda para construir las columnas
  const leftR32Ids = ['M73', 'M74', 'M75', 'M76', 'M77', 'M78', 'M79', 'M80'];
  const leftR16Ids = ['M89', 'M90', 'M91', 'M92'];
  const leftQFIds = ['M97', 'M98'];
  const leftSFId = 'M101';

  const rightSFId = 'M102';
  const rightQFIds = ['M99', 'M100'];
  const rightR16Ids = ['M93', 'M94', 'M95', 'M96'];
  const rightR32Ids = ['M81', 'M82', 'M83', 'M84', 'M85', 'M86', 'M87', 'M88'];

  const finalId = 'M104';
  const thirdPlaceId = 'M103';

  // Renderizador de un nodo compacto en el árbol
  const renderBracketNode = (matchId: string) => {
    const data = getMatchDisplayData(matchId);
    if (!data) return null;

    const { match, pred, scoreA, scoreB, status } = data;
    const teamA = TEAMS[match.teamA];
    const teamB = TEAMS[match.teamB];

    // Detallar goles reales si finalizó/live, o pronósticos en su defecto
    const isLive = status === 'live';
    const isFinished = status === 'finished';
    const displayScoreA = (isLive || isFinished) ? scoreA : pred?.predictedScoreA;
    const displayScoreB = (isLive || isFinished) ? scoreB : pred?.predictedScoreB;

    const hasPrediction = !!pred;
    const isJoker = pred?.isJoker;

    // Determinar ganador para aplicar opacidades en el avance del árbol
    let winner: 'A' | 'B' | null = null;
    if (isFinished || isLive) {
      if ((scoreA ?? 0) > (scoreB ?? 0)) winner = 'A';
      else if ((scoreA ?? 0) < (scoreB ?? 0)) winner = 'B';
    } else if (hasPrediction && pred) {
      if (pred.predictedScoreA > pred.predictedScoreB) winner = 'A';
      else if (pred.predictedScoreA < pred.predictedScoreB) winner = 'B';
    }

    return (
      <div 
        key={matchId} 
        className={`bracket-node-card ${isLive ? 'match-live-pulse' : ''}`}
        onClick={() => setSelectedMatch(match)}
      >
        <div className="bracket-node-header">
          <span>{matchId} • {match.phase}</span>
          {isLive && <span className="text-neon-red neon-locked-pulse">VIVO 🔴</span>}
          {!isLive && isFinished && <span style={{ color: 'var(--color-secondary)' }}>FIN</span>}
        </div>

        {/* Selección A */}
        <div 
          className="bracket-node-team-row" 
          style={{ opacity: winner === 'B' ? 0.4 : 1, transition: 'opacity 0.3s ease' }}
        >
          <div className="bracket-node-team-info">
            <ShieldSvg teamId={match.teamA} size={30} />
            <span>{teamA?.short}</span>
          </div>
          <span className="sport-font" style={{ fontWeight: 'bold', color: winner === 'A' ? 'var(--color-primary)' : '#fff' }}>
            {displayScoreA !== undefined ? displayScoreA : '-'}
          </span>
        </div>

        {/* Selección B */}
        <div 
          className="bracket-node-team-row" 
          style={{ opacity: winner === 'A' ? 0.4 : 1, transition: 'opacity 0.3s ease' }}
        >
          <div className="bracket-node-team-info">
            <ShieldSvg teamId={match.teamB} size={30} />
            <span>{teamB?.short}</span>
          </div>
          <span className="sport-font" style={{ fontWeight: 'bold', color: winner === 'B' ? 'var(--color-primary)' : '#fff' }}>
            {displayScoreB !== undefined ? displayScoreB : '-'}
          </span>
        </div>

        {/* Detalle inferior de Predicción */}
        {hasPrediction && !(isLive || isFinished) && (
          <div style={{ fontSize: '0.6rem', color: isJoker ? 'var(--color-gold)' : 'var(--color-primary)', borderTop: '1px dotted hsla(0,0%,100%,0.06)', paddingTop: '0.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Tu Predicción</span>
            <span>{isJoker ? '🌟 Comodín' : '✓ Guardado'}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', maxWidth: '100%', width: '100%' }} className="page-swipe">
      
      {/* Mensaje de Ayuda Deslizar */}
      <div 
        style={{ 
          fontSize: '0.75rem', 
          color: 'var(--color-text-muted)', 
          textAlign: 'center', 
          padding: '0.5rem', 
          background: 'hsla(240, 30%, 8%, 0.4)',
          borderBottom: '1px solid hsla(0,0%,100%,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem'
        }}
      >
        <span>✨ Desliza horizontalmente para ver el cuadro completo de Eliminatorias FIFA 2026</span>
      </div>

      {/* Árbol del Fixture */}
      <div className="bracket-tree-container">
        
        {/* 1. DIECISEISAVOS IZQUIERDO */}
        <div className="bracket-column">
          <h4 className="sport-font bracket-column-title">1/16 Final (Izq)</h4>
          {leftR32Ids.map(id => renderBracketNode(id))}
        </div>

        {/* 2. OCTAVOS IZQUIERDO */}
        <div className="bracket-column">
          <h4 className="sport-font bracket-column-title">Octavos (Izq)</h4>
          {leftR16Ids.map(id => renderBracketNode(id))}
        </div>

        {/* 3. CUARTOS IZQUIERDO */}
        <div className="bracket-column">
          <h4 className="sport-font bracket-column-title">Cuartos (Izq)</h4>
          {leftQFIds.map(id => renderBracketNode(id))}
        </div>

        {/* 4. SEMIFINAL IZQUIERDA */}
        <div className="bracket-column">
          <h4 className="sport-font bracket-column-title">Semifinal (Izq)</h4>
          {renderBracketNode(leftSFId)}
        </div>

        {/* 5. CENTRO: GRAN FINAL & TERCER PUESTO */}
        <div className="bracket-column bracket-column-center" style={{ minWidth: '220px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <img 
              src={copaDelMundoImg} 
              alt="Copa del Mundo" 
              className="copa-del-mundo-anim" 
              style={{ width: '90px', height: '90px' }} 
            />
            <h3 className="sport-font" style={{ fontSize: '1rem', textTransform: 'uppercase', color: 'var(--color-gold)', margin: 0, letterSpacing: '1px' }}>
              Campeón del Mundo
            </h3>
            <span style={{ fontSize: '0.55rem', color: 'var(--color-text-muted)' }}>FIFA WORLD CUP 2026</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h5 className="sport-font text-center text-neon-yellow" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Gran Final 🏆</h5>
              {renderBracketNode(finalId)}
            </div>

            <div>
              <h5 className="sport-font text-center text-neon-red" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Tercer Puesto 🥉</h5>
              {renderBracketNode(thirdPlaceId)}
            </div>
          </div>
        </div>

        {/* 6. SEMIFINAL DERECHA */}
        <div className="bracket-column">
          <h4 className="sport-font bracket-column-title">Semifinal (Der)</h4>
          {renderBracketNode(rightSFId)}
        </div>

        {/* 7. CUARTOS DERECHA */}
        <div className="bracket-column">
          <h4 className="sport-font bracket-column-title">Cuartos (Der)</h4>
          {rightQFIds.map(id => renderBracketNode(id))}
        </div>

        {/* 8. OCTAVOS DERECHA */}
        <div className="bracket-column">
          <h4 className="sport-font bracket-column-title">Octavos (Der)</h4>
          {rightR16Ids.map(id => renderBracketNode(id))}
        </div>

        {/* 9. DIECISEISAVOS DERECHO */}
        <div className="bracket-column">
          <h4 className="sport-font bracket-column-title">1/16 Final (Der)</h4>
          {rightR32Ids.map(id => renderBracketNode(id))}
        </div>

      </div>

      {/* MODAL DETALLADO DEL PARTIDO */}
      {selectedMatch && (
        <div className="celebration-modal" style={{ zIndex: 1000 }}>
          {/* Fondo difuminado */}
          <div 
            onClick={() => setSelectedMatch(null)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}
          />
          
          <div 
            className="glass-panel page-swipe" 
            style={{ 
              width: '90%', 
              maxWidth: '430px', 
              padding: '1.25rem 1rem 1rem 1rem', 
              position: 'relative', 
              zIndex: 1001,
              background: 'linear-gradient(135deg, hsl(240, 35%, 12%) 0%, hsl(240, 35%, 8%) 100%)' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsla(0,0%,100%,0.08)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <span className="sport-font" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                Cargar Predicción
              </span>
              <button 
                onClick={() => setSelectedMatch(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.3rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>
            
            <MatchCard match={selectedMatch} />
          </div>
        </div>
      )}

    </div>
  );
};

export default TournamentBracket;
