import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { Skeleton } from '../components/ui/index.js';

function Pending() {
  return <div className="container" role="status" aria-label="Loading"><Skeleton lines={3} /></div>;
}

/** Any signed-in user. Redirects to /login, remembering where they were going. */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Pending />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

/** Admin only. Non-admins get a 403 page; guests go to /login. */
export function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Pending />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin) return <Navigate to="/forbidden" replace />;
  return <Outlet />;
}

/** Login/register: signed-in users are sent on to the app. */
export function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Pending />;
  if (isAuthenticated) return <Navigate to={location.state?.from?.pathname || '/notes'} replace />;
  return <Outlet />;
}
