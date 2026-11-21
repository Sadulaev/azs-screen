const HORSE =
  'M18 52c4-6 9-9 15-10l6-9c2-3 6-5 9-4l5-5 1 5c5 2 8 6 9 11l14 1c8 0 15 3 21 8l12-6c4-2 8 0 9 4-6 1-10 4-13 8l-6 3c-1 6-5 10-10 12l6 9-5 2-8-9-9 1 3 11-5 1-6-11c-5 0-10-2-14-5l-8 7 2 9-5 1-4-11 7-10c-3-4-4-8-4-12l-9 1c-5 1-9 3-12 7Z';

export default function MustangLogo({ variant = 'badge', label = 'MUSTANG' }) {
  if (variant === 'hex') {
    return (
      <div className="logo-hex">
        <svg viewBox="0 0 400 360" className="logo-hex__frame" aria-hidden="true">
          <path
            d="M100 10h200l90 170-90 170H100L10 180Z"
            fill="rgba(0,0,0,0.55)"
            stroke="#fff"
            strokeWidth="12"
          />
          <g transform="translate(70 70) scale(2.2)" fill="#fff">
            <path d={HORSE} />
          </g>
        </svg>
        <span className="logo-hex__word">{label}</span>
      </div>
    );
  }

  return (
    <svg viewBox="0 0 240 150" className="logo-badge" aria-hidden="true">
      <path
        d="M120 6 232 52l-26 92H34L8 52Z"
        fill="rgba(0,0,0,0.35)"
        stroke="#fff"
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <g transform="translate(55 24) scale(1.05)" fill="#fff">
        <path d={HORSE} />
      </g>
    </svg>
  );
}
