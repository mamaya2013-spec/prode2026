import React, { useState } from 'react';
import { useProde } from '../context/ProdeContext';
import { dataService } from '../services/dataService';

export const AdminDashboard: React.FC = () => {
  const { 
    groups, 
    matches, 
    users,
    createGroup, 
    generateInviteLink, 
    updateMatchResult,
    updateSystemTimeOffset,
    getSystemTime,
    setLiveSimulatedScores,
    liveSimulatedScores
  } = useProde();

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupToken, setNewGroupToken] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id || '');
  const [goalsA, setGoalsA] = useState(0);
  const [goalsB, setGoalsB] = useState(0);
  const [matchStatus, setMatchStatus] = useState<'pending' | 'live' | 'finished'>('finished');
  
  // Estados para simulación
  const [timeOffsetDays, setTimeOffsetDays] = useState(0);
  const [copySuccessMsg, setCopySuccessMsg] = useState('');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;
    createGroup(newGroupName, newGroupToken);
    setNewGroupName('');
    setNewGroupToken('');
  };

  const handleCopyLink = (groupId: string) => {
    const link = generateInviteLink(groupId);
    navigator.clipboard.writeText(link);
    setCopySuccessMsg(`¡Enlace copiado para ${groupId}!`);
    setTimeout(() => setCopySuccessMsg(''), 3000);
  };

  const handleUpdateMatch = () => {
    updateMatchResult(selectedMatchId, goalsA, goalsB, matchStatus);
  };

  // Simulación de "Tiempo de Servidor"
  const handleTimeTravel = (days: number) => {
    setTimeOffsetDays(days);
    updateSystemTimeOffset(days * 24 * 60); // Convertir días a minutos
  };

  // Simulación en Vivo (Live Standings Sim)
  const handleToggleLiveSim = (checked: boolean) => {
    if (checked) {
      // Simular marcadores provisorios para los primeros 3 partidos de grupos no jugados (M3, M4, M5)
      const simulated: Record<string, { scoreA: number; scoreB: number }> = {
        'M3': { scoreA: Math.floor(Math.random() * 4), scoreB: Math.floor(Math.random() * 4) },
        'M4': { scoreA: Math.floor(Math.random() * 4), scoreB: Math.floor(Math.random() * 4) },
        'M5': { scoreA: Math.floor(Math.random() * 4), scoreB: Math.floor(Math.random() * 4) }
      };
      setLiveSimulatedScores(simulated);
    } else {
      setLiveSimulatedScores(null);
    }
  };

  const handleHardReset = () => {
    if (window.confirm('¿Estás seguro de reiniciar toda la base de datos local? Se borrarán todos los grupos, predicciones y usuarios creados.')) {
      dataService.resetAll();
      window.location.reload();
    }
  };

  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  return (
    <div className="admin-console page-swipe">
      
      {/* 1. SECCIÓN DE SIMULADOR DE TIEMPO */}
      <div className="glass-panel">
        <h4 className="admin-section-title">⏱️ Máquina del Tiempo (Simulador)</h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
          Adelanta o retrasa el tiempo del servidor para probar cómo se cierran los candados 1 hora antes de cada partido.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span>Hora del Servidor:</span>
            <span className="text-neon-yellow" style={{ fontWeight: 'bold' }}>
              {getSystemTime().toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            {[0, 2, 8, 15, 30].map(days => (
              <button
                key={`time-${days}`}
                onClick={() => handleTimeTravel(days)}
                className={`btn-premium ${timeOffsetDays === days ? '' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '0.4rem 0', fontSize: '0.75rem' }}
              >
                {days === 0 ? 'Hoy' : `+${days}d`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. SIMULACIÓN DE RESULTADOS EN VIVO */}
      <div className="glass-panel simulation-switch-box">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>🔴 Simular Resultados en Vivo</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
            Actualiza marcadores aleatorios para ver oscilar la tabla en tiempo real.
          </span>
        </div>
        <input 
          type="checkbox" 
          checked={liveSimulatedScores !== null}
          onChange={(e) => handleToggleLiveSim(e.target.checked)}
          style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
        />
      </div>

      {/* 3. CARGA DE RESULTADOS OFICIALES */}
      <div className="glass-panel">
        <h4 className="admin-section-title">⚽ Carga de Resultados Oficiales</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          <div className="input-group">
            <label className="input-label">Seleccionar Partido (104 Disp.)</label>
            <select 
              className="input-field"
              value={selectedMatchId}
              onChange={(e) => {
                setSelectedMatchId(e.target.value);
                const match = matches.find(m => m.id === e.target.value);
                if (match) {
                  setGoalsA(match.scoreA ?? 0);
                  setGoalsB(match.scoreB ?? 0);
                  setMatchStatus(match.status);
                }
              }}
            >
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  {m.id} - {m.phase}: {m.teamA} vs {m.teamB} ({new Date(m.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {selectedMatch && (
            <div className="flex-center" style={{ gap: '1rem', padding: '0.5rem 0' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{selectedMatch.teamA}</span>
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem' }}>
                  <button className="score-control-btn" onClick={() => setGoalsA(Math.max(0, goalsA - 1))}>-</button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, width: '20px' }}>{goalsA}</span>
                  <button className="score-control-btn" onClick={() => setGoalsA(goalsA + 1)}>+</button>
                </div>
              </div>

              <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>VS</span>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{selectedMatch.teamB}</span>
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem' }}>
                  <button className="score-control-btn" onClick={() => setGoalsB(Math.max(0, goalsB - 1))}>-</button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, width: '20px' }}>{goalsB}</span>
                  <button className="score-control-btn" onClick={() => setGoalsB(goalsB + 1)}>+</button>
                </div>
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Estado del Partido</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['pending', 'live', 'finished'].map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setMatchStatus(status as any)}
                  className={`btn-premium ${matchStatus === status ? '' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.4rem 0', fontSize: '0.75rem' }}
                >
                  {status === 'pending' ? 'Pendiente' : status === 'live' ? 'En Vivo' : 'Finalizado'}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-premium" onClick={handleUpdateMatch}>
            Guardar Resultado y Actualizar Puntos
          </button>
        </div>
      </div>

      {/* 4. CREACIÓN DE GRUPOS Y LINKS DE INVITACIÓN */}
      <div className="glass-panel">
        <h4 className="admin-section-title">👥 Crear Nuevo Grupo</h4>
        <form onSubmit={handleCreateGroup} className="onboarding-form" style={{ marginTop: '0.5rem' }}>
          <div className="input-group">
            <label className="input-label">Nombre del Grupo</label>
            <input 
              className="input-field" 
              type="text" 
              placeholder="Ej. Oficina Central"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Código de Enlace (Opcional)</label>
            <input 
              className="input-field" 
              type="text" 
              placeholder="Ej. oficina-central"
              value={newGroupToken}
              onChange={e => setNewGroupToken(e.target.value)}
            />
          </div>

          <button className="btn-premium" type="submit">
            Crear Grupo
          </button>
        </form>
      </div>

      {/* 5. GESTIÓN DE ENLACES DE INVITACIÓN EXISTENTES */}
      <div className="glass-panel">
        <h4 className="admin-section-title">🎟️ Enlaces de Invitación Generados</h4>
        {copySuccessMsg && (
          <div className="text-neon-green" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {copySuccessMsg}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {groups.map(group => {
            const inviteLink = generateInviteLink(group.id);
            const userCount = users.filter(u => u.groupId === group.id).length;

            return (
              <div 
                key={group.id} 
                style={{ 
                  background: 'hsla(240, 35%, 8%, 0.5)', 
                  border: '1px solid hsla(0, 0%, 100%, 0.05)',
                  borderRadius: '8px', 
                  padding: '0.75rem' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{group.name}</span>
                  <span className="text-neon-green" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-sporty)' }}>
                    {userCount} {userCount === 1 ? 'Competidor' : 'Competidores'}
                  </span>
                </div>
                <div className="invite-link-row">
                  <div className="invite-link-display">{inviteLink}</div>
                  <button 
                    className="btn-premium" 
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.7rem' }}
                    onClick={() => handleCopyLink(group.id)}
                  >
                    Copiar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. REINICIO DE BASE DE DATOS */}
      <div className="glass-panel" style={{ border: '1px solid hsla(355, 85%, 45%, 0.3)', background: 'hsla(355, 85%, 45%, 0.02)', marginTop: '0.5rem' }}>
        <h4 className="admin-section-title text-neon-red">⚠️ Restablecimiento Total</h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
          Elimina todos los datos guardados en LocalStorage (usuarios, predicciones, grupos) y recarga los valores por defecto de la demo.
        </p>
        <button 
          className="btn-premium" 
          onClick={handleHardReset} 
          style={{ background: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}
        >
          Reiniciar Aplicación (Hard Reset)
        </button>
      </div>

    </div>
  );
};
export default AdminDashboard;
