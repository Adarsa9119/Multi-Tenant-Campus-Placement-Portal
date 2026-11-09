import { useCallback, useEffect, useState } from 'react';
import { notificationApi } from '../api/notificationApi.js';
import { errorMessage } from '../api/axiosClient.js';

export default function useNotifications() {
  const [count, setCount] = useState(0);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    try { const r = await notificationApi.unread(); setCount(r.data.count); setError(''); }
    catch (e) { setError(errorMessage(e)); }
  }, []);
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 60000);
    return () => clearInterval(t);
  }, [refresh]);
  return { count, error, refresh };
}
