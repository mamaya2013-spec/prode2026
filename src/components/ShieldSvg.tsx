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
      case 'CMR': // Camerún: Verde, Rojo (estrella amarilla), Amarillo
        return (
          <>
            <rect x="0" y="0" width="33" height="100" fill="hsl(135, 75%, 35%)" />
            <rect x="33" y="0" width="34" height="100" fill="hsl(355, 85%, 45%)" />
            <rect x="67" y="0" width="33" height="100" fill="hsl(48, 95%, 50%)" />
            <polygon points="50,42 52,50 60,50 54,54 56,62 50,57 44,62 46,54 40,50 48,50" fill="hsl(48, 95%, 50%)" />
          </>
        );
      case 'SEN': // Senegal: Verde, Amarillo (estrella verde), Rojo
        return (
          <>
            <rect x="0" y="0" width="33" height="100" fill="hsl(140, 80%, 40%)" />
            <rect x="33" y="0" width="34" height="100" fill="hsl(48, 95%, 50%)" />
            <rect x="67" y="0" width="33" height="100" fill="hsl(355, 85%, 45%)" />
            <polygon points="50,42 52,50 60,50 54,54 56,62 50,58 44,62 46,54 40,50 48,50" fill="hsl(140, 80%, 40%)" />
          </>
        );
      case 'PER': // Perú: Rojo, Blanco, Rojo
        return (
          <>
            <rect x="0" y="0" width="33" height="100" fill="hsl(355, 80%, 50%)" />
            <rect x="33" y="0" width="34" height="100" fill="#ffffff" />
            <rect x="67" y="0" width="33" height="100" fill="hsl(355, 80%, 50%)" />
          </>
        );
      case 'NGA': // Nigeria: Verde, Blanco, Verde
        return (
          <>
            <rect x="0" y="0" width="33" height="100" fill="hsl(145, 85%, 30%)" />
            <rect x="33" y="0" width="34" height="100" fill="#ffffff" />
            <rect x="67" y="0" width="33" height="100" fill="hsl(145, 85%, 30%)" />
          </>
        );
      case 'CIV': // Costa de Marfil: Naranja, Blanco, Verde
        return (
          <>
            <rect x="0" y="0" width="33" height="100" fill="hsl(28, 90%, 50%)" />
            <rect x="33" y="0" width="34" height="100" fill="#ffffff" />
            <rect x="67" y="0" width="33" height="100" fill="hsl(140, 80%, 40%)" />
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
            <rect x="0" y="0" width="100" height="25" fill="hsl(355, 90%, 50%)" />
            <rect x="0" y="25" width="100" height="50" fill="hsl(48, 95%, 50%)" />
            <rect x="0" y="75" width="100" height="25" fill="hsl(355, 90%, 50%)" />
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
      case 'POL': // Polonia: Blanco, Rojo
        return (
          <>
            <rect x="0" y="0" width="100" height="50" fill="#ffffff" />
            <rect x="0" y="50" width="100" height="50" fill="hsl(355, 80%, 50%)" />
          </>
        );
      case 'IRN': // Irán: Verde, Blanco, Rojo
        return (
          <>
            <rect x="0" y="0" width="100" height="33" fill="hsl(145, 75%, 40%)" />
            <rect x="0" y="33" width="100" height="34" fill="#ffffff" />
            <rect x="0" y="67" width="100" height="33" fill="hsl(355, 85%, 45%)" />
            <circle cx="50" cy="50" r="5" fill="hsl(355, 85%, 45%)" />
          </>
        );
      case 'GHA': // Ghana: Rojo, Amarillo, Verde (estrella negra)
        return (
          <>
            <rect x="0" y="0" width="100" height="33" fill="hsl(355, 85%, 45%)" />
            <rect x="0" y="33" width="100" height="34" fill="hsl(45, 90%, 50%)" />
            <rect x="0" y="67" width="100" height="33" fill="hsl(140, 80%, 40%)" />
            <polygon points="50,42 52,49 59,49 54,53 56,60 50,56 44,60 46,53 41,49 48,49" fill="#111111" />
          </>
        );
      case 'IRQ': // Irak: Rojo, Blanco (letras), Negro
        return (
          <>
            <rect x="0" y="0" width="100" height="33" fill="hsl(355, 85%, 45%)" />
            <rect x="0" y="33" width="100" height="34" fill="#ffffff" />
            <rect x="0" y="67" width="100" height="33" fill="#111111" />
            <text x="50" y="55" fill="hsl(145, 70%, 30%)" fontSize="9" fontWeight="bold" textAnchor="middle">الله أكبر</text>
          </>
        );
      case 'EGY': // Egipto: Rojo, Blanco, Negro (emblema dorado)
        return (
          <>
            <rect x="0" y="0" width="100" height="33" fill="hsl(355, 80%, 40%)" />
            <rect x="0" y="33" width="100" height="34" fill="#ffffff" />
            <rect x="0" y="67" width="100" height="33" fill="#111111" />
            <circle cx="50" cy="50" r="5" fill="hsl(45, 90%, 45%)" />
          </>
        );
      case 'UKR': // Ucrania: Azul, Amarillo
        return (
          <>
            <rect x="0" y="0" width="100" height="50" fill="hsl(210, 90%, 45%)" />
            <rect x="0" y="50" width="100" height="50" fill="hsl(48, 95%, 55%)" />
          </>
        );
      case 'AUT': // Austria: Rojo, Blanco, Rojo
        return (
          <>
            <rect x="0" y="0" width="100" height="33" fill="hsl(355, 80%, 50%)" />
            <rect x="0" y="33" width="100" height="34" fill="#ffffff" />
            <rect x="0" y="67" width="100" height="33" fill="hsl(355, 80%, 50%)" />
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
      case 'KSA': // Arabia Saudita: Verde con espada blanca
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="hsl(145, 90%, 25%)" />
            <rect x="25" y="55" width="50" height="4" fill="#ffffff" />
            <polygon points="35,50 35,64 25,57" fill="#ffffff" />
          </>
        );
      case 'KOR': // Corea del Sur: Blanco con Taegeuk y trigramas
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
            <path d="M50,28 A22,22 0 0,1 50,72 A11,11 0 0,1 50,50 A11,11 0 0,0 50,28" fill="hsl(355, 85%, 45%)" />
            <path d="M50,72 A22,22 0 0,1 50,28 A11,11 0 0,1 50,50 A11,11 0 0,0 50,72" fill="hsl(215, 85%, 40%)" />
            <rect x="20" y="20" width="10" height="4" fill="#111111" transform="rotate(45 25 22)" />
            <rect x="70" y="20" width="10" height="4" fill="#111111" transform="rotate(-45 75 22)" />
            <rect x="20" y="70" width="10" height="4" fill="#111111" transform="rotate(-45 25 72)" />
            <rect x="70" y="70" width="10" height="4" fill="#111111" transform="rotate(45 75 72)" />
          </>
        );
      case 'SWE': // Suecia: Azul con cruz nórdica amarilla
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="hsl(210, 80%, 40%)" />
            <rect x="32" y="0" width="16" height="100" fill="hsl(48, 95%, 50%)" />
            <rect x="0" y="42" width="100" height="16" fill="hsl(48, 95%, 50%)" />
          </>
        );
      case 'MAR': // Marruecos: Rojo con estrella verde
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="hsl(348, 85%, 40%)" />
            <polygon points="50,32 54,45 66,45 57,52 60,65 50,57 40,65 43,52 34,45 46,45" fill="none" stroke="hsl(145, 80%, 25%)" strokeWidth="2.5" />
          </>
        );
      case 'DEN': // Dinamarca: Rojo con cruz nórdica blanca
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="hsl(355, 85%, 45%)" />
            <rect x="30" y="0" width="12" height="100" fill="#ffffff" />
            <rect x="0" y="44" width="100" height="12" fill="#ffffff" />
          </>
        );
      case 'AUS': // Australia: Azul con Union Jack y estrellas
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="hsl(215, 90%, 30%)" />
            <rect x="0" y="0" width="50" height="50" fill="hsl(215, 90%, 25%)" />
            <rect x="22" y="0" width="6" height="50" fill="#ffffff" />
            <rect x="0" y="22" width="50" height="6" fill="#ffffff" />
            <line x1="0" y1="0" x2="50" y2="50" stroke="#ffffff" strokeWidth="3" />
            <line x1="50" y1="0" x2="0" y2="50" stroke="#ffffff" strokeWidth="3" />
            <polygon points="25,65 28,71 34,71 30,75 32,81 25,77 18,81 20,75 16,71 22,71" fill="#ffffff" />
          </>
        );
      case 'TUN': // Túnez: Rojo con círculo, luna y estrella
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="hsl(355, 85%, 45%)" />
            <circle cx="50" cy="50" r="20" fill="#ffffff" />
            <circle cx="53" cy="50" r="12" fill="hsl(355, 85%, 45%)" />
            <circle cx="56" cy="50" r="9" fill="#ffffff" />
            <polygon points="54,46 56,51 61,51 57,54 59,59 54,56 49,59 51,54 47,51 52,51" fill="hsl(355, 85%, 45%)" />
          </>
        );
      case 'NZL': // Nueva Zelanda: Azul con Union Jack y estrellas rojas
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="hsl(215, 90%, 30%)" />
            <rect x="0" y="0" width="50" height="50" fill="hsl(215, 90%, 25%)" />
            <rect x="22" y="0" width="6" height="50" fill="#ffffff" />
            <rect x="0" y="22" width="50" height="6" fill="#ffffff" />
            <line x1="0" y1="0" x2="50" y2="50" stroke="#ffffff" strokeWidth="3" />
            <circle cx="75" cy="30" r="3" fill="hsl(355, 85%, 45%)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="85" cy="50" r="3" fill="hsl(355, 85%, 45%)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="75" cy="70" r="3" fill="hsl(355, 85%, 45%)" stroke="#ffffff" strokeWidth="1" />
          </>
        );
      case 'ALG': // Argelia: Verde, Blanco, Luna y Estrella rojas
        return (
          <>
            <rect x="0" y="0" width="50" height="100" fill="hsl(145, 75%, 35%)" />
            <rect x="50" y="0" width="50" height="100" fill="#ffffff" />
            <circle cx="50" cy="50" r="16" fill="hsl(355, 85%, 45%)" />
            <circle cx="54" cy="50" r="14" fill="#ffffff" />
            <polygon points="56,46 58,51 63,51 59,54 61,59 56,56 51,59 53,54 49,51 54,51" fill="hsl(355, 85%, 45%)" />
          </>
        );
      case 'CHI': // Chile: Azul (con estrella), Blanco, Rojo
        return (
          <>
            <rect x="0" y="0" width="100" height="50" fill="#ffffff" />
            <rect x="0" y="50" width="100" height="50" fill="hsl(355, 85%, 45%)" />
            <rect x="0" y="0" width="40" height="50" fill="hsl(215, 90%, 35%)" />
            <polygon points="20,12 23,21 31,21 25,25 27,33 20,29 13,33 15,25 9,21 17,21" fill="#ffffff" />
          </>
        );
      case 'POR': // Portugal: Verde, Rojo con escudo simplificado
        return (
          <>
            <rect x="0" y="0" width="40" height="100" fill="hsl(145, 85%, 30%)" />
            <rect x="40" y="0" width="60" height="100" fill="hsl(355, 80%, 35%)" />
            <circle cx="40" cy="50" r="10" fill="hsl(45, 95%, 50%)" />
            <rect x="37" y="47" width="6" height="6" fill="hsl(355, 85%, 45%)" />
          </>
        );
      case 'CRC': // Costa Rica: Azul, Blanco, Rojo (doble), Blanco, Azul
        return (
          <>
            <rect x="0" y="0" width="100" height="17" fill="hsl(215, 80%, 40%)" />
            <rect x="0" y="17" width="100" height="16" fill="#ffffff" />
            <rect x="0" y="33" width="100" height="34" fill="hsl(355, 80%, 45%)" />
            <rect x="0" y="67" width="100" height="16" fill="#ffffff" />
            <rect x="0" y="83" width="100" height="17" fill="hsl(215, 80%, 40%)" />
          </>
        );
      case 'QAT': // Catar: Blanco con picos serrados, Burdeos
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="hsl(340, 85%, 35%)" />
            <polygon points="0,0 28,0 35,11 28,22 35,33 28,44 35,55 28,66 35,77 28,88 35,100 0,100" fill="#ffffff" />
          </>
        );
      case 'PAN': // Panamá: Cuarteles con estrellas azul y roja
        return (
          <>
            <rect x="0" y="0" width="50" height="50" fill="#ffffff" />
            <rect x="50" y="0" width="50" height="50" fill="hsl(355, 85%, 45%)" />
            <rect x="0" y="50" width="50" height="50" fill="hsl(215, 85%, 45%)" />
            <rect x="50" y="50" width="50" height="50" fill="#ffffff" />
            <polygon points="25,12 27,18 33,18 29,22 30,28 25,24 20,28 21,22 17,18 23,18" fill="hsl(215, 85%, 45%)" />
            <polygon points="75,62 77,68 83,68 79,72 80,78 75,74 70,78 71,72 67,68 73,68" fill="hsl(355, 85%, 45%)" />
          </>
        );
      case 'RSA': // Sudáfrica: Y verde con bordes, rojo, azul, triángulo negro
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="hsl(145, 80%, 35%)" />
            <polygon points="40,40 100,40 100,0 0,0 20,40" fill="hsl(355, 80%, 45%)" />
            <polygon points="40,60 100,60 100,100 0,100 20,60" fill="hsl(215, 85%, 40%)" />
            <polygon points="0,15 35,50 0,85" fill="#111111" />
            <polygon points="0,15 35,50 0,85" fill="none" stroke="hsl(48, 95%, 50%)" strokeWidth="2.5" />
          </>
        );
      case 'TUR': // Turquía: Rojo con luna y estrella blancas
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="hsl(355, 85%, 45%)" />
            <circle cx="45" cy="50" r="18" fill="#ffffff" />
            <circle cx="50" cy="50" r="14" fill="hsl(355, 85%, 45%)" />
            <polygon points="59,44 61,49 66,49 62,52 64,57 59,54 54,57 56,52 52,49 57,49" fill="#ffffff" />
          </>
        );
      case 'JAM': // Jamaica: Cruz dorada en aspa, verde y negro
        return (
          <>
            <rect x="0" y="0" width="100" height="100" fill="hsl(135, 80%, 35%)" />
            <polygon points="0,0 50,50 0,100" fill="#111111" />
            <polygon points="100,0 50,50 100,100" fill="#111111" />
            <line x1="0" y1="0" x2="100" y2="100" stroke="hsl(48, 95%, 50%)" strokeWidth="8" />
            <line x1="100" y1="0" x2="0" y2="100" stroke="hsl(48, 95%, 50%)" strokeWidth="8" />
          </>
        );
      case 'WAL': // Gales: Blanco, Verde con silueta roja simplificada
        return (
          <>
            <rect x="0" y="0" width="100" height="50" fill="#ffffff" />
            <rect x="0" y="50" width="100" height="50" fill="hsl(135, 75%, 35%)" />
            <polygon points="50,35 62,45 62,55 45,50 38,60 50,45" fill="hsl(355, 80%, 45%)" />
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
