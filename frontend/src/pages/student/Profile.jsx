import { useState } from 'react';
import useApi from '../../hooks/useApi.js';
import { studentApi } from '../../api/studentApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Panel from '../../components/cards/Panel.jsx';
import DynamicForm from '../../components/forms/DynamicForm.jsx';
import { isPhone } from '../../utils/validators.js';

export default function Profile() {
  const { data: p, loading, error, reload } = useApi(studentApi.profile, []);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  if (loading) return <Spinner />;
  return (
    <div>
      <PageHeader title="My Profile" subtitle="Your institution-provided identity is read-only. Contact your TPO to change name, email, roll number or branch." />
      <Alert>{error || err}</Alert><Alert type="success">{msg}</Alert>
      <div className="grid-2e">
        <Panel title="Identity (managed by your college)" flush={false}>
          <dl className="kv"><dt>Name</dt><dd>{p.name}</dd><dt>Email</dt><dd>{p.email}</dd><dt>Roll No</dt><dd>{p.rollNo}</dd><dt>Department</dt><dd>{p.departmentId?.name || p.branch}</dd><dt>Branch</dt><dd>{p.branch}</dd><dt>Graduation year</dt><dd>{p.graduationYear}</dd><dt>Verification</dt><dd><StatusBadge value={p.verificationStatus} /></dd><dt>Profile completion</dt><dd>{p.profileCompletion}%</dd></dl>
        </Panel>
        <Panel title="Contact & percentages" flush={false}>
          <DynamicForm initial={{ phone: p.phone, tenthPercent: p.tenthPercent, twelfthPercent: p.twelfthPercent }} submitLabel="Save"
            fields={[{ name: 'phone', label: 'Phone (10 digits)', validate: (v) => (isPhone(v) ? '' : 'Enter 10 digits') }, { name: 'tenthPercent', label: '10th percentage', type: 'number', step: '0.1', min: 0, max: 100 }, { name: 'twelfthPercent', label: '12th / Diploma percentage', type: 'number', step: '0.1', min: 0, max: 100 }]}
            onSubmit={async (v) => { setErr(''); setMsg(''); try { await studentApi.updateProfile(v); setMsg('Profile updated'); reload(); } catch (e) { setErr(errorMessage(e)); } }} />
        </Panel>
      </div>
    </div>
  );
}
