import React, { useState } from 'react';
import { useProde } from '../context/ProdeContext';

export interface BadgeDefinition {
  id: string;
  title: string;
  desc: string;
  type: 'boot' | 'crystal' | 'shield' | 'ticket' | 'whistle' | 'crown' | 'flame' | 'star' | 'net' | 'gloves' | 'medal' | 'lightning' | 'diamond' | 'rocket' | 'globe';
  flavor: string;
  tier: 'bronze' | 'silver' | 'gold' | 'legendary';
}

export const BADGES: BadgeDefinition[] = [
  // ── TIER BRONCE (Fáciles de alcanzar) ──
  { 
    id: 'fiel', 
    title: 'Ticket Holográfico', 
    desc: 'Guardaste una predicción con más de 24 horas de antelación.', 
    type: 'ticket',
    flavor: 'Fanático fiel desde la primera hora. ¡Entrada VIP asegurada! 🎟️✨',
    tier: 'bronze'
  },
  { 
    id: 'primerGol', 
    title: 'Primer Gol', 
    desc: 'Acertaste el ganador de un partido por primera vez.', 
    type: 'net',
    flavor: 'El primero siempre se recuerda. ¡Rompiste la red! 🥅⚡',
    tier: 'bronze'
  },
  { 
    id: 'apuestaTodo', 
    title: 'All-In', 
    desc: 'Usaste tu primer comodín en un partido.', 
    type: 'star',
    flavor: 'Apostaste fuerte y dejaste todo en la cancha. ¡Corazón de campeón! ⭐🔥',
    tier: 'bronze'
  },
  {
    id: 'ceroACero',
    title: 'Muro Infranqueable',
    desc: 'Predeciste correctamente un empate 0-0.',
    type: 'gloves',
    flavor: 'Viste la película completa: 90 minutos sin goles. ¡Visionario del fútbol! 🧤🛡️',
    tier: 'bronze'
  },

  // ── TIER PLATA (Requieren dedicación) ──
  { 
    id: 'invicto', 
    title: 'Silbato de Oro', 
    desc: 'Encadenaste una Racha de Fuego de 3 partidos sumando puntos.', 
    type: 'whistle',
    flavor: 'Marcas el ritmo del partido. ¡Nadie puede detener tu silbato! 📣🎗️',
    tier: 'silver'
  },
  { 
    id: 'francotirador', 
    title: 'Botín de Oro', 
    desc: 'Acertaste un resultado exacto con 4 o más goles.', 
    type: 'boot',
    flavor: '¡Clavaste el tiro libre justo en el ángulo donde tejen las arañas! 🎯🥅',
    tier: 'silver'
  },
  { 
    id: 'matagigantes', 
    title: 'Escudo del León', 
    desc: 'Predeciste la victoria de un equipo débil frente a una potencia.', 
    type: 'shield',
    flavor: 'Desafiaste las apuestas del Mundial y rugiste más fuerte. 🦁🔥',
    tier: 'silver'
  },
  {
    id: 'goleador',
    title: 'Máquina de Goles',
    desc: 'Acertaste 5 ganadores correctos en total.',
    type: 'rocket',
    flavor: 'Cada predicción tuya es un misil teledirigido al arco rival. ¡Imparable! 🚀💥',
    tier: 'silver'
  },
  {
    id: 'dobleComodin',
    title: 'Jugador de Póker',
    desc: 'Ganaste puntos dobles con un comodín activo.',
    type: 'lightning',
    flavor: 'Jugaste tu carta maestra en el momento perfecto. ¡All-in y victoria! ⚡🃏',
    tier: 'silver'
  },

  // ── TIER ORO (Difíciles, requieren habilidad) ──
  { 
    id: 'profeta', 
    title: 'Pelota de Cristal', 
    desc: 'Lograste 3 aciertos exactos de marcadores en el prode.', 
    type: 'crystal',
    flavor: 'Tienes la visión del director técnico campeón. ¡Lees el futuro! 🔮⚽',
    tier: 'gold'
  },
  {
    id: 'rachaFuego',
    title: 'Racha Infernal',
    desc: 'Encadenaste una racha de 5 o más partidos acertando.',
    type: 'flame',
    flavor: 'Estás en llamas, nadie te apaga. ¡El estadio tiembla con tu racha! 🔥🔥🔥',
    tier: 'gold'
  },
  {
    id: 'globalista',
    title: 'Trotamundos',
    desc: 'Acertaste ganadores de 4 continentes diferentes.',
    type: 'globe',
    flavor: 'Tu conocimiento del fútbol no tiene fronteras. ¡Ciudadano del mundo! 🌍⚽',
    tier: 'gold'
  },
  {
    id: 'top3',
    title: 'Podio Mundial',
    desc: 'Alcanzaste el Top 3 de tu grupo en el leaderboard.',
    type: 'medal',
    flavor: 'Subiste al podio de los inmortales. ¡La gloria es tuya! 🏅🎖️',
    tier: 'gold'
  },

  // ── TIER LEGENDARIO (Casi imposibles) ──
  {
    id: 'leyenda',
    title: 'Leyenda Absoluta',
    desc: 'Acertaste 5 marcadores exactos en el prode.',
    type: 'crown',
    flavor: 'Eres el Messi de las predicciones. El mundo se arrodilla ante tu genialidad. 👑🐐',
    tier: 'legendary'
  },
  {
    id: 'diamante',
    title: 'Diamante Eterno',
    desc: 'Acumulaste 30 o más puntos en el prode.',
    type: 'diamond',
    flavor: 'Brillante, invulnerable y eterno. ¡El diamante del fútbol mundial! 💎✨',
    tier: 'legendary'
  }
];

