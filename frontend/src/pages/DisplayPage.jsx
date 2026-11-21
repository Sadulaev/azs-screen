import { useEffect, useState } from 'react';
import { api } from '../api';
import Board from '../components/Board';
import ScaledStage from '../components/ScaledStage';
import '../styles/display.css';

const POLL_MS = 5000;
const CACHE_KEY = 'mustang_display_cache';

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
  } catch {
    return null;
  }
}

export default function DisplayPage() {
  const [config, setConfig] = useState(readCache);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const data = await api.getConfig();
        if (!alive) return;
        setConfig(data);
        setOffline(false);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch {
        if (alive) setOffline(true);
      }
    };
    load();
    const id = setInterval(load, POLL_MS);
    const reload = setTimeout(() => window.location.reload(), 6 * 60 * 60 * 1000);
    return () => {
      alive = false;
      clearInterval(id);
      clearTimeout(reload);
    };
  }, []);

  return (
    <div className="display-root">
      {config ? (
        <ScaledStage>
          <Board config={config} />
        </ScaledStage>
      ) : (
        <div className="display-loading">
          <span className="display-loading__dot" />
        </div>
      )}
      {offline ? <span className="offline-dot" title="Нет связи с сервером" /> : null}
    </div>
  );
}
