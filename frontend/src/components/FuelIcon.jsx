export default function FuelIcon({ type = 'pump' }) {
  if (type === 'flame') {
    return (
      <svg className="fuel-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 1.5c.8 3.6 4.5 5.4 5.9 9 1.5 4-1 9.9-5.9 10s-7.6-4.6-6.4-8.8c.6-2 1.9-3.3 2.6-4.8.4 1.5.2 3 1 3.9C9.9 6.7 11.7 4.3 12 1.5Zm-.1 11.2c-1.6 1.7-2.6 2.9-2.6 4.5a2.6 2.6 0 0 0 5.2 0c0-1.6-1-2.8-2.6-4.5Z"
        />
      </svg>
    );
  }
  return (
    <svg className="fuel-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5 2.5h8a1.5 1.5 0 0 1 1.5 1.5v7h.8a2.2 2.2 0 0 1 2.2 2.2v4.6a.9.9 0 0 0 1.8 0V8.6L17 6.3l1.2-1.2 3 3v9.7a2.7 2.7 0 0 1-5.4 0v-4.6a.4.4 0 0 0-.4-.4h-.9V20h1v1.5H3V20h.5V4A1.5 1.5 0 0 1 5 2.5Zm1 2.3v5.2h6V4.8Z"
      />
    </svg>
  );
}
