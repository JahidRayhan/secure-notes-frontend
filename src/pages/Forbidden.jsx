import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/index.js';

export function Forbidden() {
  return <EmptyState tone="error" title="403: Admins only" description="You don't have access to this page." action={<Link to="/notes">Back to my notes</Link>} />;
}
export function NotFound() {
  return <EmptyState title="Page not found" action={<Link to="/notes">Go home</Link>} />;
}
