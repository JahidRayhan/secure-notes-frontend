import { useState } from 'react';
import { api, useQuery, Button, Input, Pagination, useToast } from '../index.js';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { ListState } from '../components/ListState.jsx';
import { useClampPage } from '../hooks/useClampPage.js';
import { fmt } from '../utils.js';

function NoteForm({ initial, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');
  const [errs, setErrs] = useState({});
  const [serverErr, setServerErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const v = {};
    if (!title.trim()) v.title = 'Title is required';
    else if (title.length > 200) v.title = 'Max 200 characters';
    if (!content.trim()) v.content = 'Content is required';
    else if (content.length > 20000) v.content = 'Max 20000 characters';
    setErrs(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    setServerErr('');
    try {
      await onSubmit({ title: title.trim(), content });
      if (!initial) { setTitle(''); setContent(''); }
    } catch (err) {
      setServerErr(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card stack" onSubmit={submit} noValidate
      onKeyDown={(e) => { if (e.key === 'Escape' && onCancel) onCancel(); }}>
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)}
        error={errs.title} hint={`${title.length}/200`} autoFocus={!!initial} />
      <Input as="textarea" rows={4} label="Content" value={content}
        onChange={(e) => setContent(e.target.value)} error={errs.content} />
      {serverErr && <p className="notice notice-error" role="alert">{serverErr}</p>}
      <div className="row">
        <Button type="submit" loading={busy}>{initial ? 'Save changes' : 'Add note'}</Button>
        {onCancel && <Button variant="secondary" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}

export default function MyNotes() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const { data, pagination, loading, error, reload } = useQuery(() => api.get('/notes', { page, limit: 10 }), [page]);
  const items = data || [];
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  useClampPage(loading, data, page, setPage);

  async function create(values) {
    await api.post('/notes', values);
    toast.success('Note added');
    setPage(1);
    reload();
  }
  async function update(id, values) {
    await api.put('/notes/' + id, values);
    toast.success('Note saved');
    setEditing(null);
    reload();
  }
  async function confirmDelete() {
    setDeleting(true);
    try {
      await api.del('/notes/' + toDelete._id);
      toast.success('Note deleted');
      setToDelete(null);
      reload();
    } catch (e) {
      toast.error(e);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="page-head"><h1>My notes</h1></div>
      <section aria-labelledby="new-note"><h2 id="new-note">New note</h2><NoteForm onSubmit={create} /></section>
      <h2 className="section-title">Your notes</h2>
      <ListState loading={loading} error={error} hasData={items.length > 0} onRetry={reload}
        emptyTitle="No notes yet" emptyDescription="Create your first note above." />
      <div className="stack">
        {items.map((n) =>
          editing === n._id ? (
            <NoteForm key={n._id} initial={n} onSubmit={(v) => update(n._id, v)} onCancel={() => setEditing(null)} />
          ) : (
            <article className="card" key={n._id}>
              <div className="row between">
                <span className="note-title">{n.title}</span>
                <span className="meta">{fmt(n.updatedAt)}</span>
              </div>
              <p className="note-body">{n.content}</p>
              <div className="row">
                <Button variant="secondary" onClick={() => setEditing(n._id)}>Edit</Button>
                <Button variant="ghost" onClick={() => setToDelete(n)}>Delete</Button>
              </div>
            </article>
          )
        )}
      </div>
      <Pagination pagination={pagination} onChange={setPage} />
      <ConfirmDialog open={!!toDelete} title="Delete note" busy={deleting}
        message={toDelete ? `Delete "${toDelete.title}"? This cannot be undone.` : ''}
        onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </>
  );
}
