export default function StatusStamp({ status }) {
  if (!status) return null;
  const cls = status.toLowerCase();
  return <span className={`stamp ${cls}`}>{status.replace(/_/g, ' ')}</span>;
}
