import { useEffect, useRef, useState } from 'react';
import FuelIcon from './FuelIcon';
import MustangLogo from './MustangLogo';

export default function Board({ config }) {
  const layout = config.layout === 'list-logo-left' ? 'list' : 'grid';
  const hasBg = Boolean(config.backgroundUrl);

  return (
    <div className={`board board--${layout}`}>
      {hasBg ? (
        <div className="board__bg" style={{ backgroundImage: `url(${config.backgroundUrl})` }} />
      ) : (
        <Splashes layout={layout} />
      )}
      <div className={`board__veil ${hasBg ? 'board__veil--image' : ''}`} />

      {layout === 'list' ? <ListLayout config={config} /> : <GridLayout config={config} />}
    </div>
  );
}

function GridLayout({ config }) {
  return (
    <div className="board__content board__content--grid">
      <header className="grid-head">
        <MustangLogo variant="badge" />
        <div className="grid-head__brand">
          <span className="rule" />
          <span className="brand-word">{config.brand}</span>
          <span className="rule" />
        </div>
        <h1 className="board-title">{config.title}</h1>
      </header>
      <div className="price-grid">
        {config.fuels.map((fuel, i) => (
          <PricePill key={fuel.id} fuel={fuel} index={i} withIcon />
        ))}
      </div>
    </div>
  );
}

function ListLayout({ config }) {
  return (
    <div className="board__content board__content--list">
      <aside className="list-brand">
        <MustangLogo variant="hex" label={config.brand} />
      </aside>
      <div className="list-divider" />
      <section className="list-main">
        <h1 className="board-title board-title--left">{config.title}</h1>
        <div className="price-list">
          {config.fuels.map((fuel, i) => (
            <PricePill key={fuel.id} fuel={fuel} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PricePill({ fuel, index, withIcon = false }) {
  const flash = useFlashOnChange(fuel.price);
  return (
    <article
      className={`pill ${flash ? 'pill--flash' : ''}`}
      style={{ '--i': index }}
    >
      <div className="pill__name">
        {withIcon ? <FuelIcon type={fuel.icon} /> : null}
        <span>{fuel.name}</span>
      </div>
      <span className="pill__slash" aria-hidden="true" />
      <div className="pill__price">
        <span className="pill__value">{fuel.price}</span>
        <span className="pill__unit">{fuel.unit}</span>
      </div>
    </article>
  );
}

function useFlashOnChange(value) {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [value]);
  return flash;
}

function Splashes({ layout }) {
  return (
    <div className="splashes" aria-hidden="true">
      <svg className="splash splash--a" viewBox="0 0 600 600">
        <defs>
          <linearGradient id="oilA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff1c4" />
            <stop offset="0.25" stopColor="#f0b54a" />
            <stop offset="0.6" stopColor="#a45d12" />
            <stop offset="1" stopColor="#2a1504" />
          </linearGradient>
        </defs>
        <path
          fill="url(#oilA)"
          d="M0 0h380c-40 40-60 90-150 120C140 150 90 230 70 330 50 420 20 470 0 520Z"
        />
        <path
          fill="none"
          stroke="#ffd98a"
          strokeWidth="3"
          opacity="0.7"
          d="M360 10c-50 60-80 100-160 130S80 260 60 360"
        />
      </svg>
      <svg className="splash splash--b" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="oilB" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#3a1d05" />
            <stop offset="0.45" stopColor="#b8691a" />
            <stop offset="0.8" stopColor="#f6c463" />
            <stop offset="1" stopColor="#fff3cf" />
          </linearGradient>
        </defs>
        <path
          fill="url(#oilB)"
          d={
            layout === 'list'
              ? 'M0 600c120-80 220-60 340-110S560 380 800 330V600Z'
              : 'M800 0v600H240c90-40 170-120 250-230S650 120 800 0Z'
          }
        />
      </svg>
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className={`drop drop--${i}`} />
      ))}
    </div>
  );
}
