export const fmtDate = (v) => (v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (v) => (v ? new Date(v).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
export const fmtMoney = (v) => (v || v === 0 ? `${v} LPA` : '—');
export const label = (s) => (s ? String(s).replace(/_/g, ' ').toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase()) : '—');
export const timeAgo = (v) => {
  const s = Math.floor((Date.now() - new Date(v).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
  return `${Math.floor(s / 86400)} days ago`;
};
export const getPath = (obj, path) => String(path).split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
export const maskEmail = (e = '') => e;
