import { useState } from 'react';
import useApi from '../../hooks/useApi.js';
import { studentApi } from '../../api/studentApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import Panel from '../../components/cards/Panel.jsx';
import FileUpload from '../../components/files/FileUpload.jsx';
import ResumeViewer from '../../components/files/ResumeViewer.jsx';
import { fmtDateTime } from '../../utils/formatters.js';
import { fmtSize } from '../../utils/file.js';

export default function Resume() {
  const { data: meta, loading, reload } = useApi(studentApi.resumeMeta, []);
  const [msg, setMsg] = useState(''); const [v, setV] = useState(0);
  if (loading) return <Spinner />;
  return (
    <div>
      <PageHeader title="Resume" subtitle="Your resume is stored in protected storage and shared only with authorized recruiters for drives you applied to." />
      <Alert type="success">{msg}</Alert>
      <div className="grid-2e">
        <Panel title={meta.hasResume ? 'Replace resume' : 'Upload resume'} flush={false}>
          {meta.hasResume && <p>Current: <b>{meta.name}</b> ({fmtSize(meta.size)}) · uploaded {fmtDateTime(meta.uploadedAt)}</p>}
          <FileUpload label={meta.hasResume ? 'Replace resume' : 'Upload resume'} onUpload={async (f) => { await studentApi.uploadResume(f); setMsg('Resume uploaded securely.'); setV((x) => x + 1); await reload(); }} />
        </Panel>
        <Panel title="Preview" flush={false}>{meta.hasResume ? <ResumeViewer key={v} fetchBlob={studentApi.resumeBlob} filename={meta.name} /> : <p className="empty">No resume uploaded yet.</p>}</Panel>
      </div>
    </div>
  );
}
