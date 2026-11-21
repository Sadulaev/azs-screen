import { useEffect, useRef, useState } from 'react';
import { isCustomBackground, resolveBackgroundUrl } from '../brand';
import FuelIcon from './FuelIcon';
import MustangLogo from './MustangLogo';

export default function Board({ config }) {
  const layout = config.layout === 'list-logo-left' ? 'list' : 'grid';
  const bgUrl = resolveBackgroundUrl(config.backgroundUrl);
  const customBg = isCustomBackground(config.backgroundUrl);

  return (
    <div className={`board board--${layout}`}>
      <div
        className={`board__bg ${customBg ? 'board__bg--custom' : 'board__bg--default'}`}
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      <div className="board__veil board__veil--image" />

      {layout === 'list' ? <ListLayout config={config} /> : <GridLayout config={config} />}
    </div>
  );
}

function GridLayout({ config }) {
  return (
    <div className="board__content board__content--grid">
      <header className="grid-head">
        <MustangLogo variant="badge" logoUrl={config.logoUrl} alt={config.brand || 'МУСТАНГ'} />
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
        <MustangLogo variant="hex" logoUrl={config.logoUrl} alt={config.brand || 'МУСТАНГ'} />
      </aside>
      <div className="list-divider" aria-hidden="true" />
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
    <article className={`pill ${flash ? 'pill--flash' : ''}`} style={{ '--i': index }}>
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

