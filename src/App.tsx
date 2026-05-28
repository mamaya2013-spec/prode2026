import React, { useState, useEffect } from 'react';
import { ProdeProvider, useProde } from './context/ProdeContext';
import SoccerActionVisual from './components/SoccerActionVisual';
import MatchCard from './components/MatchCard';
import GroupLeaderboard from './components/GroupLeaderboard';
import Achievements from './components/Achievements';
import AdminDashboard from './components/AdminDashboard';
import PwaInstallBanner from './components/PwaInstallBanner';
import GroupChat from './components/GroupChat';
import UserPerformance from './components/UserPerformance';
import TournamentBracket from './components/TournamentBracket';
import bicycleKickImg from './assets/soccer_bicycle_kick.png';
import penaltyKickImg from './assets/soccer_penalty_kick.png';
import overheadKickImg from './assets/soccer_overhead_kick.png';
import skillMoveImg from './assets/soccer_skill_move.png';
import freekickImg from './assets/soccer_freekick.png';
import goalkeeperSaveImg from './assets/soccer_goalkeeper_save.png';
import celebrationImg from './assets/soccer_celebration.png';
import luxuryDribbleImg from './assets/soccer_luxury_dribble.png';

const BG_ACTION_IMAGES = [
  bicycleKickImg, penaltyKickImg, overheadKickImg, skillMoveImg,
  freekickImg, goalkeeperSaveImg, celebrationImg, luxuryDribbleImg,
];

