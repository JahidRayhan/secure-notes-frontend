# Notes frontend

React + Vite + React Router + plain CSS. Run: `npm install && npm run dev`.
Dev server proxies `/api` to `http://localhost:4000` (override: `VITE_PROXY_TARGET`, or set `VITE_API_URL` for a direct base URL).

Import everything from `src/index.js`.

## API client
`api.get(path, query?)`, `api.post(path, body)`, `api.put(path, body)`, `api.del(path)`
- Item responses resolve to `data`. List responses resolve to `{ data, pagination }`.
- Failures throw `ApiError { message, code, status }`.
- 401 with UNAUTHENTICATED / TOKEN_EXPIRED / INVALID_TOKEN clears the token and sends the user to /login. INVALID_CREDENTIALS does not.

## Auth
`const { user, isAuthenticated, isAdmin, login, register, logout, updateProfile, loading } = useAuth()`
Guards (in `src/auth/guards.jsx`): `ProtectedRoute`, `AdminRoute` (non-admin -> /forbidden), `GuestRoute`.

## Data loading
`const { data, pagination, loading, error, reload } = useQuery(() => api.get('/notes', { page, limit: 10 }), [page])`

## Components
- `Button` variant: primary | secondary | danger | ghost; `loading`, `disabled`
- `Input` label, error, hint; `as="textarea"` supported; forwards ref
- `Modal` open, onClose, title, footer (focus trap, Esc, restores focus)
- `useToast()` -> `.success(msg) .error(msgOrError) .info(msg)`
- `Skeleton` lines | height/width
- `EmptyState` title, description, action, tone="error"
- `Pagination` pagination (from list response), onChange(page)

## Pages (all built)
`/notes` My notes (create, inline edit, delete with confirm dialog) · `/profile` · `/users/:id/posts` (public; create form on your own) ·
`/admin/users` (table, add/edit in a modal, delete) · `/admin/notes` (owner linked) · `/admin/interests` (grouped cards with a debounced, exact-match interest filter, a Clear button and an empty state).
Shared helpers: `useDebounce`, `ListState` (loading/error/empty), `ConfirmDialog`, `useClampPage` (steps back a page after deleting the last item).
Page layout CSS is in `src/pages.css`; the design system is in `src/styles.css`.

## Deploy (Vercel / Netlify)
- Build env var: `VITE_API_URL=https://<your-backend>.onrender.com/api` (must include `/api`). Without it the app calls `/api` on its own domain.
- SPA fallback is included (`vercel.json`, `public/_redirects`) so refreshing /notes does not 404.
- Add the deployed frontend origin to the backend's `CORS_ORIGINS`.

<- Reports Hub: run every report. Try the Stock Ledger ( pick a product ) , Customer Statement, Customer Due ( Ageing ) and Stock Valuation with an earlier As