import { useEffect } from 'react';

export default function Toast({ message, onDone }) {
  useEffect(() => { if (!message) return undefined; const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [message, onDone]);
  return message ? <div className="toast">{message}</div> : null;
}
