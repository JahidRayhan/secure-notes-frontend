import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Button, Input } from '../components/ui/index.js';

export default function Login() {
  const { login, sessionExpired } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try { await login(form.email.trim(), form.password); } // GuestRoute redirects on success
    catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <div className="auth">
      <form className="card auth-card" onSubmit={onSubmit} noValidate>
        <h1>Sign in</h1>
        {sessionExpired && <p className="notice" role="status">Your session ended. Please sign in again.</p>}
        {error && <p className="notice notice-error" role="alert">{error}</p>}
        <Input label="Email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
        <Input label="Password" type="password" autoComplete="current-password" required value={form.password} onChange={set('password')} />
        <Button type="submit" loading={busy}>Sign in</Button>
        <p className="muted">No account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}
