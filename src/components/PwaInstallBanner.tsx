import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalada como PWA standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone;
    
    if (isStandalone) return;

    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    if (ios) {
      // Mostrar banner de iOS si es la primera visita y no está instalada (guardar en localStorage)
      const dismissed = localStorage.getItem('prode_pwa_ios_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    }

    // Escuchar el prompt nativo de Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (isIOS) {
      localStorage.setItem('prode_pwa_ios_dismissed', 'true');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="pwa-banner page-swipe" style={{ border: '1px solid var(--color-primary)' }}>
      <div className="pwa-banner-text">
        <span className="pwa-banner-title">🏆 Instalar Prode Mundial 2026</span>
        <span className="pwa-banner-desc">
          {isIOS 
            ? 'Toca compartir 📤 y luego "Agregar a inicio" para jugar como App nativa.' 
            : 'Agrégala a tu pantalla de inicio para una experiencia inmersiva de juego.'}
        </span>
      </div>
      
      {!isIOS && deferredPrompt && (
        <button 
          className="btn-premium" 
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
          onClick={handleInstallClick}
        >
          Instalar
        </button>
      )}

      <button className="pwa-banner-close" onClick={handleDismiss}>
        ✕
      </button>
    </div>
  );
};
export default PwaInstallBanner;
