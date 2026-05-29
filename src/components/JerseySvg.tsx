import React from 'react';

interface JerseySvgProps {
  primaryColor?: string;
  secondaryColor?: string;
  pattern?: 'solid' | 'striped' | 'hoops' | 'sash';
  number?: number;
  size?: number;
  className?: string;
}

export const JerseySvg: React.FC<JerseySvgProps> = ({
  primaryColor = '#00d4ff',
  secondaryColor = '#ffffff',
  pattern = 'solid',
  number = 10,
  size = 40,
  className = ''
}) => {
  const normalizedNum = Math.min(99, Math.max(1, number));
  const idSuffix = React.useId().replace(/:/g, '');
  const clipId = `jersey-clip-${idSuffix}`;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={`jersey-svg-icon ${className}`}
      style={{ overflow: 'visible', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M 25 15 C 35 12, 65 12, 75 15 L 92 32 L 80 43 L 73 37 L 73 85 Q 73 88, 70 88 L 30 88 Q 27 88, 27 85 L 27 37 L 20 43 L 8 32 Z" />
        </clipPath>
      </defs>

      {/* Camiseta Base */}
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="100" height="100" fill={primaryColor} />

        {/* Patrones de diseño */}
        {pattern === 'striped' && (
          <>
            <rect x="18" y="0" width="10" height="100" fill={secondaryColor} />
            <rect x="38" y="0" width="10" height="100" fill={secondaryColor} />
            <rect x="58" y="0" width="10" height="100" fill={secondaryColor} />
            <rect x="78" y="0" width="10" height="100" fill={secondaryColor} />
          </>
        )}

        {pattern === 'hoops' && (
          <>
            <rect x="0" y="22" width="100" height="10" fill={secondaryColor} />
            <rect x="0" y="42" width="100" height="10" fill={secondaryColor} />
            <rect x="0" y="62" width="100" height="10" fill={secondaryColor} />
            <rect x="0" y="82" width="100" height="10" fill={secondaryColor} />
          </>
        )}

        {pattern === 'sash' && (
          <path d="M -10 10 L 85 110 L 115 110 L 20 10 Z" fill={secondaryColor} />
        )}
      </g>

      {/* Contornos y pliegues */}
      <path 
        d="M 25 15 C 35 12, 65 12, 75 15 L 92 32 L 80 43 L 73 37 L 73 85 Q 73 88, 70 88 L 30 88 Q 27 88, 27 85 L 27 37 L 20 43 L 8 32 Z" 
        fill="none" 
        stroke="rgba(0,0,0,0.2)" 
        strokeWidth="3" 
      />

      {/* Cuello */}
      <path 
        d="M 38 14 C 42 22, 58 22, 62 14" 
        fill="none" 
        stroke={secondaryColor} 
        strokeWidth="4" 
        strokeLinecap="round"
      />

      {/* Detalles de Mangas */}
      <line x1="8" y1="32" x2="20" y2="43" stroke={secondaryColor} strokeWidth="3.5" />
      <line x1="92" y1="32" x2="80" y2="43" stroke={secondaryColor} strokeWidth="3.5" />

      {/* Dorsal */}
      <text 
        x="50" 
        y="66" 
        textAnchor="middle" 
        fill={secondaryColor} 
        fontSize="24" 
        fontWeight="900" 
        fontFamily="var(--font-sporty)"
        style={{
          letterSpacing: '-1px',
          paintOrder: 'stroke fill',
          stroke: 'rgba(0,0,0,0.5)',
          strokeWidth: '3.5px'
        }}
      >
        {normalizedNum}
      </text>
    </svg>
  );
};

export default JerseySvg;
