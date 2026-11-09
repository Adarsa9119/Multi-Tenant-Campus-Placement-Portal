import { useState } from 'react';
import useApi from '../../hooks/useApi.js';
import { studentApi } from '../../api/studentApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import DynamicForm from '../../components/forms/DynamicForm.jsx';

export default function AcademicDetails() {
  const { data: p, loading, reload } = useApi(studentApi.profile, []);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  if (loading) return <Spinner />;
  return (
    <div>
      <PageHeader title="Academic Details" subtitle="CGPA and backlogs decide your eligibility. Any change is sent to your TPO for re-verification."><StatusBadge value={p.verificationStatus} /></PageHeader>
      {p.verificationStatus !== 'VERIFIED' && <Alert type="warn">Your academics are not verified yet. You cannot apply to drives until your TPO verifies them.</Alert>}
      {p.verificationNotes && <Alert type="info">TPO note: {p.verificationNotes}</Alert>}
      <Alert>{err}</Alert><Alert type="success">{msg}</Alert>
      <div className="card card-pad" style={{ maxWidth: 560 }}>
        <DynamicForm initial={{ cgpa: p.cgpa, backlogs: p.backlogs }} submitLabel="Submit for verification"
          fields={[{ name: 'cgpa', label: 'CGPA', type: 'number', step: '0.01', min: 0, max: 10, required: true }, { name: 'backlogs', label: 'Active backlogs', type: 'number', min: 0 }]}
          onSubmit={async (v) => { setErr(''); setMsg(''); try { await studentApi.updateProfile(v); setMsg('Saved. If values changed, your TPO will re-verify them.'); reload(); } catch (e) { setErr(errorMessage(e)); } }} />
      </div>
    </div>
  );
}
