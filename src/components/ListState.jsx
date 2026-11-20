import { Button, EmptyState, Skeleton } from './ui/index.js';

/**
 * Loading / error / empty states for a list. Renders nothing when there is data to show.
 * <ListState loading error hasData emptyTitle emptyDescription emptyAction onRetry />
 */
export function ListState({ loading, error, hasData, emptyTitle, emptyDescription, emptyAction, onRetry }) {
  if (error) {
    return (
      <EmptyState
        tone="error"
        title="Something went wrong"
        description={error.message}
        action={onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
      />
    );
  }
  if (loading && !hasData) {
    return (
      <div role="status" aria-label="Loading" className="stack">
        {[0, 1, 2].map((i) => <div key={i} className="card"><Skeleton lines={3} /></div>)}
      </div>
    );
  }
  if (!loading && !hasData) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }
  return null;
}
