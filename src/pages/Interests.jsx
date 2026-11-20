import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, useQuery, Pagination, Button, Input } from '../index.js';
import { ListState } from '../components/ListState.jsx';
import { useDebounce } from '../hooks/useDebounce.js';

export default function Interests() {
  const [text, setText] = useState('');
  const interest = useDebounce(text.trim(), 350);

  // The page is remembered together with the filter it belongs to, so changing the filter
  // returns to page 1 without an extra request.
  const [pageState, setPageState] = useState({ key: '', page: 1 });
  const page = pageState.key === interest ? pageState.page : 1;
  const setPage = (p) => setPageState({ key: interest, page: p });

  const { data, pagination, loading, error, reload } = useQuery(
    () => api.get('/admin/users/by-interests', { page, limit: 12, interest }),
    [page, interest]
  );
  const items = data || [];
  const clear = () => setText('');

  return (
    <>
      <div className="page-head"><h1>Users by interest</h1></div>

      <div className="filter-bar" role="search">
        <Input
          label="Filter by interest"
          type="search"
          value={text}
          maxLength={40}
          autoComplete="off"
          placeholder="e.g. chess"
          hint="Exact match, not case-sensitive."
          onChange={(e) => setText(e.target.value)}
        />
        {text && <Button variant="ghost" onClick={clear}>Clear</Button>}
      </div>

      <ListState
        loading={loading}
        error={error}
        hasData={items.length > 0}
        onRetry={reload}
        emptyTitle={interest ? `No users with the interest “${interest}”` : 'No interests recorded yet'}
        emptyDescription={interest
          ? 'Check the spelling, try another interest, or clear the filter.'
          : 'Users can add interests when they register or edit their profile.'}
        emptyAction={interest ? <Button variant="secondary" onClick={clear}>Clear filter</Button> : undefined}
      />
      <div className="cards">
        {items.map((g) => (
          <section className="card" key={g.interest} aria-label={g.interest}>
            <div className="row between">
              <h2 className="card-title">{g.interest}</h2>
              <span className="badge">{g.count}</span>
            </div>
            <ul className="chip-list">
              {g.users.map((u) => (
                <li key={u._id}>
                  <Link to={`/users/${u._id}/posts`} state={{ name: u.name }}>{u.name}</Link>{' '}
                  <span className="meta">{u.email}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <Pagination pagination={pagination} onChange={setPage} />
    </>
  );
}
