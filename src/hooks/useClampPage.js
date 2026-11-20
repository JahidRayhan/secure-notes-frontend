import { useEffect } from 'react';

/** If a delete empties the last page, step back one page. */
export function useClampPage(loading, items, page, setPage) {
  useEffect(() => {
    if (!loading && items && items.length === 0 && page > 1) setPage(page - 1);
  }, [loading, items, page, setPage]);
}
