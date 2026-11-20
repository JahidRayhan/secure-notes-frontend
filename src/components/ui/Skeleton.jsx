/** <Skeleton lines={3} /> text placeholder, or <Skeleton height={80} /> block. Decorative; parent sets role=status. */
export function Skeleton({ lines = 1, height, width = '100%' }) {
  if (height) return <div className="skeleton" style={{ height, width }} aria-hidden="true" />;
  return (
    <div aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton skeleton-line" style={{ width: i === lines - 1 && lines > 1 ? '60%' : width }} />
      ))}
    </div>
  );
}
