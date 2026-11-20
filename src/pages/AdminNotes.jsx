import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, useQuery, Pagination } from '../index.js';
import { ListState } from '../components/ListState.jsx';
import { fmt } from '../utils.js';

export default function AdminNotes() {
  const [page, setPage] = useState(1);
  const { data, pagination, loading, error, reload } = useQuery(() => api.get('/admin/notes', { page, limit: 10 }), [page]);
  const items = data || [];
  return (
    <>
      <div className="page-head"><h1>All notes</h1></div>
      <ListState loading={loading} error={error} hasData={items.length > 0} onRetry={reload}
        emptyTitle="No notes exist yet" />
      <div className="stack">
        {items.map((n) => (
          <article className="card" key={n._id}>
            <div className="row between">
              <span className="note-title">{n.title}</span>
              <span className="meta">{fmt(n.updatedAt)}</span>
            </div>
            <p className="meta">
              Owner:{' '}
              {n.owner ? <Link to={`/users/${n.owner._id}/posts`} state={{ name: n.owner.name }}>{n.owner.name}</Link> : 'deleted user'}
              {n.owner && <> ({n.owner.email})</>}
            </p>
            <p className="note-body">{n.content}</p>
          </article>
        ))}
      </div>
      <Pagination pagination={pagination} onChange={setPage} />
    </>
  );
}
