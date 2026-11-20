import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, useAuth, useQuery, Button, Input, Modal, Pagination, useToast } from '../index.js';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { ListState } from '../components/ListState.jsx';
import { useClampPage } from '../hooks/useClampPage.js';
import { parseInterests } from '../utils.js';

function UserForm({ initial, isSelf, onSubmit, onBusy }) {
  const [f, setF] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    password: '',
    role: initial?.role || 'user',
    interests: (initial?.interests || []).join(', '),
  });
  const [errs, setErrs] = useState({});
  const [serverErr, setServerErr] = useState('');
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const v = {};
    if (!f.name.trim()) v.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) v.email = 'Enter a valid email';
    if (!initial && !f.password) v.password = 'Password is required';
    else if (f.password && (f.password.length < 8 || f.password.length > 72)) v.password = '8 to 72 characters';
    setErrs(v);
    if (Object.keys(v).length) return;
    const body = { name: f.name.trim(), email: f.email.trim(), interests: parseInterests(f.interests) };
    if (f.password) body.password = f.password;
    if (!isSelf) body.role = f.role;
    setServerErr('');
    onBusy(true);
    try {
      await onSubmit(body);
    } catch (err) {
      if (err.code === 'EMAIL_TAKEN') setErrs({ email: err.message }); else setServerErr(err.message);
    } finally {
      onBusy(false);
    }
  }

  return (
    <form id="user-form" onSubmit={submit} noValidate>
      <Input label="Name" value={f.name} onChange={set('name')} error={errs.name} autoComplete="off" />
      <Input label="Email" type="email" value={f.email} onChange={set('email')} error={errs.email} autoComplete="off" />
      <Input label={initial ? 'New password' : 'Password'} type="password" value={f.password} onChange={set('password')}
        error={errs.password} autoComplete="new-password" hint={initial ? 'Leave blank to keep the current password.' : '8 to 72 characters.'} />
      <Input as="select" label="Role" value={f.role} onChange={set('role')} disabled={isSelf}
        hint={isSelf ? 'You cannot change your own role.' : undefined}>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </Input>
      <Input label="Interests" value={f.interests} onChange={set('interests')} hint="Comma separated, e.g. chess, reading" />
      {serverErr && <p className="notice notice-error" role="alert">{serverErr}</p>}
    </form>
  );
}

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const { data, pagination, loading, error, reload } = useQuery(() => api.get('/admin/users', { page, limit: 10 }), [page]);
  const items = data || [];
  const [form, setForm] = useState(null); // null | 'new' | user object
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  useClampPage(loading, data, page, setPage);

  async function save(body) {
    if (form === 'new') await api.post('/admin/users', body);
    else await api.put('/admin/users/' + form._id, body);
    toast.success(form === 'new' ? 'User added' : 'User updated');
    setForm(null);
    reload();
  }
  async function confirmDelete() {
    setDeleting(true);
    try {
      await api.del('/admin/users/' + toDelete._id);
      toast.success('User deleted');
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
      <div className="page-head">
        <h1>Users</h1>
        <Button onClick={() => setForm('new')}>Add user</Button>
      </div>
      <ListState loading={loading} error={error} hasData={items.length > 0} onRetry={reload} emptyTitle="No users found" />
      {items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Interests</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={'badge ' + u.role}>{u.role}</span></td>
                  <td>{u.interests.join(', ')}</td>
                  <td>
                    <div className="row">
                      <Link to={`/users/${u._id}/posts`} state={{ name: u.name }}>Posts</Link>
                      <Button variant="secondary" onClick={() => setForm(u)} aria-label={`Edit ${u.name}`}>Edit</Button>
                      <Button variant="ghost" onClick={() => setToDelete(u)} disabled={u._id === me._id}
                        title={u._id === me._id ? 'You cannot delete yourself' : undefined} aria-label={`Delete ${u.name}`}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination pagination={pagination} onChange={setPage} />

      <Modal open={!!form} onClose={saving ? undefined : () => setForm(null)} title={form === 'new' ? 'Add user' : 'Edit user'}
        footer={<>
          <Button variant="secondary" onClick={() => setForm(null)} disabled={saving}>Cancel</Button>
          <Button type="submit" form="user-form" loading={saving}>Save</Button>
        </>}>
        {form && (
          <UserForm key={form === 'new' ? 'new' : form._id} initial={form === 'new' ? null : form}
            isSelf={form !== 'new' && form._id === me._id} onSubmit={save} onBusy={setSaving} />
        )}
      </Modal>
      <ConfirmDialog open={!!toDelete} title="Delete user" busy={deleting}
        message={toDelete ? `Delete ${toDelete.email}? Their notes and posts will be deleted too.` : ''}
        onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </>
  );
}
