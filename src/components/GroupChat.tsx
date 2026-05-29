import React, { useState, useRef, useEffect } from 'react';
import { useProde } from '../context/ProdeContext';
import JerseySvg from './JerseySvg';

const STICKERS = [
  { id: 'bobo', text: '¿Qué mirás, bobo? 😠', color: 'hsl(10, 85%, 55%)' },
  { id: 'siuuu', text: '¡SIUUU! 🐐', color: 'hsl(45, 95%, 50%)' },
  { id: 'mufa', text: 'Anulo Mufa 🍀', color: 'hsl(140, 80%, 45%)' },
  { id: 'muchachos', text: '¡Muchaaachos! 🎶', color: 'hsl(198, 90%, 60%)' },
  { id: 'pelota', text: 'La pelota no se mancha ⚽', color: 'hsl(55, 90%, 50%)' },
  { id: 'heroe', text: '¡Hoy te convertís en héroe! 🦸‍♂️', color: 'hsl(215, 90%, 50%)' },
  { id: 'creer', text: 'Elijo creer ✨', color: 'hsl(285, 90%, 55%)' },
  { id: 'mamando', text: 'Que la sigan mamando 🚬', color: 'hsl(355, 80%, 45%)' }
];

export const GroupChat: React.FC = () => {
  const { currentUser, currentGroup, chatMessages, sendChatMessage, users } = useProde();
  const [inputText, setInputText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const EMOJIS = ['⚽', '🏆', '🔥', '🥅', '🌟', '👑', '😱', '🤪', '👏', '💥', '📣', '🛡️'];

  const groupMessages = currentGroup 
    ? chatMessages.filter(m => m.groupId === currentGroup.id)
    : [];

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
    setShowStickers(false);
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

          const msgUser = users.find(u => u.id === msg.userId);
          const isSticker = msg.message.startsWith('[STICKER:') && msg.message.endsWith(']');
          let stickerObj = null;
          if (isSticker) {
            const stickerId = msg.message.substring(9, msg.message.length - 1);
            stickerObj = STICKERS.find(s => s.id === stickerId);
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.15rem', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}>
                {msgUser?.jersey && (
                  <JerseySvg 
                    primaryColor={msgUser.jersey.primaryColor} 
                    secondaryColor={msgUser.jersey.secondaryColor} 
                    pattern={msgUser.jersey.pattern} 
                    number={msgUser.jersey.number} 
                    size={16} 
                  />
                )}
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                  {isMe ? 'Tú' : msg.userName}
                </span>
              </div>
              
              {/* Globo de Texto o Sticker */}
              {isSticker && stickerObj ? (
                <div 
                  className="sticker-card-bubble"
                  style={{
                    background: 'linear-gradient(135deg, hsla(240, 30%, 8%, 0.9), hsla(240, 30%, 15%, 0.98))',
                    border: `2px solid ${stickerObj.color}`,
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    color: '#fff',
                    textAlign: 'center',
                    boxShadow: `0 0 12px ${stickerObj.color}60, inset 0 0 8px rgba(255,255,255,0.05)`,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    cursor: 'default',
                    userSelect: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem',
                    transform: 'skew(-3deg)',
                    fontFamily: 'var(--font-sporty)'
                  }}
                >
                  <span>{stickerObj.text}</span>
                  <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1px' }}>LA CAPRICHOSA</span>
                </div>
              ) : (
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
              )}
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

      {/* Caja de Stickers */}
      {showStickers && (
        <div 
          className="page-swipe"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.5rem', 
            padding: '0.5rem', 
            background: 'hsla(240, 30%, 8%, 0.95)', 
            borderRadius: '8px',
            border: '1px solid hsla(0,0%,100%,0.08)',
            maxHeight: '140px',
            overflowY: 'auto'
          }}
        >
          {STICKERS.map(sticker => (
            <button
              key={sticker.id}
              type="button"
              onClick={() => {
                sendChatMessage(`[STICKER:${sticker.id}]`);
                setShowStickers(false);
              }}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px dashed ${sticker.color}`,
                borderRadius: '6px',
                padding: '0.35rem',
                fontSize: '0.75rem',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-sporty)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${sticker.color}20`;
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {sticker.text}
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
          onClick={() => {
            setShowEmojis(!showEmojis);
            setShowStickers(false);
          }}
        >
          😊
        </button>
        <button
          type="button"
          className="score-control-btn"
          style={{ width: '38px', height: '38px', borderRadius: '8px', fontSize: '1.1rem' }}
          onClick={() => {
            setShowStickers(!showStickers);
            setShowEmojis(false);
          }}
        >
          🎭
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
