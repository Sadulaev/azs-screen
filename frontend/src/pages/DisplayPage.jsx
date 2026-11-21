import { useEffect, useState } from 'react';
import { api } from '../api';
import FuelIcon from '../components/FuelIcon';
import MustangLogo from '../components/MustangLogo';
import '../styles/display.css';

const POLL_MS = 5000;

export default function DisplayPage() {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const data = await api.getConfig();
        if (alive) {
          setConfig(data);
          setError('');
        }
      } catch (e) {
        if (alive) setError(e.message || 'Ошибка загрузки');
      }
    };

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!config) {
    return (
      <div className="display display--loading">
        <p>{error || 'Загрузка…'}</p>
      </div>
    );
  }

  const bgStyle = config.backgroundUrl
    ? { backgroundImage: `url(${config.backgroundUrl})` }
    : undefined;

  const layout = config.layout || 'grid-2x3';

  return (
    <div className={`display display--${layout}`} style={bgStyle}>
      <div className="display__veil" />
      <div className="display__splash display__splash--tl" aria-hidden="true" />
      <div className="display__splash display__splash--br" aria-hidden="true" />

      {layout === 'list-logo-left' ? (
        <ListLayout config={config} />
      ) : (
        <GridLayout config={config} />
      )}
    </div>
  );
}

function GridLayout({ config }) {
  return (
    <div className="display__inner display__inner--grid">
      <header className="display__header">
        <MustangLogo logoUrl={config.logoUrl} brand={config.brand} />
        <h1 className="display__title">{config.title}</h1>
      </header>
      <div className="price-grid">
        {config.fuels.map((fuel) => (
          <PricePill key={fuel.id} fuel={fuel} />
        ))}
      </div>
    </div>
  );
}

function ListLayout({ config }) {
  return (
    <div className="display__inner display__inner--list">
      <aside className="display__brand-panel">
        <MustangLogo logoUrl={config.logoUrl} brand={config.brand} />
        <div className="display__brand-glow" aria-hidden="true" />
      </aside>
      <section className="display__list-panel">
        <h1 className="display__title">{config.title}</h1>
        <div className="price-list">
          {config.fuels.map((fuel) => (
            <PricePill key={fuel.id} fuel={fuel} slash />
          ))}
        </div>
      </section>
    </div>
  );
}

function PricePill({ fuel, slash = false }) {
  return (
    <article className={`price-pill ${slash ? 'price-pill--slash' : ''}`}>
      <div className="price-pill__left">
        <FuelIcon type={fuel.icon} />
        <span className="price-pill__name">{fuel.name}</span>
      </div>
      {slash ? <span className="price-pill__sep" aria-hidden="true" /> : null}
      <div className="price-pill__right">
        <span className="price-pill__price">{fuel.price}</span>
        <span className="price-pill__unit">{fuel.unit}</span>
      </div>
    </article>
  );
}
