export default function MustangLogo({ logoUrl = '', brand = 'МУСТАНГ', compact = false }) {
  if (logoUrl) {
    return (
      <div className={`mustang-logo mustang-logo--image ${compact ? 'mustang-logo--compact' : ''}`}>
        <img className="mustang-logo__photo" src={logoUrl} alt={brand || 'Логотип'} />
      </div>
    );
  }

  return (
    <div className={`mustang-logo ${compact ? 'mustang-logo--compact' : ''}`}>
      <svg className="mustang-logo__shield" viewBox="0 0 120 140" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          d="M60 8 L108 28 V78 C108 108 86 128 60 136 C34 128 12 108 12 78 V28 Z"
        />
        <path
          fill="currentColor"
          d="M28 78c6-18 18-30 34-38 2 8-2 14-6 18 10-2 22 2 30 12-8 2-14 8-16 16 10-4 20 0 28 8-14 10-30 14-46 10-8 6-16 4-24-2 4-8 4-16 0-24z"
        />
      </svg>
      <span className="mustang-logo__word">{brand || 'МУСТАНГ'}</span>
    </div>
  );
}
