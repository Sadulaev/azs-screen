import { isCustomLogo, resolveLogoUrl } from '../brand';

/**
 * Brand mark from config.logoUrl, or bundled /default-logo.png
 * @param {'badge'|'hex'|'inline'} variant
 */
export default function MustangLogo({
  logoUrl = '',
  variant = 'badge',
  alt = 'МУСТАНГ',
}) {
  const src = resolveLogoUrl(logoUrl);
  const custom = isCustomLogo(logoUrl);

  return (
    <div className={`logo logo--${variant} ${custom ? 'logo--custom' : 'logo--default'}`}>
      <img className="logo__img" src={src} alt={alt} draggable={false} />
    </div>
  );
}
