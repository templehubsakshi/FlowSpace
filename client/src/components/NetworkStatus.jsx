import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function NetworkStatus() {
  const [isOnline,     setIsOnline]     = useState(navigator.onLine);
  const [showBanner,   setShowBanner]   = useState(false);
  const [justReturned, setJustReturned] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReturned(true);
      // Auto-hide "back online" after 2.5s
      setTimeout(() => { setJustReturned(false); setShowBanner(false); }, 2500);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      setJustReturned(false);
    };
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner && !justReturned) return null;

  const isSuccess = isOnline && justReturned;

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 16px',
      borderRadius: 'var(--radius-md)',
      background: isSuccess ? 'var(--status-done-bg)' : 'var(--status-high-bg)',
      border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
      boxShadow: 'var(--shadow-lg)',
      fontSize: 13, fontWeight: 600,
      color: isSuccess ? 'var(--status-done)' : 'var(--status-high)',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      {isSuccess
        ? <><Wifi style={{ width: 15, height: 15 }} /> Back online!</>
        : <><WifiOff style={{ width: 15, height: 15 }} /> No internet connection</>
      }
    </div>
  );
}