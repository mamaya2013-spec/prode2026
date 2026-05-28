import React from 'react';

interface TrophyProps {
  className?: string;
  size?: number;
}

export const TrophySvg: React.FC<TrophyProps> = ({ className = '', size = 50 }) => {
  return (
    <div 
      className={`trophy-container ${className}`} 
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg 
        viewBox="0 0 100 120" 
        className="trophy-svg trophy-spin"
        style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
      >
        <defs>
          {/* Degradado metálico de oro pulido real con alto contraste */}
          <linearGradient id="gold-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(46, 100%, 78%)" />
            <stop offset="20%" stopColor="hsl(46, 95%, 55%)" />
            <stop offset="45%" stopColor="hsl(42, 100%, 42%)" />
            <stop offset="65%" stopColor="hsl(38, 90%, 30%)" />
            <stop offset="85%" stopColor="hsl(46, 95%, 58%)" />
            <stop offset="100%" stopColor="hsl(25, 100%, 15%)" />
          </linearGradient>

          {/* Degradado para el globo terráqueo liso y reflectivo */}
          <radialGradient id="gold-globe" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="hsl(48, 100%, 85%)" />
            <stop offset="40%" stopColor="hsl(46, 95%, 55%)" />
            <stop offset="75%" stopColor="hsl(38, 90%, 36%)" />
            <stop offset="100%" stopColor="hsl(25, 100%, 12%)" />
          </radialGradient>

          {/* Degradado para las bandas verdes oficiales de malaquita */}
          <linearGradient id="malachite-green" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(150, 95%, 15%)" />
            <stop offset="50%" stopColor="hsl(145, 100%, 32%)" />
            <stop offset="100%" stopColor="hsl(155, 95%, 12%)" />
          </linearGradient>

          {/* Sombra interna para dar profundidad a las líneas de los atletas */}
          <filter id="athlete-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="-1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.6"/>
          </filter>
        </defs>

        {/* ────────────────── 1. BASE CÓNICA FLAMEANTE ────────────────── */}
        {/* Borde inferior de la base */}
        <path d="M26,108 C35,112 65,112 74,108 C76,112 24,112 26,108 Z" fill="url(#gold-primary)" />
        <path d="M25,104 L26,108 C26,111 74,111 74,108 L75,104 Z" fill="url(#gold-primary)" />
        <ellipse cx="50" cy="105" rx="24.5" ry="3.5" fill="hsl(25, 100%, 10%)" />

        {/* Banda Verde de Malaquita 1 (Inferior) */}
        <path d="M26,98 C26,102 74,102 74,98 L75,104 C75,108 25,108 25,104 Z" fill="url(#malachite-green)" />
        <ellipse cx="50" cy="99" rx="24" ry="3.5" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

        {/* Anillo de Oro Medio */}
        <path d="M28,92 L72,92 L74,98 L26,98 Z" fill="url(#gold-primary)" />
        <ellipse cx="50" cy="93" rx="22" ry="3" fill="hsl(25, 100%, 15%)" />

        {/* Banda Verde de Malaquita 2 (Superior) */}
        <path d="M28,86 C28,90 72,90 72,86 L73,92 C73,96 27,96 27,92 Z" fill="url(#malachite-green)" />
        <ellipse cx="50" cy="87" rx="22" ry="3" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

        {/* Copa de Oro de la Base */}
        <path d="M32,74 L68,74 L72,86 L28,86 Z" fill="url(#gold-primary)" />
        
        {/* Texto grabado simulado 'FIFA WORLD CUP' en la base */}
        <path d="M35,95 L65,95" stroke="rgba(0,0,0,0.5)" strokeWidth="1" strokeDasharray="1,2" />
        <path d="M37,101 L63,101" stroke="rgba(0,0,0,0.5)" strokeWidth="1" strokeDasharray="1,2" />

        {/* ────────────────── 2. CUERPOS DE LOS ATLETAS (ESPIRAL TEXTURADO) ────────────────── */}
        {/* Tronco Común de soporte ascendente */}
        <path 
          d="M32,74 C32,68 38,62 42,50 C46,38 42,34 44,28 C45,34 50,42 47,52 C44,62 38,68 32,74 Z" 
          fill="url(#gold-primary)" 
        />
        <path 
          d="M68,74 C68,68 62,62 58,50 C54,38 58,34 56,28 C55,34 50,42 53,52 C56,62 62,68 68,74 Z" 
          fill="url(#gold-primary)" 
        />

        {/* Atleta Izquierdo: Líneas dinámicas orgánicas del cuerpo que asciende */}
        <path 
          d="M31,74 C34,60 40,55 45,50 C50,45 51,39 49,32 C46,25 41,23 41,18 C47,20 52,27 52,33 C52,40 45,46 41,52 C37,58 34,66 31,74 Z" 
          fill="url(#gold-primary)" 
          filter="url(#athlete-shadow)"
        />
        
        {/* Atleta Derecho: Se entrelaza y sube simétricamente */}
        <path 
          d="M69,74 C66,60 60,55 55,50 C50,45 49,39 51,32 C54,25 59,23 59,18 C53,20 48,27 48,33 C48,40 55,46 59,52 C63,58 66,66 69,74 Z" 
          fill="url(#gold-primary)" 
          filter="url(#athlete-shadow)"
        />

        {/* Textura rugosa de líneas cinceladas del trofeo real en las columnas */}
        <path d="M38,70 C41,60 43,55 46,51" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
        <path d="M62,70 C59,60 57,55 54,51" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
        <path d="M44,56 C46,46 48,40 48,34" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" fill="none" />
        <path d="M56,56 C54,46 52,40 52,34" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" fill="none" />

        {/* ────────────────── 3. GLOBO TERRÁQUEO (LISO Y ESFÉRICO) ────────────────── */}
        {/* Esfera Terrestre de Oro Liso en la cúspide */}
        <circle cx="50" cy="24" r="19" fill="url(#gold-globe)" />

        {/* Continentes grabados en el mundo (América y África/Europa visibles en el trofeo) */}
        <path 
          d="M37,18 C39,21 34,26 40,29 C45,31 43,26 48,25 C52,24 54,29 49,32 C46,34 45,39 49,41 C42,41 38,36 36,30 C34,26 34,21 37,18 Z" 
          fill="hsl(38, 70%, 30%)" 
          opacity="0.35" 
        />
        <path 
          d="M60,16 C63,18 64,22 62,25 C60,28 57,26 55,29 C53,32 55,36 52,39 C51,33 53,28 55,25 C57,22 56,18 60,16 Z" 
          fill="hsl(38, 70%, 30%)" 
          opacity="0.35" 
        />

        {/* Manos de los atletas que abrazan la base del globo por los costados */}
        <path d="M31,26 C30,22 34,22 36,25 C34,25 32,25 31,26 Z" fill="url(#gold-primary)" />
        <path d="M69,26 C70,22 66,22 64,25 C66,25 68,25 69,26 Z" fill="url(#gold-primary)" />

        {/* Destello de luz blanca reflectiva en la esfera */}
        <ellipse cx="42" cy="15" rx="5" ry="3.5" fill="#ffffff" opacity="0.6" transform="rotate(-25 42 15)" />
      </svg>
    </div>
  );
};
export default TrophySvg;
