/** <EmptyState title="No notes yet" description="..." action={<Button/>} /> Also used for error states (tone="error"). */
export function EmptyState({ title, description, action, tone }) {
  return (
    <div className={`empty ${tone === 'error' ? 'empty-error' : ''}`} role={tone === 'error' ? 'alert' : undefined}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
