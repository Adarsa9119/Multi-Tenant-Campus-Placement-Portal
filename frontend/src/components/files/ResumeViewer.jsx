import { useEffect, useState } from 'react';
import Alert from '../common/Alert.jsx';
import Spinner from '../common/Spinner.jsx';
import { downloadBlob } from '../../utils/file.js';

// Fetches the protected resume with the auth header and previews it from a short-lived blob URL (never a public URL).
export default function ResumeViewer({ fetchBlob, fetchDownload, filename = 'resume.pdf' }) {
  const [url, setUrl] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let revoked = '';
    fetchBlob().then((blob) => { revoked = URL.createObjectURL(blob); setUrl(revoked); setType(blob.type); }).catch((e) => {
      setError(e?.response?.status === 403 ? 'You are not authorized to view this resume.' : 'Resume not available.');
    }).finally(() => setLoading(false));
    return () => { if (revoked) URL.revokeObjectURL(revoked); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;
  return (
    <div>
      <div style={{ marginBottom: 10 }}><button className="btn btn-light btn-sm" onClick={async () => downloadBlob(await (fetchDownload || fetchBlob)(), filename)}>Download</button></div>
      {type.includes('pdf') ? <iframe title="Resume" src={url} style={{ width: '100%', height: '75vh', border: '1px solid var(--border)', borderRadius: 8 }} /> : <Alert type="info">Preview is available for PDF only. Use Download to open this file.</Alert>}
    </div>
  );
}
