import { useRef, useState } from 'react';
import Alert from '../common/Alert.jsx';
import { validateResumeFile, ALLOWED_EXT, MAX_MB } from '../../utils/file.js';

export default function FileUpload({ onUpload, accept = ALLOWED_EXT.join(','), label = 'Choose file', validate = validateResumeFile, hint }) {
  const ref = useRef();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pick = (f) => { setFile(f); setError(validate(f) || ''); };
  const go = async () => {
    const msg = validate(file);
    if (msg) return setError(msg);
    setBusy(true); setError('');
    try { await onUpload(file); setFile(null); if (ref.current) ref.current.value = ''; } catch (e) { setError(e?.response?.data?.message || e.message); } finally { setBusy(false); }
    return undefined;
  };
  return (
    <div className="upload-box">
      <input ref={ref} type="file" accept={accept} onChange={(e) => pick(e.target.files[0])} />
      <p className="help" style={{ color: 'var(--muted)' }}>{hint || `Allowed: ${ALLOWED_EXT.join(', ')} · max ${MAX_MB} MB`}</p>
      <Alert>{error}</Alert>
      <button className="btn" disabled={!file || busy} onClick={go}>{busy ? 'Uploading…' : label}</button>
    </div>
  );
}