// Sub-Componente de Visualización Principal para coordinar la lógica
const AppContent: React.FC = () => {
  const { 
    currentUser, 
    currentGroup, 
    groups, 
    matches,
    login, 
    logout, 
    registerWithInvite,
    recentAchievementUnlocked,
    clearRecentAchievement,
    systemState,
    toggleAdminMode,
    generateInviteLink
  } = useProde();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'standings' | 'matches' | 'medals' | 'group' | 'admin' | 'chat'>('dashboard');
  
  // Parámetros de URL
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  // Estados de Formularios
  const [loginUser, setLoginUser] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regPin, setRegPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Estados para vistas de partidos
  const [filterPhase, setFilterPhase] = useState<string>('Todos');
  const [fixtureViewMode, setFixtureViewMode] = useState<'list' | 'bracket'>('list');

  // Fondo dinámico: rotación de imágenes de acción
  const [bgLeftIdx, setBgLeftIdx] = useState(0);
  const [bgRightIdx, setBgRightIdx] = useState(3);
  const [bgCenterIdx, setBgCenterIdx] = useState(5);

  // Estados interactivos para pantalla de login premium
  const [focusedInput, setFocusedInput] = useState<'username' | 'pin' | null>(null);
  const [loginTilt, setLoginTilt] = useState({ x: 0, y: 0 });
  const [regTilt, setRegTilt] = useState({ x: 0, y: 0 });

  const handleLoginMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateY = ((x - xc) / xc) * 12;
    const rotateX = ((yc - y) / yc) * 12;
    setLoginTilt({ x: rotateX, y: rotateY });
  };

  const handleLoginMouseLeave = () => {
    setLoginTilt({ x: 0, y: 0 });
  };

  const handleRegMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateY = ((x - xc) / xc) * 12;
    const rotateX = ((yc - y) / yc) * 12;
    setRegTilt({ x: rotateX, y: rotateY });
  };

  const handleRegMouseLeave = () => {
    setRegTilt({ x: 0, y: 0 });
  };

  const renderFloatingParticles = () => (
    <div className="floating-particles-container">
      {Array.from({ length: 8 }).map((_, i) => {
        const left = `${10 + i * 11}%`;
        const size = `${20 + (i % 3) * 12}px`;
        const delay = `${i * 1.8}s`;
        const duration = `${12 + (i % 2) * 5}s`;
        return (
          <div 
            key={i} 
            className="floating-particle" 
            style={{ 
              left, 
              width: size, 
              height: size, 
              animationDelay: delay, 
              animationDuration: duration 
            }}
          >
            <svg viewBox="0 0 100 100" className="floating-particle-ball">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
              <path d="M50,4 L50,96 M4,50 L96,50 M18,18 L82,82 M18,82 L82,18" stroke="currentColor" strokeWidth="4" opacity="0.3" />
              <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="6" />
            </svg>
          </div>
        );
      })}
    </div>
  );

  useEffect(() => {
    // Rotar fondos con imágenes de acción de fútbol
    const interval = setInterval(() => {
      setBgLeftIdx(prev => (prev + 1) % BG_ACTION_IMAGES.length);
      setBgRightIdx(prev => (prev + 1) % BG_ACTION_IMAGES.length);
      setBgCenterIdx(prev => (prev + 1) % BG_ACTION_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Detectar si ingresa mediante link de invitación (?invite=token)
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) {
      setInviteToken(invite);
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginUser || !loginPin) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }
    const success = login(loginUser, loginPin);
    if (!success) {
      setErrorMsg('Usuario o PIN incorrecto. Si eres nuevo, pídele un link de invitación al administrador.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!inviteToken) return;
    if (!regUser || regPin.length < 4) {
      setErrorMsg('Completa tu nombre y un PIN de seguridad de al menos 4 dígitos.');
      return;
    }
    const success = registerWithInvite(regUser, regPin, inviteToken);
    if (success) {
      setInviteToken(null);
      window.history.replaceState({}, document.title, window.location.pathname);
      setActiveTab('dashboard');
    } else {
      setErrorMsg('Ese nombre ya está registrado en este grupo.');
    }
  };

  const phases = ['Todos', 'Fase de Grupos', 'Dieciseisavos', 'Octavos', 'Cuartos', 'Semifinal', 'Tercer Puesto', 'Final'];

  const filteredMatches = matches.filter(m => {
    if (filterPhase === 'Todos') return true;
    if (filterPhase === 'Fase de Grupos') return m.phase.startsWith('Grupo');
    return m.phase === filterPhase;
  });

  // Próximos partidos para mostrar en el Dashboard
  const upcomingMatches = matches
    .filter(m => m.status !== 'finished')
    .slice(0, 3);

  // Funciones auxiliares para determinar la animación de fútbol en base al foco de los inputs
  const getOnboardingAvatarAction = () => {
    if (focusedInput === 'username') return 'dribble';
    if (focusedInput === 'pin') return 'penalty';
    return 'cycle';
  };

  const getLoginAvatarAction = () => {
    if (focusedInput === 'username') return 'skill';
    if (focusedInput === 'pin') return 'save';
    return 'cycle';
  };

  // Renderiza un balón de fútbol 3D detallado con degradado radial dinámico para el slot lleno
  const renderSoccerBallSVG = (color1 = 'var(--color-secondary)', color2 = 'var(--color-primary)', uniqueId = 'ball-grad') => (
    <svg viewBox="0 0 100 100" className="pin-slot-ball">
      <defs>
        <radialGradient id={uniqueId} cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${uniqueId})`} stroke="hsla(240, 50%, 4%, 0.8)" strokeWidth="3" />
      <polygon points="50,34 62,43 57,56 43,56 38,43" fill="hsla(240, 50%, 6%, 0.85)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
      <line x1="50" y1="34" x2="50" y2="16" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
      <line x1="62" y1="43" x2="78" y2="38" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
      <line x1="57" y1="56" x2="68" y2="72" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
      <line x1="43" y1="56" x2="32" y2="72" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
      <line x1="38" y1="43" x2="22" y2="38" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
      <polygon points="50,16 58,10 42,10" fill="hsla(240, 50%, 6%, 0.85)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
      <polygon points="78,38 86,30 84,46" fill="hsla(240, 50%, 6%, 0.85)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
      <polygon points="68,72 74,84 58,84" fill="hsla(240, 50%, 6%, 0.85)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
      <polygon points="32,72 42,84 26,84" fill="hsla(240, 50%, 6%, 0.85)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
      <polygon points="22,38 14,46 16,30" fill="hsla(240, 50%, 6%, 0.85)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
    </svg>
  );

  // Renderiza una silueta dashed del balón para el slot vacío
  const renderPlaceholderBallSVG = () => (
    <svg viewBox="0 0 100 100" className="pin-slot-placeholder-ball">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3.5" strokeDasharray="6 6" />
      <polygon points="50,34 62,43 57,56 43,56 38,43" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <line x1="50" y1="34" x2="50" y2="16" stroke="currentColor" strokeWidth="2.5" />
      <line x1="62" y1="43" x2="78" y2="38" stroke="currentColor" strokeWidth="2.5" />
      <line x1="57" y1="56" x2="68" y2="72" stroke="currentColor" strokeWidth="2.5" />
      <line x1="43" y1="56" x2="32" y2="72" stroke="currentColor" strokeWidth="2.5" />
      <line x1="38" y1="43" x2="22" y2="38" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );

  // 1. Pantalla de Onboarding (Registro por Enlace de Invitación)
  if (inviteToken) {
    const group = groups.find(g => g.inviteToken === inviteToken);
    return (
      <div className="stadium-container">
        {renderFloatingParticles()}
        <div className="searchlights-overlay">
          <div className="searchlight searchlight-1" />
          <div className="searchlight searchlight-2" />
        </div>
        <div className="bg-soccer-action bg-action-left" style={{ backgroundImage: `url(${BG_ACTION_IMAGES[bgLeftIdx]})`, transition: 'background-image 1.5s ease-in-out' }} />
        <div className="bg-soccer-action bg-action-right" style={{ backgroundImage: `url(${BG_ACTION_IMAGES[bgRightIdx]})`, transition: 'background-image 1.5s ease-in-out' }} />
        <div className="bg-soccer-action bg-action-center" style={{ backgroundImage: `url(${BG_ACTION_IMAGES[bgCenterIdx]})`, transition: 'background-image 1.5s ease-in-out' }} />
        <div className="app-wrapper flex-center" style={{ minHeight: '100vh' }}>
          <div 
            className="glass-panel login-screen page-swipe" 
            style={{ 
              width: '90%',
              transform: `perspective(1000px) rotateX(${regTilt.x}deg) rotateY(${regTilt.y}deg)`,
              transition: focusedInput ? 'transform 0.1s ease' : 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)'
            }}
            onMouseMove={handleRegMouseMove}
            onMouseLeave={handleRegMouseLeave}
          >
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <SoccerActionVisual size={85} action={getOnboardingAvatarAction()} />
              <h2 className="app-title" style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>Únete al Prode</h2>
              {group ? (
                <div className="group-badge" style={{ fontSize: '0.85rem' }}>
                  Invitación para: <strong>{group.name}</strong>
                </div>
              ) : (
                <div className="text-neon-red" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  ⚠️ Enlace de invitación inválido o vencido.
                </div>
              )}
            </div>

            {group && (
              <form onSubmit={handleRegisterSubmit} className="onboarding-form">
                <div className="input-group">
                  <label className="input-label">Escribe tu Nombre</label>
                  <div className="premium-input-container">
                    <svg className="premium-input-icon" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <input 
                      className="input-field"
                      type="text"
                      maxLength={15}
                      placeholder="Ej. Lionel Perez"
                      value={regUser}
                      onChange={e => setRegUser(e.target.value)}
                      onFocus={() => setFocusedInput('username')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Crea tu PIN de Acceso Personal</label>
                  <div className="pin-slots-container">
                    {[0, 1, 2, 3].map(index => {
                      const isFilled = regPin.length > index;
                      const isActive = regPin.length === index && focusedInput === 'pin';
                      return (
                        <div 
                          key={index} 
                          className={`pin-slot ${isFilled ? 'pin-slot-filled' : ''} ${isActive ? 'pin-slot-active' : ''}`}
                        >
                          {isFilled ? renderSoccerBallSVG('var(--color-secondary)', 'var(--color-primary)', `reg-ball-${index}`) : renderPlaceholderBallSVG()}
                        </div>
                      );
                    })}
                    <input 
                      className="hidden-pin-input"
                      type="tel"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={4}
                      value={regPin}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setRegPin(val);
                      }}
                      onFocus={() => setFocusedInput('pin')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.25rem' }}>
                    Crea un PIN de 4 dígitos para volver a ingresar.
                  </span>
                </div>

                {errorMsg && (
                  <span className="text-neon-red" style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                    {errorMsg}
                  </span>
                )}

                <button className="btn-premium" type="submit">
                  Crear Cuenta e Ingresar
                </button>
              </form>
            )}

            <button 
              className="btn-premium btn-secondary btn-premium-centered" 
              style={{ marginTop: '1rem' }}
              onClick={() => {
                setInviteToken(null);
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
            >
              Tengo Cuenta / Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Pantalla de Acceso Normal (Login)
  if (!currentUser) {
    return (
      <div className="stadium-container">
        {renderFloatingParticles()}
        <div className="searchlights-overlay">
          <div className="searchlight searchlight-1" />
          <div className="searchlight searchlight-2" />
        </div>
        <div className="bg-soccer-action bg-action-left" style={{ backgroundImage: `url(${BG_ACTION_IMAGES[bgLeftIdx]})`, transition: 'background-image 1.5s ease-in-out' }} />
        <div className="bg-soccer-action bg-action-right" style={{ backgroundImage: `url(${BG_ACTION_IMAGES[bgRightIdx]})`, transition: 'background-image 1.5s ease-in-out' }} />
        <div className="bg-soccer-action bg-action-center" style={{ backgroundImage: `url(${BG_ACTION_IMAGES[bgCenterIdx]})`, transition: 'background-image 1.5s ease-in-out' }} />
        <div className="app-wrapper flex-center" style={{ minHeight: '100vh' }}>
          <div 
            className="glass-panel login-screen page-swipe" 
            style={{ 
              width: '90%',
              transform: `perspective(1000px) rotateX(${loginTilt.x}deg) rotateY(${loginTilt.y}deg)`,
              transition: focusedInput ? 'transform 0.1s ease' : 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)'
            }}
            onMouseMove={handleLoginMouseMove}
            onMouseLeave={handleLoginMouseLeave}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <SoccerActionVisual size={90} action={getLoginAvatarAction()} />
              <h1 className="app-title" style={{ fontSize: '1.9rem', marginTop: '0.5rem' }}>Mundial 2026</h1>
              <span className="sport-font" style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Prode Interactivo Premium
              </span>
            </div>

            <form onSubmit={handleLoginSubmit} className="onboarding-form">
              <div className="input-group">
                <label className="input-label">Nombre de Usuario</label>
                <div className="premium-input-container">
                  <svg className="premium-input-icon" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <input 
                    className="input-field"
                    type="text"
                    placeholder="Ej. Lionel"
                    value={loginUser}
                    onChange={e => setLoginUser(e.target.value)}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Ingresa tu PIN Personal</label>
                <div className="pin-slots-container">
                  {[0, 1, 2, 3].map(index => {
                    const isFilled = loginPin.length > index;
                    const isActive = loginPin.length === index && focusedInput === 'pin';
                    return (
                      <div 
                        key={index} 
                        className={`pin-slot ${isFilled ? 'pin-slot-filled' : ''} ${isActive ? 'pin-slot-active' : ''}`}
                      >
                        {isFilled ? renderSoccerBallSVG('var(--color-secondary)', 'var(--color-primary)', `login-ball-${index}`) : renderPlaceholderBallSVG()}
                      </div>
                    );
                  })}
                  <input 
                    className="hidden-pin-input"
                    type="tel"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={4}
                    value={loginPin}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setLoginPin(val);
                    }}
                    onFocus={() => setFocusedInput('pin')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.25rem' }}>
                  Ingresa tu PIN de 4 dígitos para acceder.
                </span>
              </div>

              {errorMsg && (
                <span className="text-neon-red" style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                  {errorMsg}
                </span>
              )}

              <button className="btn-premium" type="submit">
                Entrar a la Cancha ⚽
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              ¿No tienes cuenta? Solicita el **Link de Invitación** de tu grupo al administrador para registrarte en segundos.
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button 
                onClick={() => {
                  login('Lionel', '1010');
                  toggleAdminMode();
                }}
                className="btn-premium btn-secondary"
                style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem' }}
              >
                Ingreso Admin Rápido (Demo)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Tablero Principal de la Aplicación (Logueado - Híbrido Responsivo)
  return (
    <div className="stadium-container logged-in-grid">
      
      {/* ────────────────── COLUMNA 1: SIDEBAR IZQUIERDA (DESKTOP) ────────────────── */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo-box">
          <SoccerActionVisual size={55} action="bicycle" />
          <h2 className="app-title" style={{ fontSize: '1.25rem' }}>Mundial 2026</h2>
          <span className="group-badge" style={{ marginTop: '0.2rem' }}>
            {currentGroup?.name}
          </span>
        </div>

        <nav className="sidebar-menu">
          <button 
            className={`sidebar-btn ${activeTab === 'dashboard' ? 'sidebar-btn-active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          
          <button 
            className={`sidebar-btn ${activeTab === 'standings' ? 'sidebar-btn-active' : ''}`}
            onClick={() => setActiveTab('standings')}
          >
            🏆 Posiciones
          </button>

          <button 
            className={`sidebar-btn ${activeTab === 'matches' ? 'sidebar-btn-active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            ⚽ Fixture 104
          </button>

          <button 
            className={`sidebar-btn ${activeTab === 'medals' ? 'sidebar-btn-active' : ''}`}
            onClick={() => setActiveTab('medals')}
          >
            🏅 Logros
          </button>

          <button 
            className={`sidebar-btn ${activeTab === 'group' ? 'sidebar-btn-active' : ''}`}
            onClick={() => setActiveTab('group')}
          >
            👥 Perfil / Grupo
          </button>

          {systemState.isAdmin && (
            <button 
              className={`sidebar-btn ${activeTab === 'admin' ? 'sidebar-btn-active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              ⚙️ Panel Super Admin
            </button>
          )}
        </nav>

        {/* Resumen rápido de perfil en Sidebar */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid hsla(0,0%,100%,0.08)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Usuario Logueado:</div>
          <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-primary)' }}>{currentUser.name}</div>
          <button 
            onClick={logout}
            className="btn-premium btn-secondary" 
            style={{ fontSize: '0.75rem', padding: '0.35rem 0', width: '100%', marginTop: '0.5rem' }}
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ────────────────── COLUMNA 2: APP WRAPPER (MÓVIL / CENTRAL) ────────────────── */}
      <div className="app-wrapper">
        <div className="bg-soccer-action bg-action-left" style={{ backgroundImage: `url(${BG_ACTION_IMAGES[bgLeftIdx]})`, left: '5%', bottom: '15%', width: '280px', height: '280px', opacity: 0.07, transition: 'background-image 1.5s ease-in-out' }} />
        <div className="bg-soccer-action bg-action-right" style={{ backgroundImage: `url(${BG_ACTION_IMAGES[bgRightIdx]})`, right: '5%', top: '25%', width: '280px', height: '280px', opacity: 0.07, transition: 'background-image 1.5s ease-in-out' }} />
        <div className="bg-soccer-action bg-action-center" style={{ backgroundImage: `url(${BG_ACTION_IMAGES[bgCenterIdx]})`, left: '40%', top: '60%', width: '240px', height: '240px', opacity: 0.04, transition: 'background-image 1.5s ease-in-out' }} />
        
        {/* Cabecera Principal (Mobile Header) */}
        <header className="app-header">
          <SoccerActionVisual size={42} action="dribble" />
          <h1 className="app-title" style={{ fontSize: '1.4rem' }}>Mundial 2026</h1>
          <span className="group-badge">
            🏆 {currentGroup?.name || 'Grupo Sin Asignar'}
          </span>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
            <div style={{ background: 'hsla(0,0%,100%,0.03)', border: '1px solid hsla(0,0%,100%,0.05)', borderRadius: '8px', padding: '0.3rem 0.6rem', textAlign: 'center', flex: 1 }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Puntos</span>
              <div className="text-neon-yellow" style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-sporty)' }}>{currentUser.points}</div>
            </div>
            <div style={{ background: 'hsla(0,0%,100%,0.03)', border: '1px solid hsla(0,0%,100%,0.05)', borderRadius: '8px', padding: '0.3rem 0.6rem', textAlign: 'center', flex: 1 }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Racha</span>
              <div className="text-neon-green" style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-sporty)' }}>
                {currentUser.streak >= 3 ? `🔥 ${currentUser.streak}` : `${currentUser.streak} ⚽`}
              </div>
            </div>
          </div>
        </header>

        {/* Panel de visualización central */}
        <main style={{ flex: 1, paddingBottom: '70px', overflowY: 'auto', overflowX: 'hidden' }}>
          
          {/* VISTA 1: DASHBOARD DE ESTADÍSTICAS */}
          {activeTab === 'dashboard' && (
            <div className="page-swipe" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Widget de Rendimiento */}
              <UserPerformance onNavigate={setActiveTab} />

              {/* Próximos Partidos destacados */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.50rem' }}>
                <h4 className="sport-font" style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', textTransform: 'uppercase', borderBottom: '1px solid hsla(0,0%,100%,0.08)', paddingBottom: '0.35rem' }}>
                  Próximos Partidos
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {upcomingMatches.length > 0 ? (
                    upcomingMatches.map(match => (
                      <MatchCard key={match.id} match={match} />
                    ))
                  ) : (
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>No hay partidos pendientes.</p>
                  )}
                </div>
              </div>

              {/* Botón rápido para ir a Fixture completo */}
              <button 
                className="btn-premium" 
                onClick={() => setActiveTab('matches')}
                style={{ width: '100%' }}
              >
                Ver Fixture Completo (104 Partidos) ⚽
              </button>
            </div>
          )}

          {activeTab === 'standings' && (
            <GroupLeaderboard />
          )}

          {activeTab === 'matches' && (
            <div className="page-swipe" style={{ overflow: 'hidden', maxWidth: '100%' }}>
              {/* Selector de Modo de Visualización del Fixture */}
              <div 
                style={{ 
                  display: 'flex', 
                  margin: '1rem 1rem 0.5rem 1rem', 
                  background: 'hsla(240, 35%, 8%, 0.6)', 
                  borderRadius: '8px', 
                  padding: '0.25rem',
                  border: '1px solid hsla(0,0%,100%,0.04)'
                }}
              >
                <button
                  onClick={() => setFixtureViewMode('list')}
                  className="sport-font"
                  style={{
                    flex: 1,
                    background: fixtureViewMode === 'list' ? 'var(--gradient-neon)' : 'none',
                    color: fixtureViewMode === 'list' ? 'var(--color-text-dark)' : 'var(--color-text-muted)',
                    border: 'none',
                    padding: '0.5rem 0',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease'
                  }}
                >
                  📋 Lista de Partidos
                </button>
                <button
                  onClick={() => setFixtureViewMode('bracket')}
                  className="sport-font"
                  style={{
                    flex: 1,
                    background: fixtureViewMode === 'bracket' ? 'var(--gradient-neon)' : 'none',
                    color: fixtureViewMode === 'bracket' ? 'var(--color-text-dark)' : 'var(--color-text-muted)',
                    border: 'none',
                    padding: '0.5rem 0',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🌳 Cuadro Eliminatorio
                </button>
              </div>

              {fixtureViewMode === 'bracket' ? (
                <TournamentBracket />
              ) : (
                <>
                  <div style={{ overflowX: 'auto', display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem 0 1rem', whiteSpace: 'nowrap' }}>
                    {phases.map(phase => (
                      <button
                        key={phase}
                        onClick={() => setFilterPhase(phase)}
                        className={`btn-premium ${filterPhase === phase ? '' : 'btn-secondary'}`}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', textTransform: 'none' }}
                      >
                        {phase}
                      </button>
                    ))}
                  </div>

                  <div className="matches-list">
                    {filteredMatches.length > 0 ? (
                      filteredMatches.map(match => (
                        <MatchCard key={match.id} match={match} />
                      ))
                    ) : (
                      <div className="glass-panel text-center" style={{ padding: '2rem' }}>
                        <p style={{ color: 'var(--color-text-muted)' }}>No hay partidos para esta fase.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'medals' && (
            <Achievements />
          )}

          {activeTab === 'chat' && (
            <div className="page-swipe" style={{ padding: '1rem', height: '100%' }}>
              <GroupChat />
            </div>
          )}

          {activeTab === 'group' && (
            <div className="page-swipe" style={{ padding: '1rem' }}>
              <div className="glass-panel text-center" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <SoccerActionVisual size={65} action="cycle" />
                <h3 className="sport-font" style={{ textTransform: 'uppercase', color: 'var(--color-secondary)' }}>
                  {currentGroup?.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Invita a nuevos competidores a este grupo pasándoles este enlace secreto de registro.
                </p>
                <div className="invite-link-row" style={{ width: '100%' }}>
                  <div className="invite-link-display">
                    {currentGroup ? generateInviteLink(currentGroup.id) : ''}
                  </div>
                </div>
                <button 
                  className="btn-premium"
                  onClick={() => {
                    if (currentGroup) {
                      navigator.clipboard.writeText(generateInviteLink(currentGroup.id));
                      alert('¡Enlace copiado al portapapeles!');
                    }
                  }}
                  style={{ width: '100%' }}
                >
                  Copiar Enlace de Invitación
                </button>

                <div style={{ borderTop: '1px solid hsla(0,0%,100%,0.08)', width: '100%', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <button 
                    className="btn-premium btn-secondary" 
                    onClick={logout}
                    style={{ width: '100%' }}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>

              {/* Toggle Admin */}
              <div className="glass-panel" style={{ marginTop: '1rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                  Modo Desarrollador
                </span>
                <button 
                  className={`btn-premium ${systemState.isAdmin ? '' : 'btn-secondary'}`}
                  onClick={toggleAdminMode}
                  style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem 0' }}
                >
                  {systemState.isAdmin ? 'Desactivar Panel Admin' : 'Activar Panel Admin'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'admin' && systemState.isAdmin && (
            <AdminDashboard />
          )}
        </main>

        {/* Banner PWA */}
        <PwaInstallBanner />

        {/* Barra de Navegación Inferior (Móvil) */}
        <nav className="app-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'nav-item-active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg className="nav-icon-svg" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="nav-text">Inicio</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'standings' ? 'nav-item-active' : ''}`}
            onClick={() => setActiveTab('standings')}
          >
            <svg className="nav-icon-svg" viewBox="0 0 24 24">
              <path d="M16 11h5v10h-5zm-6-5h5v15h-5zm-6 9h5v6H4z"/>
            </svg>
            <span className="nav-text">Posiciones</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'matches' ? 'nav-item-active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            <svg className="nav-icon-svg" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
            </svg>
            <span className="nav-text">Fixture</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'chat' ? 'nav-item-active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <svg className="nav-icon-svg" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
            </svg>
            <span className="nav-text">Chat</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'group' ? 'nav-item-active' : ''}`}
            onClick={() => setActiveTab('group')}
          >
            <svg className="nav-icon-svg" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span className="nav-text">Perfil</span>
          </button>
        </nav>
      </div>

      {/* ────────────────── COLUMNA 3: PANEL DERECHO DE CHAT PERMANENTE (DESKTOP) ────────────────── */}
      <aside className="desktop-chat-container">
        <GroupChat />
      </aside>

      {/* MODAL GLOBAL CELEBRACIÓN DE LOGROS */}
      {recentAchievementUnlocked && (
        <div className="celebration-modal page-swipe">
          <div className="celebration-spark" />
          <div className="glass-panel celebration-content" style={{ border: '1px solid var(--color-gold)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-secondary)', fontWeight: 'bold' }}>
              🎉 ¡Logro Desbloqueado! 🎉
            </span>
            <div 
              className="medal-shape-wrapper celebration-medal-large"
              style={{ animation: 'ballSpinBounce 1.2s infinite alternate ease-in-out' }}
            >
              {selectedBadgeIcon(recentAchievementUnlocked.icon)}
            </div>
            <h2 className="sport-font" style={{ color: 'var(--color-gold)', textTransform: 'uppercase', fontSize: '1.6rem' }}>
              {recentAchievementUnlocked.title}
            </h2>
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {recentAchievementUnlocked.desc}
            </p>
            <button 
              className="btn-premium" 
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={clearRecentAchievement}
            >
              ¡A la Cancha! ⚽
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const selectedBadgeIcon = (iconName: string) => {
  const color = 'var(--color-gold)';
  if (iconName === 'boot') {
    return (
      <svg className="medal-svg" viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: color }}>
        <path d="M15,65 C15,65 30,70 50,68 C70,66 85,55 90,45 C80,35 60,35 50,40 C45,45 35,45 25,35 L15,40 Z" />
        <rect x="25" y="65" width="6" height="8" rx="2" />
        <rect x="40" y="66" width="6" height="8" rx="2" />
        <circle cx="85" cy="25" r="8" />
      </svg>
    );
  }
  if (iconName === 'crystal') {
    return (
      <svg className="medal-svg" viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: color }}>
        <circle cx="50" cy="45" r="30" fill="none" stroke={color} strokeWidth="3" />
        <path d="M30,30 C40,40 60,40 70,30" fill="none" stroke={color} strokeWidth="2" />
        <path d="M50,15 L50,75" stroke={color} strokeWidth="2" />
        <path d="M35,80 L65,80 L60,88 L40,88 Z" />
      </svg>
    );
  }
  if (iconName === 'shield') {
    return (
      <svg className="medal-svg" viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: color }}>
        <path d="M20,15 C40,10 60,10 80,15 C80,50 70,80 50,92 C30,80 20,50 20,15 Z" fill="none" stroke={color} strokeWidth="3" />
        <path d="M42,32 C45,28 55,28 58,32 C58,32 50,38 50,45 C50,55 58,60 55,68 C45,68 42,55 42,45 Z" />
      </svg>
    );
  }
  if (iconName === 'ticket') {
    return (
      <svg className="medal-svg" viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: color }}>
        <rect x="18" y="30" width="64" height="40" rx="6" fill="none" stroke={color} strokeWidth="3" transform="rotate(-15 50 50)" />
        <text x="50" y="55" fontSize="14" fontWeight="bold" textAnchor="middle" transform="rotate(-15 50 50)">FIFA 26</text>
      </svg>
    );
  }
  return (
    <svg className="medal-svg" viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: 'var(--color-blue-neon)' }}>
      <path d="M25,40 L60,40 C70,40 78,48 78,58 C78,68 70,76 60,76 L35,76 C28,76 22,70 22,63 L22,43 C22,41 24,40 25,40 Z" fill="none" stroke="var(--color-blue-neon)" strokeWidth="3.5" />
      <rect x="68" y="44" width="16" height="8" rx="2" />
    </svg>
  );
};

// Componente Principal que envuelve el Contexto
export const App: React.FC = () => {
  return (
    <ProdeProvider>
      <AppContent />
    </ProdeProvider>
  );
};
export default App;
