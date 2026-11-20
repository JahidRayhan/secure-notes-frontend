import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Fetch helper with loading/error state.
 *   const { data, pagination, loading, error, reload } =
 *     useQuery(() => api.get('/notes', { page, limit: 10 }), [page]);
 * Handles both item results and list results ({ data, pagination }).
 */
export function useQuery(fn, deps = []) {
  const [state, setState] = useState({ data: null, pagination: null, loading: true, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fnRef.current()
      .then((res) => {
        if (cancelled) return;
        const isList = res && typeof res === 'object' && 'pagination' in res;
        setState({ data: isList ? res.data : res, pagination: isList ? res.pagination : null, loading: false, error: null });
      })
      .catch((error) => { if (!cancelled) setState((s) => ({ ...s, loading: false, error })); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
