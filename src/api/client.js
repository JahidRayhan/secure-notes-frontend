// API client: unwraps the contract envelopes and handles 401.
//   item  -> { data }                  resolves to data
//   list  -> { data, pagination }      resolves to { data, pagination }
//   error -> { error: { message, code } } throws ApiError
const BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'token';
const SESSION_ERRORS = ['UNAUTHENTICATED', 'TOKEN_EXPIRED', 'INVALID_TOKEN'];

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export const tokenStore = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ } },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } },
};

let onUnauthorized = () => {};
/** AuthProvider registers a callback here; called after the token is cleared on a session 401. */
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn || (() => {}); };

function buildUrl(path, query) {
  const qs = new URLSearchParams();
  Object.entries(query || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  const s = qs.toString();
  return `${BASE}${path}${s ? `?${s}` : ''}`;
}

async function request(method, path, { body, query, signal } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Network error. Check your connection and try again.', 'NETWORK_ERROR', 0);
  }

  let json = null;
  try { json = await res.json(); } catch { /* empty or non-JSON body */ }

  if (!res.ok) {
    const e = json?.error || {};
    const code = e.code || 'UNKNOWN_ERROR';
    // Only session errors log the user out. INVALID_CREDENTIALS (bad login) must not.
    if (res.status === 401 && SESSION_ERRORS.includes(code)) {
      tokenStore.clear();
      onUnauthorized(code);
    }
    throw new ApiError(e.message || `Request failed (${res.status})`, code, res.status);
  }

  if (json && json.pagination) return { data: json.data, pagination: json.pagination };
  return json ? json.data : null;
}

export const api = {
  get: (path, query, opts) => request('GET', path, { query, ...opts }),
  post: (path, body, opts) => request('POST', path, { body, ...opts }),
  put: (path, body, opts) => request('PUT', path, { body, ...opts }),
  del: (path, opts) => request('DELETE', path, opts),
};
