import React from 'react';
import { TEAMS } from '../data/matches2026';

interface ShieldProps {
  teamId: string;
  className?: string;
  size?: number;
}

export const ShieldSvg: React.FC<ShieldProps> = ({ teamId, className = '', size = 52 }) => {
  const team = TEAMS[teamId] || { id: '???', name: 'Unknown', short: '???', color: 'hsl(0, 0%, 50%)', emoji: '⚽' };

  // Dibuja los patrones y barras de la bandera real en el fondo del escudo
  const renderFlagPattern = (id: string) => {
    switch (id) {
      // 1. TRICOLORES VERTICALES
      case 'MEX': // Verde, Blanco (con escudo amarillo central), Rojo
        return (
          <>
            <rect x="0" y="0" width="33" height="100" fill="hsl(145, 80%, 25%)" />
            <rect x="33" y="0" width="34" height="100" fill="#ffffff" />
            <rect x="67" y="0" width="33" height="100" fill="hsl(355, 85%, 45%)" />
            <circle cx="50" cy="50" r="8" fill="url(#gold-coat-arms)" />
          </>
        );
      case 'FRA': // Azul, Blanco, Rojo
        return (
          <>
            <rect x="0" y="0" width="33" height="100" fill="hsl(220, 85%, 35%)" />
            <rect x="33" y="0" width="34" height="100" fill="#ffffff" />
            <rect x="67" y="0" width="33" height="100" fill="hsl(355, 85%, 45%)" />
          </>
        );
      case 'ITA': // Verde, Blanco, Rojo
        return (
          <>
            <rect x="0" y="0" width="33" height="100" fill="hsl(145, 75%, 35%)" />
            <rect x="33" y="0" width="34" height="100" fill="#ffffff" />
            <rect x="67" y="0" width="33" height="100" fill="hsl(355, 85%, 45%)" />
          </>
        );
      case 'BEL': // Negro, Amarillo, Rojo
        return (
          <>
            <rect x="0" y="0" width="33" height="100" fill="#111111" />
            <rect x="33" y="0" width="34" height="100" fill="hsl(48, 95%, 50%)" />
            <rect x="67" y="0" width="33" height="100" fill="hsl(355, 85%, 45%)" />
          </>
        );

      // 2. TRICOLORES HORIZONTALES
      case 'ARG': // Celeste, Blanco, Celeste (Sol en el medio)
        return (
          <>
            <rect x="0" y="0" width="100" height="33" fill="hsl(198, 90%, 65%)" />
            <rect x="0" y="33" width="100" height="34" fill="#ffffff" />
            <rect x="0" y="67" width="100" height="33" fill="hsl(198, 90%, 65%)" />
            <circle cx="50" cy="50" r="7" fill="hsl(45, 95%, 55%)" />
          </>
        );
      case 'COL': // Amarillo (doble), Azul, Rojo
      case 'ECU':
        return (
          <>
            <rect x="0" y="0" width="100" height="50" fill="hsl(48, 95%, 50%)" />
            <rect x="0" y="50" width="100" height="25" fill="hsl(215, 85%, 40%)" />
            <rect x="0" y="75" width="100" height="25" fill="hsl(355, 85%, 45%)" />
            {id === 'ECU' && <circle cx="50" cy="62" r="5" fill="hsl(35, 90%, 40%)" />}
          </>
        );
      case 'GER': // Negro, Rojo, Oro
        return (
          <>
            <rect x="0" y="0" width="100" height="33" fill="#111111" />
            <rect x="0" y="33" width="100" height="34" fill="hsl(355, 85%, 45%)" />
            <rect x="0" y="67" width="100" height="33" fill="hsl(45, 95%, 50%)" />
          </>
        );
      case 'ESP': // Rojo, Amarillo (doble), Rojo
        return (
          <>
            <rect x="0" y="0" width="100" height="25" fill="hsl(355, 90%, 45%)" />
            <rect x="0" y="25" width="100" height="50" fill="hsl(48, 95%, 50%)" />
            <rect x="0" y="75" width="100" height="25" fill="hsl(355, 90%, 45%)" />
            <rect x="30" y="40" width="8" height="18" fill="hsl(355, 80%, 40%)" />
          </>
        );
      case 'NED': // Rojo, Blanco, Azul
      case 'CRO':
        return (
          <>
            <rect x="0" y="0" width="100" height="33" fill="hsl(355, 85%, 45%)" />
            <rect x="0" y="33" width="100" height="34" fill="#ffffff" />
            <rect x="0" y="67" width="100" height="33" fill="hsl(215, 85%, 35%)" />
            {id === 'CRO' && <rect x="42" y="32" width="16" height="16" fill="hsl(355, 85%, 50%)" />}
          </>
        );

      // 3. DISEÑOS ESPECIALES / SÓLIDOS
      case 'BRA': // Verde, Diamante Amarillo, Círculo Azul
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="hsl(135, 90%, 35%)" />
            <polygon points="50,10 90,50 50,90 10,50" fill="hsl(48, 95%, 50%)" />
            <circle cx="50" cy="50" r="20" fill="hsl(215, 85%, 30%)" />
            <path d="M32,50 Q50,45 68,50" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          </>
        );
      case 'JPN': // Blanco con círculo rojo
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
            <circle cx="50" cy="50" r="24" fill="hsl(355, 85%, 45%)" />
          </>
        );
      case 'CAN': // Rojo, Blanco con Hoja, Rojo
        return (
          <>
            <rect x="0" y="0" width="28" height="100" fill="hsl(355, 85%, 45%)" />
            <rect x="28" y="0" width="44" height="100" fill="#ffffff" />
            <rect x="72" y="0" width="28" height="100" fill="hsl(355, 85%, 45%)" />
            {/* Hoja de maple simplificada */}
            <polygon points="50,30 54,42 66,42 58,49 62,62 50,54 38,62 42,49 34,42 46,42" fill="hsl(355, 85%, 45%)" />
          </>
        );
      case 'SUI': // Rojo con cruz blanca
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="hsl(355, 85%, 45%)" />
            <rect x="42" y="20" width="16" height="60" fill="#ffffff" />
            <rect x="20" y="42" width="60" height="16" fill="#ffffff" />
          </>
        );
      case 'ENG': // Blanco con cruz roja
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
            <rect x="44" y="0" width="12" height="100" fill="hsl(355, 85%, 45%)" />
            <rect x="0" y="44" width="100" height="12" fill="hsl(355, 85%, 45%)" />
          </>
        );
      case 'USA': // Rayas rojas y blancas, canton azul
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
            {/* 13 rayas simuladas */}
            {[0, 14, 28, 42, 56, 70, 84, 98].map((y, i) => (
              <rect key={i} x="0" y={y} width="100" height="8" fill="hsl(355, 85%, 45%)" />
            ))}
            <rect x="0" y="0" width="50" height="50" fill="hsl(215, 90%, 25%)" />
            <circle cx="15" cy="15" r="2" fill="#ffffff" />
            <circle cx="35" cy="15" r="2" fill="#ffffff" />
            <circle cx="25" cy="35" r="2" fill="#ffffff" />
          </>
        );
      case 'URU': // Rayas celestes y blancas, canton amarillo
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
            {[0, 22, 44, 66, 88].map((y, i) => (
              <rect key={i} x="0" y={y} width="100" height="11" fill="hsl(198, 85%, 55%)" />
            ))}
            <rect x="0" y="0" width="40" height="40" fill="#ffffff" stroke="#dddddd" strokeWidth="1" />
            <circle cx="20" cy="20" r="8" fill="hsl(45, 95%, 55%)" />
          </>
        );

      // 4. DISEÑO GENÉRICO (Para el resto de selecciones en la demo)
      default:
        // Genera rayas diagonales deportivas dinámicas basadas en su color de acento
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill={team.color} />
            <polygon points="0,0 60,0 0,60" fill="rgba(255,255,255,0.2)" />
            <polygon points="40,100 100,40 100,100" fill="rgba(0,0,0,0.2)" />
          </>
        );
    }
  };

  const primaryColor = team.color;
  const hslMatch = primaryColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  let glowColor = primaryColor;

  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10);
    const s = parseInt(hslMatch[2], 10);
    glowColor = `hsla(${h}, ${s}%, 55%, 0.55)`;
  }

  return (
    <div 
      className={`team-shield-container flag-waving ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        '--glow-color': glowColor,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      } as React.CSSProperties}
      title={team.name}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="team-shield-svg"
        style={{ 
          width: '95%', 
          height: '95%',
          filter: 'drop-shadow(0 6px 15px rgba(0,0,0,0.65))',
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <defs>
          <linearGradient id={`gold-border-${teamId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(45, 100%, 75%)" />
            <stop offset="50%" stopColor="hsl(40, 95%, 45%)" />
            <stop offset="100%" stopColor="hsl(45, 100%, 65%)" />
          </linearGradient>

          <linearGradient id="gold-coat-arms" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(45, 100%, 60%)" />
            <stop offset="100%" stopColor="hsl(30, 90%, 40%)" />
          </linearGradient>
          
          {/* Efecto Cristal 3D */}
          <linearGradient id="gloss-reflection" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="35%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          
          {/* ClipPath para recortar la bandera dentro de la silueta del escudo oficial */}
          <clipPath id={`shield-clip-${teamId}`}>
            <path d="M10,10 C35,5 65,5 90,10 C90,45 80,80 50,95 C20,80 10,45 10,10 Z" />
          </clipPath>
        </defs>
        
        {/* Recorte de la Bandera Nacional */}
        <g clipPath={`url(#shield-clip-${teamId})`}>
          {renderFlagPattern(team.id)}
        </g>

        {/* Borde de Oro del Escudo */}
        <path 
          d="M10,10 C35,5 65,5 90,10 C90,45 80,80 50,95 C20,80 10,45 10,10 Z" 
          fill="none"
          stroke={`url(#gold-border-${teamId})`}
          strokeWidth="4.5"
        />

        {/* Reflejo brillante superior de vidrio de estadio */}
        <path 
          d="M14,14 C35,11 65,11 86,14 C86,26 77,41 50,41 C23,41 14,26 14,14 Z" 
          fill="url(#gloss-reflection)"
        />
        
        {/* Abreviatura de la selección flotante en el centro del escudo con alto contraste */}
        <text 
          x="50" 
          y="68" 
          textAnchor="middle" 
          fill="#ffffff" 
          fontSize="22" 
          fontWeight="900" 
          fontFamily="'Outfit', sans-serif"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.8)' }}
        >
          {team.short}
        </text>
      </svg>
    </div>
  );
};
export default ShieldSvg;
