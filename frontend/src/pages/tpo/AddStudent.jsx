import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/studentApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Alert from '../../components/common/Alert.jsx';
import DynamicForm from '../../components/forms/DynamicForm.jsx';
import { BRANCHES } from '../../constants/statuses.js';
import { isEmail, isPhone } from '../../utils/validators.js';

export default function AddStudent() {
  const navigate = useNavigate();
  const [err, setErr] = useState('');
  const fields = [
    { name: 'name', label: 'Full name', required: true }, { name: 'email', label: 'Institution email', type: 'email', required: true, validate: (v) => (isEmail(v) ? '' : 'Enter a valid email') },
    { name: 'phone', label: 'Phone (10 digits)', validate: (v) => (isPhone(v) ? '' : 'Enter 10 digits') }, { name: 'rollNo', label: 'Roll number', required: true },
    { name: 'branch', label: 'Branch', type: 'select', options: BRANCHES.filter((b) => b !== 'ALL'), required: true }, { name: 'graduationYear', label: 'Graduation year', type: 'number', required: true, min: 2000, max: 2100 },
    { name: 'cgpa', label: 'CGPA', type: 'number', step: '0.01', min: 0, max: 10, required: true }, { name: 'backlogs', label: 'Active backlogs', type: 'number', min: 0 },
    { name: 'tenthPercent', label: '10th percentage', type: 'number' }, { name: 'twelfthPercent', label: '12th / Diploma percentage', type: 'number' },
  ];
  return (
    <div>
      <PageHeader title="Add Student" subtitle="The student is created inside your college automatically and invited by email to activate the account." />
      <div className="card card-pad" style={{ maxWidth: 820 }}>
        <Alert>{err}</Alert>
        <DynamicForm fields={fields} submitLabel="Create & Invite" onCancel={() => navigate('/tpo/students')} onSubmit={async (v) => { setErr(''); try { await studentApi.create(v); navigate('/tpo/students'); } catch (e) { setErr(errorMessage(e)); } }} />
      </div>
    </div>
  );
}
