export default function FuelIcon({ type = 'pump' }) {
  if (type === 'flame') {
    return (
      <svg className="fuel-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2c1.5 3.2-.2 5.2-1.4 6.5C9.2 10 8 11.6 8 14a4 4 0 0 0 8 0c0-2.8-1.6-4.6-2.8-6.1C12 6.4 11 5 12 2zm0 18a2.5 2.5 0 0 1-2.5-2.5c0-1.4.9-2.4 1.7-3.3.3-.3.6-.7.8-1 .2.3.5.7.8 1 .8.9 1.7 1.9 1.7 3.3A2.5 2.5 0 0 1 12 20z"
        />
      </svg>
    );
  }

  return (
    <svg className="fuel-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 3h10a1 1 0 0 1 1 1v14h1.5a1.5 1.5 0 0 0 1.5-1.5V10.6l2.1-2.1a1 1 0 0 1 1.4 0l.7.7a1 1 0 0 1 0 1.4L18 14.3v2.2A3.5 3.5 0 0 1 14.5 20H15v1H4v-1h1V4a1 1 0 0 1 1-1zm2 2v14h6V5H6zm11.3 3.1-.7.7V9a1 1 0 1 1 2 0v1.8l-.7-.7a1 1 0 0 0-1.4 0z"
      />
    </svg>
  );
}
