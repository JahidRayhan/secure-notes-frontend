import { Button } from './Button.jsx';

/** <Pagination pagination={res.pagination} onChange={setPage} />  (pagination = { page, limit, total, totalPages }) */
export function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total } = pagination;
  return (
    <nav className="pagination" aria-label="Pagination">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
      <span aria-live="polite">Page {page} of {totalPages} <span className="muted">({total} total)</span></span>
      <Button variant="secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</Button>
    </nav>
  );
}
