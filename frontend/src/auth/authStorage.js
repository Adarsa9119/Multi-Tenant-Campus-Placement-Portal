// The token lives in sessionStorage (cleared when the tab closes). The server re-validates it on every request.
const KEY = 'cp_session';
export const authStorage = {
  get() { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; } },
  set(session) { sessionStorage.setItem(KEY, JSON.stringify(session)); },
  clear() { sessionStorage.removeItem(KEY); },
  token() { return this.get()?.token || null; },
};
