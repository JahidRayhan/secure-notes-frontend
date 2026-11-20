import { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Button } from './ui/index.js';

export function Layout() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="brand" onClick={close}>Notes</Link>
          <button type="button" className="nav-toggle" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((o) => !o)}>
            {open ? 'Close' : 'Menu'}
          </button>
          <nav id="site-nav" className={`nav ${open ? 'nav-open' : ''}`} aria-label="Main">
            {isAuthenticated ? (
              <>
                <NavLink to="/notes" onClick={close}>My notes</NavLink>
                <NavLink to={`/users/${user._id}/posts`} onClick={close}>My posts</NavLink>
                {isAdmin && (
                  <>
                    <NavLink to="/admin/users" onClick={close}>Users</NavLink>
                    <NavLink to="/admin/notes" onClick={close}>All notes</NavLink>
                    <NavLink to="/admin/interests" onClick={close}>Interests</NavLink>
                  </>
                )}
                <NavLink to="/profile" onClick={close}>{user.name}</NavLink>
                <Button variant="ghost" onClick={() => { close(); logout(); navigate('/login'); }}>Sign out</Button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={close}>Sign in</NavLink>
                <NavLink to="/register" onClick={close}>Register</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main id="main" className="container" tabIndex={-1}><Outlet /></main>
    </>
  );
}
