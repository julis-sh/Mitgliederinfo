import React from 'react';
import axios from 'axios';

export default function ConnectionStatus() {
  const [offline, setOffline] = React.useState(false);
  const [justReconnected, setJustReconnected] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const timerRef = React.useRef();

  React.useEffect(() => {
    let interval = setInterval(async () => {
      try {
        await axios.get('/api/ping', { timeout: 3000 });
        if (offline) {
          setOffline(false);
          setJustReconnected(true);
          setVisible(true);
          clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            setJustReconnected(false);
            setVisible(false);
          }, 2000);
        }
      } catch {
        setOffline(true);
        setJustReconnected(false);
        setVisible(true);
      }
    }, 10000); // alle 10 Sekunden
    return () => {
      clearInterval(interval);
      clearTimeout(timerRef.current);
    };
  }, [offline]);

  // Banner Fade-Klassen
  const fadeClass = visible ? 'connection-banner-fade-in' : 'connection-banner-fade-out';

  if (justReconnected) {
    return (
      <div
        className={`position-fixed top-0 start-0 end-0 bg-success text-white fw-bold shadow rounded-bottom px-3 py-2 d-flex align-items-center ${fadeClass}`}
        style={{ zIndex: 2000, minHeight: 48, letterSpacing: 0.5 }}
        role="status"
        aria-live="polite"
      >
        <i className="bi bi-wifi fs-5 me-2"></i>
        Verbindung wiederhergestellt.
      </div>
    );
  }

  if (!offline) return null;
  return (
    <div
      className={`position-fixed top-0 start-0 end-0 bg-danger text-white fw-bold shadow rounded-bottom px-3 py-2 d-flex align-items-center ${fadeClass}`}
      style={{ zIndex: 2000, minHeight: 48, letterSpacing: 0.5 }}
      role="status"
      aria-live="polite"
    >
      <i className="bi bi-wifi-off me-2 fs-5"></i>
      Verbindung zum Server verloren. Änderungen werden evtl. nicht gespeichert.
    </div>
  );
}