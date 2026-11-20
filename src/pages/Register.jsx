import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Button, Input } from '../components/ui/index.js';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', interests: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (form.password.length < 8 || form.password.length > 72) errs.password = 'Password must be 8 to 72 characters.';
    setErrors(errs); setError('');
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      const interests = form.interests.split(',').map((s) => s.trim()).filter(Boolean);
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, interests });
    } catch (err) {
      if (err.code === 'EMAIL_TAKEN') setErrors({ email: err.message }); else setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <form className="card auth-card" onSubmit={onSubmit} noValidate>
        <h1>Create account</h1>
        {error && <p className="notice notice-error" role="alert">{error}</p>}
        <Input label="Name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
        <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Input label="Password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="8 to 72 characters." />
        <Input label="Interests (optional)" value={form.interests} onChange={set('interests')} hint="Comma separated, e.g. chess, reading" />
        <Button type="submit" loading={busy}>Create account</Button>
        <p className="muted">Already registered? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
