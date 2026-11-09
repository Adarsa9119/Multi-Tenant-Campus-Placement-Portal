import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../api/axiosClient.js';

export default function useApi(fn, deps = []) {
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try { const res = await fnRef.current(); setData(res.data); setMeta(res.meta || null); } catch (e) { setError(errorMessage(e)); } finally { setLoading(false); }
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, deps);
  return { data, meta, loading, error, reload, setData };
}
