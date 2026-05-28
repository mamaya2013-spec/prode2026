import React, { useState, useRef, useEffect } from 'react';
import { useProde } from '../context/ProdeContext';

export const GroupChat: React.FC = () => {
  const { currentUser, currentGroup, chatMessages, sendChatMessage } = useProde();
  const [inputText, setInputText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const EMOJIS = ['⚽', '🏆', '🔥', '🥅', '🌟', '👑', '😱', '🤪', '👏', '💥', '📣', '🛡️'];

  // Filtrar mensajes pertenecientes únicamente al grupo del usuario
  const groupMessages = currentGroup 
    ? chatMessages.filter(m => m.groupId === currentGroup.id)
    : [];

  // Hacer scroll automático al final cuando llega un nuevo mensaje
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText.trim());
    setInputText('');
    setShowEmojis(false);
  };

  const handleAddEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  if (!currentUser || !currentGroup) return null;

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px', padding: '1rem', gap: '0.75rem', overflow: 'hidden' }}>
      
      {/* Cabecera del Chat */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsla(0,0%,100%,0.08)', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>💬</span>
          <span className="sport-font" style={{ textTransform: 'uppercase', fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
            Chicana Grupal
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', background: 'hsla(0,0%,100%,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
          En Vivo 🔴
        </span>
      </div>

      {/* Feed de Mensajes */}
      <div 
        ref={feedRef} 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.65rem', 
          paddingRight: '0.25rem',
          minHeight: '260px'
        }}
      >
        {groupMessages.map(msg => {
          const isMe = msg.userId === currentUser.id;
          const isSystem = msg.type === 'system';

          if (isSystem) {
            return (
              <div 
                key={msg.id} 
                className="page-swipe"
                style={{ 
                  alignSelf: 'center', 
                  background: 'rgba(285, 90, 50, 0.08)', 
                  border: '1px solid hsla(285, 90%, 50%, 0.15)', 
                  borderRadius: '12px', 
                  padding: '0.4rem 0.85rem', 
                  fontSize: '0.75rem', 
                  color: 'var(--color-purple-neon)',
                  textAlign: 'center',
                  maxWidth: '90%',
                  boxShadow: '0 0 10px hsla(285, 90%, 50%, 0.05)'
                }}
              >
                📢 {msg.message}
              </div>
            );
          }

          return (
            <div 
              key={msg.id}
              className="page-swipe"
              style={{ 
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start'
              }}
            >
              {/* Remitente */}
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginBottom: '0.15rem', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}>
                {isMe ? 'Tú' : msg.userName}
              </span>
              
              {/* Globo de Texto */}
              <div 
                style={{ 
                  background: isMe ? 'var(--gradient-neon)' : 'hsla(240, 30%, 18%, 0.95)',
                  color: isMe ? 'var(--color-text-dark)' : 'var(--color-text-main)',
                  border: isMe ? 'none' : 'var(--glass-border)',
                  borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.85rem',
                  boxShadow: isMe ? 'var(--glass-shadow-primary)' : 'var(--glass-shadow)',
                  lineHeight: '1.3',
                  wordBreak: 'break-word'
                }}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>

      {/* Caja de Emojis */}
      {showEmojis && (
        <div 
          className="page-swipe"
          style={{ 
            display: 'flex', 
            gap: '0.4rem', 
            justifyContent: 'center', 
            padding: '0.35rem 0', 
            background: 'hsla(240, 30%, 8%, 0.8)', 
            borderRadius: '8px',
            border: '1px solid hsla(0,0%,100%,0.05)' 
          }}
        >
          {EMOJIS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', transition: 'transform 0.15s' }}
              className="ball-active"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Formulario de Envío */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          className="score-control-btn"
          style={{ width: '38px', height: '38px', borderRadius: '8px', fontSize: '1.1rem' }}
          onClick={() => setShowEmojis(!showEmojis)}
        >
          😊
        </button>
        <input 
          className="input-field" 
          type="text" 
          placeholder="Escribe chicana..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: '8px', fontSize: '0.9rem' }}
        />
        <button 
          className="btn-premium" 
          type="submit"
          style={{ padding: '0 0.85rem', borderRadius: '8px', height: '38px' }}
        >
          🛩️
        </button>
      </form>
    </div>
  );
};
export default GroupChat;
