export default function StatusBadge({ value }) {
  const normalized = value.toLowerCase().replace(/\s+/g, '-');
  return <span className={`status-badge ${normalized}`}>{value}</span>;
}
