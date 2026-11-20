import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import { AdminRoute, GuestRoute, ProtectedRoute } from './auth/guards.jsx';
import { ToastProvider } from './components/ui/index.js';
import { Layout } from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MyNotes from './pages/MyNotes.jsx';
import Profile from './pages/Profile.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminNotes from './pages/AdminNotes.jsx';
import Interests from './pages/Interests.jsx';
import UserPosts from './pages/UserPosts.jsx';
import { Forbidden, NotFound } from './pages/Forbidden.jsx';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<Layout />}>
            <Route index element={<Navigate to="/notes" replace />} />

            {/* Signed-in users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/notes" element={<MyNotes />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin only */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/notes" element={<AdminNotes />} />
              <Route path="/admin/interests" element={<Interests />} />
            </Route>

            {/* Public */}
            <Route path="/users/:id/posts" element={<UserPosts />} />
            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
