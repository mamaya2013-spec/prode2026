import React, { useState, useEffect } from 'react';
import bicycleKickImg from '../assets/soccer_bicycle_kick.png';
import penaltyKickImg from '../assets/soccer_penalty_kick.png';
import luxuryDribbleImg from '../assets/soccer_luxury_dribble.png';
import overheadKickImg from '../assets/soccer_overhead_kick.png';
import skillMoveImg from '../assets/soccer_skill_move.png';
import freekickImg from '../assets/soccer_freekick.png';
import goalkeeperSaveImg from '../assets/soccer_goalkeeper_save.png';
import celebrationImg from '../assets/soccer_celebration.png';

type ActionType = 'bicycle' | 'penalty' | 'dribble' | 'overhead' | 'skill' | 'freekick' | 'save' | 'celebration';

interface SoccerActionVisualProps {
  className?: string;
  size?: number;
  action?: ActionType | 'cycle';
}

const ALL_ACTIONS: ActionType[] = ['bicycle', 'penalty', 'dribble', 'overhead', 'skill', 'freekick', 'save', 'celebration'];

export const SoccerActionVisual: React.FC<SoccerActionVisualProps> = ({ 
  className = '', 
  size = 60, 
  action = 'cycle' 
}) => {
  const [currentAction, setCurrentAction] = useState<ActionType>('bicycle');
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (action !== 'cycle') {
      setCurrentAction(action as ActionType);
      return;
    }
    // Rotar entre TODAS las 8 imágenes de acción cada 4 segundos con transición suave
    let idx = Math.floor(Math.random() * ALL_ACTIONS.length);
    setCurrentAction(ALL_ACTIONS[idx]);

    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        idx = (idx + 1) % ALL_ACTIONS.length;
        setCurrentAction(ALL_ACTIONS[idx]);
        setTransitioning(false);
      }, 400); // Fade out duración
    }, 4000);
    return () => clearInterval(interval);
  }, [action]);

  const getImageSrc = () => {
    switch (currentAction) {
      case 'penalty': return penaltyKickImg;
      case 'dribble': return luxuryDribbleImg;
      case 'overhead': return overheadKickImg;
      case 'skill': return skillMoveImg;
      case 'freekick': return freekickImg;
      case 'save': return goalkeeperSaveImg;
      case 'celebration': return celebrationImg;
      case 'bicycle':
      default: return bicycleKickImg;
    }
  };

  const getActionGlowColor = () => {
    switch (currentAction) {
      case 'penalty': return '0 0 25px hsla(145, 95%, 50%, 0.7)';
      case 'dribble': return '0 0 25px hsla(285, 95%, 55%, 0.7)';
      case 'overhead': return '0 0 25px hsla(45, 100%, 55%, 0.7)';
      case 'skill': return '0 0 25px hsla(0, 95%, 55%, 0.7)';
      case 'freekick': return '0 0 25px hsla(30, 100%, 55%, 0.7)';
      case 'save': return '0 0 25px hsla(180, 90%, 50%, 0.7)';
      case 'celebration': return '0 0 25px hsla(55, 100%, 55%, 0.7)';
      case 'bicycle':
      default: return '0 0 25px hsla(195, 95%, 50%, 0.7)';
    }
  };

  const getActionTitle = () => {
    switch (currentAction) {
      case 'penalty': return 'Pateando Penal';
      case 'dribble': return 'Dribble de Lujo';
      case 'overhead': return 'Chilena Épica';
      case 'skill': return 'Jugada de Lujo';
      case 'freekick': return 'Tiro Libre';
      case 'save': return 'Atajada Increíble';
      case 'celebration': return 'Gol Celebración';
      case 'bicycle': return 'Chilena';
      default: return 'Jugada de Fútbol';
    }
  };

  return (
    <div 
      className={`soccer-action-visual-container ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title={getActionTitle()}
    >
      {/* Círculo Neón de Fondo Animado */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '50%',
          border: '2px solid transparent',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary)) border-box',
          mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'destination-out',
          animation: 'spinNeon 12s infinite linear',
          opacity: 0.85,
          boxShadow: getActionGlowColor(),
          transition: 'box-shadow 0.6s ease'
        } as React.CSSProperties}
      />

      {/* Imagen del Jugador con Máscara Circular y Flotación */}
      <div
        className="soccer-action-image-wrapper"
        style={{
          width: '90%',
          height: '90%',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          background: 'var(--bg-stadium-deep)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'soccerFloat 3s infinite ease-in-out',
        }}
      >
        <img 
          src={getImageSrc()} 
          alt={getActionTitle()} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out',
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'scale(0.85)' : 'scale(1)',
          }}
        />
      </div>
    </div>
  );
};

export default SoccerActionVisual;
