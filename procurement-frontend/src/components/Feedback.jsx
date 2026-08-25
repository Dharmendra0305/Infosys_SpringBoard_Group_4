export function Loading({ label = 'Loading…' }) {
  return <div className="loading-line">{label}</div>;
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="error-banner">{message}</div>;
}

export function EmptyRow({ colSpan, children }) {
  return (
    <tr className="empty-row">
      <td colSpan={colSpan}>{children}</td>
    </tr>
  );
}
