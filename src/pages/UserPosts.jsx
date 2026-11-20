import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, useAuth, useQuery, Button, Input, Pagination, useToast } from '../index.js';
import { ListState } from '../components/ListState.jsx';
import { useClampPage } from '../hooks/useClampPage.js';
import { fmt, isObjectId } from '../utils.js';

function PostForm({ onCreated }) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errs, setErrs] = useState({});
  const [serverErr, setServerErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const v = {};
    if (!title.trim()) v.title = 'Title is required';
    else if (title.length > 200) v.title = 'Max 200 characters';
    if (!body.trim()) v.body = 'Body is required';
    else if (body.length > 20000) v.body = 'Max 20000 characters';
    setErrs(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    setServerErr('');
    try {
      await api.post('/posts', { title: title.trim(), body });
      setTitle(''); setBody('');
      toast.success('Post published');
      onCreated();
    } catch (err) {
      setServerErr(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card stack" onSubmit={submit} noValidate>
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errs.title} />
      <Input as="textarea" rows={4} label="Body" value={body} onChange={(e) => setBody(e.target.value)} error={errs.body} />
      {serverErr && <p className="notice notice-error" role="alert">{serverErr}</p>}
      <div><Button type="submit" loading={busy}>Publish post</Button></div>
    </form>
  );
}

function UserPosts({ userId }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, pagination, loading, error, reload } = useQuery(() => api.get(`/users/${userId}/posts`, { page, limit: 10 }), [userId, page]);
  const items = data || [];
  const [lookup, setLookup] = useState('');
  const [lookupErr, setLookupErr] = useState('');
  const mine = !!user && userId === user._id;
  const name = location.state?.name;
  useClampPage(loading, data, page, setPage);

  function go(e) {
    e.preventDefault();
    const id = lookup.trim();
    if (!isObjectId(id)) { setLookupErr('Enter a valid 24-character user ID'); return; }
    setLookupErr('');
    navigate(`/users/${id}/posts`);
  }

  return (
    <>
      <div className="page-head"><h1>{mine ? 'My posts' : name ? `Posts by ${name}` : 'Posts'}</h1></div>
      {mine && <section aria-labelledby="new-post"><h2 id="new-post">New post</h2><PostForm onCreated={() => { setPage(1); reload(); }} /></section>}
      <ListState loading={loading} error={error} hasData={items.length > 0} onRetry={reload}
        emptyTitle="No posts yet" emptyDescription={mine ? 'Publish your first post above.' : 'This user has not published anything.'} />
      <div className="stack">
        {items.map((p) => (
          <article className="card" key={p._id}>
            <div className="row between">
              <span className="note-title">{p.title}</span>
              <span className="meta">{fmt(p.createdAt)}</span>
            </div>
            <p className="note-body">{p.body}</p>
          </article>
        ))}
      </div>
      <Pagination pagination={pagination} onChange={setPage} />
      <details className="lookup">
        <summary>View another user's posts by ID</summary>
        <form className="row" onSubmit={go} noValidate>
          <Input label="User ID" value={lookup} onChange={(e) => setLookup(e.target.value)} error={lookupErr} />
          <Button type="submit" variant="secondary">View posts</Button>
        </form>
      </details>
    </>
  );
}

// key={id} remounts the page (resets paging and form state) when the URL's user changes.
export default function UserPostsRoute() {
  const { id } = useParams();
  return <UserPosts key={id} userId={id} />;
}
