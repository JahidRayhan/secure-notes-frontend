import { useState } from 'react';
import { useAuth, Button, Input, useToast } from '../index.js';
import { parseInterests } from '../utils.js';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ name: user.name, interests: user.interests.join(', '), currentPassword: '', newPassword: '' });
  const [errs, setErrs] = useState({});
  const [serverErr, setServerErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const v = {};
    if (!f.name.trim()) v.name = 'Name is required';
    if (f.newPassword && (f.newPassword.length < 8 || f.newPassword.length > 72)) v.newPassword = '8 to 72 characters';
    if (f.newPassword && !f.currentPassword) v.currentPassword = 'Enter your current password to set a new one';
    setErrs(v);
    if (Object.keys(v).length) return;
    const body = { name: f.name.trim(), interests: parseInterests(f.interests) };
    if (f.newPassword) { body.currentPassword = f.currentPassword; body.newPassword = f.newPassword; }
    setBusy(true); setServerErr('');
    try {
      await updateProfile(body);
      setF((x) => ({ ...x, currentPassword: '', newPassword: '' }));
      toast.success('Profile updated');
    } catch (err) {
      setServerErr(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-head"><h1>Profile</h1></div>
      <form className="card profile-card" onSubmit={submit} noValidate>
        <p className="meta">{user.email} <span className={'badge ' + user.role}>{user.role}</span></p>
        <Input label="Name" value={f.name} onChange={set('name')} error={errs.name} />
        <Input label="Interests" value={f.interests} onChange={set('interests')} hint="Comma separated, e.g. chess, reading" />
        <Input label="Current password" type="password" autoComplete="current-password" value={f.currentPassword} onChange={set('currentPassword')} error={errs.currentPassword} />
        <Input label="New password" type="password" autoComplete="new-password" value={f.newPassword} onChange={set('newPassword')} error={errs.newPassword} hint="Leave both password fields blank to keep your password." />
        {serverErr && <p className="notice notice-error" role="alert">{serverErr}</p>}
        <Button type="submit" loading={busy}>Save profile</Button>
      </form>
    </>
  );
}