const TIER_COLORS: Record<string, string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: 'var(--color-gold)',
  legendary: '#b90df2'
};

const TIER_LABELS: Record<string, string> = {
  bronze: '⭐ Bronce',
  silver: '⭐⭐ Plata',
  gold: '⭐⭐⭐ Oro',
  legendary: '👑 Legendario'
};

export const Achievements: React.FC = () => {
  const { currentUser } = useProde();
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

  if (!currentUser) return null;

  const unlockedCount = BADGES.filter(b => currentUser.achievements.includes(b.id)).length;
  const progressPercent = Math.round((unlockedCount / BADGES.length) * 100);

  const renderBadgeIcon = (type: BadgeDefinition['type'], isUnlocked: boolean) => {
    const color = isUnlocked ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.15)';
    
    switch (type) {
      case 'boot':
        return (
          <svg className="medal-svg" viewBox="0 0 100 100">
            <path 
              d="M15,65 C15,65 30,70 50,68 C70,66 85,55 90,45 C80,35 60,35 50,40 C45,45 35,45 25,35 L15,40 Z" 
              fill={color} 
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="2"
            />
            <rect x="25" y="65" width="6" height="8" rx="2" fill={color} />
            <rect x="40" y="66" width="6" height="8" rx="2" fill={color} />
            <rect x="60" y="62" width="6" height="8" rx="2" fill={color} />
            <rect x="75" y="55" width="6" height="8" rx="2" fill={color} />
            <circle cx="85" cy="25" r="8" fill={color} opacity={isUnlocked ? 1 : 0.3} />
            <path d="M72,32 L80,28" stroke={color} strokeWidth="2" strokeDasharray="2,2" />
          </svg>
        );
      case 'crystal':
        return (
          <svg className="medal-svg" viewBox="0 0 100 100">
            <circle cx="50" cy="45" r="30" fill="none" stroke={color} strokeWidth="3" />
            <path d="M30,30 C40,40 60,40 70,30" fill="none" stroke={color} strokeWidth="2" />
            <path d="M22,53 C35,60 65,60 78,53" fill="none" stroke={color} strokeWidth="2" />
            <path d="M50,15 C50,30 50,60 50,75" fill="none" stroke={color} strokeWidth="2" />
            <path d="M35,80 L65,80 L60,88 L40,88 Z" fill={color} />
            <path d="M50,75 L50,80" stroke={color} strokeWidth="3" />
          </svg>
        );
      case 'shield':
        return (
          <svg className="medal-svg" viewBox="0 0 100 100">
            <path 
              d="M20,15 C40,10 60,10 80,15 C80,50 70,80 50,92 C30,80 20,50 20,15 Z" 
              fill="none" 
              stroke={color} 
              strokeWidth="3" 
            />
            <path 
              d="M42,32 C45,28 55,28 58,32 C58,32 50,38 50,45 C50,55 58,60 55,68 C45,68 42,55 42,45 Z" 
              fill={color} 
            />
            <path d="M35,28 L65,28" stroke={color} strokeWidth="2" />
          </svg>
        );
      case 'ticket':
        return (
          <svg className="medal-svg" viewBox="0 0 100 100">
            <rect x="18" y="30" width="64" height="40" rx="6" fill="none" stroke={color} strokeWidth="3" transform="rotate(-15 50 50)" />
            <circle cx="15" cy="50" r="6" fill="var(--bg-stadium-deep)" />
            <circle cx="85" cy="50" r="6" fill="var(--bg-stadium-deep)" />
            <text x="50" y="55" fill={color} fontSize="14" fontWeight="bold" textAnchor="middle" transform="rotate(-15 50 50)">FIFA 26</text>
          </svg>
        );
      case 'whistle':
        return (
          <svg className="medal-svg medal-svg-invicto" viewBox="0 0 100 100">
            <path 
              d="M25,40 L60,40 C70,40 78,48 78,58 C78,68 70,76 60,76 L35,76 C28,76 22,70 22,63 L22,43 C22,41 24,40 25,40 Z" 
              fill="none" 
              stroke={isUnlocked ? 'var(--color-blue-neon)' : 'rgba(255, 255, 255, 0.15)'} 
              strokeWidth="3.5" 
            />
            <rect x="68" y="44" width="16" height="8" rx="2" fill={isUnlocked ? 'var(--color-blue-neon)' : 'rgba(255, 255, 255, 0.15)'} />
            <circle cx="14" cy="52" r="6" fill="none" stroke={isUnlocked ? 'var(--color-blue-neon)' : 'rgba(255, 255, 255, 0.15)'} strokeWidth="2" />
          </svg>
        );
      case 'crown':
        return (
          <svg className="medal-svg" viewBox="0 0 100 100">
            <path d="M15,65 L25,30 L40,50 L50,20 L60,50 L75,30 L85,65 Z" fill={isUnlocked ? '#b90df2' : color} stroke={isUnlocked ? '#d946ef' : 'rgba(255,255,255,0.15)'} strokeWidth="2.5" />
            <rect x="15" y="65" width="70" height="12" rx="3" fill={isUnlocked ? '#b90df2' : color} />
            <circle cx="35" cy="38" r="4" fill={isUnlocked ? '#ffd700' : color} opacity={isUnlocked ? 1 : 0.3} />
            <circle cx="50" cy="28" r="5" fill={isUnlocked ? '#ffd700' : color} opacity={isUnlocked ? 1 : 0.3} />
            <circle cx="65" cy="38" r="4" fill={isUnlocked ? '#ffd700' : color} opacity={isUnlocked ? 1 : 0.3} />
          </svg>
        );
      case 'flame':
        return (
          <svg className="medal-svg" viewBox="0 0 100 100">
            <path d="M50,10 C55,25 70,30 70,50 C70,65 60,80 50,85 C40,80 30,65 30,50 C30,30 45,25 50,10 Z" fill={isUnlocked ? '#ff6a00' : color} stroke={isUnlocked ? '#ff9f1a' : 'rgba(255,255,255,0.15)'} strokeWidth="2" />
            <path d="M50,35 C53,45 60,48 60,58 C60,66 55,72 50,75 C45,72 40,66 40,58 C40,48 47,45 50,35 Z" fill={isUnlocked ? '#ffd700' : 'rgba(255,255,255,0.08)'} />
            <path d="M50,52 C52,57 55,58 55,63 C55,67 53,70 50,72 C47,70 45,67 45,63 C45,58 48,57 50,52 Z" fill={isUnlocked ? '#fff5' : 'rgba(255,255,255,0.05)'} />
          </svg>
        );
      case 'star':
        return (
          <svg className="medal-svg" viewBox="0 0 100 100">
            <polygon points="50,12 62,38 90,42 69,62 74,90 50,76 26,90 31,62 10,42 38,38" fill={isUnlocked ? 'var(--color-secondary)' : color} stroke={isUnlocked ? '#ffd700' : 'rgba(255,255,255,0.15)'} strokeWidth="2" />
            <polygon points="50,28 57,44 74,46 62,57 65,74 50,66 35,74 38,57 26,46 43,44" fill={isUnlocked ? '#ffd70080' : 'rgba(255,255,255,0.05)'} />
          </svg>
        );
      case 'net':
        return (
          <svg className="medal-svg" viewBox="0 0 100 100">
            {/* Goal net frame */}
            <rect x="15" y="25" width="70" height="55" rx="3" fill="none" stroke={color} strokeWidth="3" />
            {/* Net lines */}
            <line x1="15" y1="25" x2="50" y2="55" stroke={color} strokeWidth="1.5" opacity="0.6" />
            <line x1="85" y1="25" x2="50" y2="55" stroke={color} strokeWidth="1.5" opacity="0.6" />
            <line x1="15" y1="50" x2="85" y2="50" stroke={color} strokeWidth="1.5" opacity="0.4" />
            <line x1="50" y1="25" x2="50" y2="80" stroke={color} strokeWidth="1.5" opacity="0.4" />
            {/* Ball going in */}
            <circle cx="50" cy="48" r="10" fill={isUnlocked ? 'var(--color-primary)' : color} opacity={isUnlocked ? 0.9 : 0.3} />
            <path d="M45,45 L55,45 L53,52 L47,52 Z" fill={isUnlocked ? '#fff' : 'transparent'} opacity="0.5" />
          </svg>
        );
      case 'gloves':
        return (
          <svg className="medal-svg" viewBox="0 0 100 100">
            {/* Goalkeeper glove */}
            <path d="M25,55 L25,30 C25,25 30,20 35,20 L40,20 L40,15 L48,15 L48,20 L52,20 L52,15 L60,15 L60,20 L65,20 C70,20 75,25 75,30 L75,55 C75,70 65,80 50,82 C35,80 25,70 25,55 Z" fill="none" stroke={isUnlocked ? 'var(--color-primary)' : color} strokeWidth="3" />
            {/* Palm padding */}
            <rect x="35" y="40" width="30" height="18" rx="5" fill={isUnlocked ? 'var(--color-primary)' : color} opacity="0.4" />
            <text x="50" y="54" fill={isUnlocked ? '#fff' : color} fontSize="11" fontWeight="bold" textAnchor="middle">0-0</text>
          </svg>
        );
      case 'medal':
        return (
          <svg className="medal-svg" viewBox="0 0 100 100">
            {/* Ribbon */}
            <path d="M35,10 L50,35 L65,10" fill={isUnlocked ? 'var(--color-accent)' : color} opacity="0.7" />
            <path d="M30,10 L45,35" stroke={isUnlocked ? '#ff1492' : color} strokeWidth="8" />
            <path d="M70,10 L55,35" stroke={isUnlocked ? '#ff69b4' : color} strokeWidth="8" />
            {/* Medal circle */}
            <circle cx="50" cy="58" r="25" fill="none" stroke={isUnlocked ? 'var(--color-gold)' : color} strokeWidth="3.5" />
            <circle cx="50" cy="58" r="18" fill={isUnlocked ? 'var(--color-gold)' : color} opacity={isUnlocked ? 0.3 : 0.1} />
            <text x="50" y="65" fill={isUnlocked ? 'var(--color-gold)' : color} fontSize="18" fontWeight="bold" textAnchor="middle">3</text>
          </svg>
        );
      case 'lightning':
        return (
          <svg className="medal-svg" viewBox="0 0 100 100">
            <polygon points="55,10 30,50 48,50 42,90 72,45 52,45" fill={isUnlocked ? 'var(--color-secondary)' : color} stroke={isUnlocked ? '#ffd700' : 'rgba(255,255,255,0.15)'} strokeWidth="2" />
            {/* Electric sparks */}
            <line x1="25" y1="35" x2="15" y2="30" stroke={isUnlocked ? 'var(--color-secondary)' : color} strokeWidth="2" opacity="0.6" />
            <line x1="75" y1="55" x2="85" y2="50" stroke={isUnlocked ? 'var(--color-secondary)' : color} strokeWidth="2" opacity="0.6" />
            <line x1="28" y1="60" x2="18" y2="65" stroke={isUnlocked ? 'var(--color-secondary)' : color} strokeWidth="2" opacity="0.4" />
          </svg>
        );
      case 'diamond':
        return (
          <svg className="medal-svg" viewBox="0 0 100 100">
            {/* Diamond facets */}
            <polygon points="50,10 20,40 50,90 80,40" fill="none" stroke={isUnlocked ? '#00d4ff' : color} strokeWidth="2.5" />
            <polygon points="50,10 20,40 50,45 80,40" fill={isUnlocked ? '#00d4ff' : color} opacity={isUnlocked ? 0.35 : 0.1} />
            <polygon points="20,40 50,90 50,45" fill={isUnlocked ? '#0af' : color} opacity={isUnlocked ? 0.2 : 0.05} />
            <polygon points="80,40 50,90 50,45" fill={isUnlocked ? '#00bfff' : color} opacity={isUnlocked ? 0.3 : 0.08} />
            {/* Center line */}
            <line x1="20" y1="40" x2="80" y2="40" stroke={isUnlocked ? '#00d4ff' : color} strokeWidth="1.5" />
            <line x1="50" y1="10" x2="50" y2="45" stroke={isUnlocked ? '#00d4ff' : color} strokeWidth="1.5" opacity="0.5" />
            {/* Sparkle */}
            <circle cx="50" cy="35" r="3" fill={isUnlocked ? '#fff' : 'transparent'} opacity="0.7" />
          </svg>
        );
      case 'rocket':
        return (
          <svg className="medal-svg" viewBox="0 0 100 100">
            {/* Rocket body */}
            <path d="M50,10 C55,10 62,25 62,50 C62,65 58,75 50,85 C42,75 38,65 38,50 C38,25 45,10 50,10 Z" fill="none" stroke={isUnlocked ? 'var(--color-primary)' : color} strokeWidth="2.5" />
            {/* Window */}
            <circle cx="50" cy="38" r="8" fill={isUnlocked ? 'var(--color-blue-neon)' : color} opacity={isUnlocked ? 0.6 : 0.2} />
            <circle cx="50" cy="38" r="5" fill={isUnlocked ? '#fff' : color} opacity={isUnlocked ? 0.3 : 0.1} />
            {/* Fins */}
            <path d="M38,60 L25,72 L38,70" fill={isUnlocked ? 'var(--color-accent)' : color} opacity="0.7" />
            <path d="M62,60 L75,72 L62,70" fill={isUnlocked ? 'var(--color-accent)' : color} opacity="0.7" />
            {/* Exhaust flames */}
            <path d="M44,85 L50,98 L56,85" fill={isUnlocked ? '#ff6a00' : color} opacity={isUnlocked ? 0.8 : 0.2} />
            <path d="M47,85 L50,94 L53,85" fill={isUnlocked ? '#ffd700' : 'transparent'} opacity="0.5" />
          </svg>
        );
      case 'globe':
        return (
          <svg className="medal-svg" viewBox="0 0 100 100">
            {/* Globe */}
            <circle cx="50" cy="50" r="35" fill="none" stroke={isUnlocked ? 'var(--color-primary)' : color} strokeWidth="2.5" />
            {/* Longitude lines */}
            <ellipse cx="50" cy="50" rx="15" ry="35" fill="none" stroke={isUnlocked ? 'var(--color-primary)' : color} strokeWidth="1.5" opacity="0.5" />
            <line x1="15" y1="50" x2="85" y2="50" stroke={isUnlocked ? 'var(--color-primary)' : color} strokeWidth="1.5" opacity="0.5" />
            {/* Latitude lines */}
            <ellipse cx="50" cy="35" rx="30" ry="5" fill="none" stroke={isUnlocked ? 'var(--color-primary)' : color} strokeWidth="1.2" opacity="0.4" />
            <ellipse cx="50" cy="65" rx="30" ry="5" fill="none" stroke={isUnlocked ? 'var(--color-primary)' : color} strokeWidth="1.2" opacity="0.4" />
            {/* Football */}
            <circle cx="65" cy="35" r="8" fill={isUnlocked ? 'var(--color-secondary)' : color} opacity={isUnlocked ? 0.7 : 0.2} />
          </svg>
        );
    }
  };

  // Grouping badges by tier for visual sections
  const tiers: Array<{ key: string; label: string; badges: BadgeDefinition[] }> = [
    { key: 'bronze', label: '⭐ Bronce — Primeros Pasos', badges: BADGES.filter(b => b.tier === 'bronze') },
    { key: 'silver', label: '⭐⭐ Plata — Jugador Dedicado', badges: BADGES.filter(b => b.tier === 'silver') },
    { key: 'gold', label: '⭐⭐⭐ Oro — Estrella del Prode', badges: BADGES.filter(b => b.tier === 'gold') },
    { key: 'legendary', label: '👑 Legendario — Inmortal', badges: BADGES.filter(b => b.tier === 'legendary') },
  ];

  return (
    <div className="achievements-container page-swipe">
      
      {/* TÍTULO DE LA SECCIÓN */}
      <h3 style={{ textTransform: 'uppercase', fontSize: '1.1rem', margin: '0.5rem 1rem 0 1rem', color: 'var(--color-secondary)' }}>
        Mis Logros Mundialistas
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 1rem 0.5rem 1rem' }}>
        Completa predicciones y rachas para coleccionar medallas interactivas de fútbol.
      </p>

      {/* BARRA DE PROGRESO GLOBAL */}
      <div style={{ margin: '0 1rem 1rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sporty)', textTransform: 'uppercase' }}>
            Progreso General
          </span>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-sporty)', color: 'var(--color-primary)', fontWeight: 800 }}>
            {unlockedCount}/{BADGES.length} ({progressPercent}%)
          </span>
        </div>
        <div style={{ 
          width: '100%', 
          height: '8px', 
          borderRadius: '4px', 
          background: 'hsla(240, 35%, 12%, 0.8)', 
          border: '1px solid hsla(0,0%,100%,0.06)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${progressPercent}%`, 
            height: '100%', 
            borderRadius: '4px',
            background: 'var(--gradient-neon)', 
            transition: 'width 1s cubic-bezier(0.25, 0.8, 0.25, 1)',
            boxShadow: '0 0 10px var(--color-primary)'
          }} />
        </div>
      </div>

      {/* SECCIONES POR TIER */}
      {tiers.map(tier => (
        <div key={tier.key} style={{ marginBottom: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            margin: '0 1rem 0.5rem 1rem',
            paddingBottom: '0.3rem',
            borderBottom: `1px solid ${TIER_COLORS[tier.key]}33`
          }}>
            <span style={{ 
              fontSize: '0.7rem', 
              fontFamily: 'var(--font-sporty)', 
              textTransform: 'uppercase', 
              color: TIER_COLORS[tier.key],
              letterSpacing: '0.5px'
            }}>
              {tier.label}
            </span>
            <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>
              ({tier.badges.filter(b => currentUser.achievements.includes(b.id)).length}/{tier.badges.length})
            </span>
          </div>

          {/* CUADRÍCULA DE MEDALLAS */}
          <div className="achievements-grid">
            {tier.badges.map(badge => {
              const isUnlocked = currentUser.achievements.includes(badge.id);
              
              return (
                <div 
                  key={badge.id}
                  className={`medal-card ${isUnlocked ? 'medal-card-unlocked medal-shine-trigger' : ''}`}
                  onClick={() => setSelectedBadge(badge)}
                  style={isUnlocked ? { borderColor: TIER_COLORS[badge.tier] } : undefined}
                >
                  {isUnlocked && <div className="medal-shine" />}
                  
                  <div className="medal-shape-wrapper">
                    {renderBadgeIcon(badge.type, isUnlocked)}
                  </div>
                  <span className="medal-title">{badge.title}</span>
                  <span style={{ 
                    fontSize: '0.55rem', 
                    color: isUnlocked ? TIER_COLORS[badge.tier] : 'rgba(255,255,255,0.25)', 
                    textTransform: 'uppercase', 
                    marginTop: '0.15rem', 
                    fontWeight: 'bold',
                    fontFamily: 'var(--font-sporty)'
                  }}>
                    {isUnlocked ? `✓ ${TIER_LABELS[badge.tier]}` : '🔒 Bloqueado'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* POPUP DE DETALLE DEL LOGRO */}
      {selectedBadge && (
        <div className="celebration-modal" style={{ background: 'rgba(4, 4, 8, 0.85)', backdropFilter: 'blur(8px)', zIndex: 105 }}>
          <div className="glass-panel celebration-content page-swipe" style={{ border: `1px solid ${TIER_COLORS[selectedBadge.tier]}`, position: 'relative' }}>
            
            <button 
              onClick={() => setSelectedBadge(null)}
              style={{ position: 'absolute', top: '10px', right: '12px', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>

            {/* Haz de luces tras el logro */}
            <div className="celebration-spark" style={{ transform: 'scale(1.2)' }} />

            <div className="medal-shape-wrapper" style={{ width: '80px', height: '80px' }}>
              {renderBadgeIcon(
                selectedBadge.type, 
                currentUser.achievements.includes(selectedBadge.id)
              )}
            </div>

            <div style={{ 
              fontSize: '0.6rem', 
              fontFamily: 'var(--font-sporty)', 
              textTransform: 'uppercase', 
              color: TIER_COLORS[selectedBadge.tier],
              letterSpacing: '1px',
              fontWeight: 'bold'
            }}>
              {TIER_LABELS[selectedBadge.tier]}
            </div>

            <h2 className="sport-font" style={{ color: TIER_COLORS[selectedBadge.tier], textTransform: 'uppercase', fontSize: '1.4rem' }}>
              {selectedBadge.title}
            </h2>

            <div style={{ padding: '0.5rem 0' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedBadge.desc}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                {selectedBadge.flavor}
              </p>
            </div>

            <div style={{ 
              fontSize: '0.75rem', 
              fontFamily: 'var(--font-sporty)',
              color: currentUser.achievements.includes(selectedBadge.id) ? 'var(--color-primary)' : 'var(--color-accent)',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {currentUser.achievements.includes(selectedBadge.id) ? '✅ DESBLOQUEADO' : '🔒 AÚN NO COMPLETADO'}
            </div>

            <button 
              className="btn-premium" 
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={() => setSelectedBadge(null)}
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Achievements;
