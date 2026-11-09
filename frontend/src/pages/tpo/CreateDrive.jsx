import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyApi } from '../../api/companyApi.js';
import { driveApi } from '../../api/driveApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Alert from '../../components/common/Alert.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import DynamicForm from '../../components/forms/DynamicForm.jsx';
import { BRANCHES } from '../../constants/statuses.js';

export default function CreateDrive() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState(null);
  const [auths, setAuths] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => {
    Promise.all([companyApi.list({ limit: 100 }), companyApi.recruiterAuths({ limit: 100 })])
      .then(([c, a]) => { setCompanies(c.data.filter((x) => x.collegeApproval === 'APPROVED')); setAuths(a.data.filter((x) => x.status === 'ACTIVE')); })
      .catch((e) => setErr(errorMessage(e)));
  }, []);
  if (!companies) return err ? <Alert>{err}</Alert> : <Spinner />;
  const recruiters = auths.filter((a) => String(a.companyId?._id) === companyId).map((a) => ({ value: a.recruiterId._id, label: `${a.recruiterId.userId?.name} (${a.recruiterId.userId?.email})` }));
  const fields = [
    { name: 'companyId', label: 'Company (approved for your college)', type: 'select', required: true, options: companies.map((c) => ({ value: c._id, label: c.name })), full: true },
    { name: 'title', label: 'Role / Job title', required: true }, { name: 'package', label: 'Package (LPA)', type: 'number', step: '0.1', required: true },
    { name: 'location', label: 'Location' }, { name: 'deadline', label: 'Application deadline', type: 'datetime-local', required: true },
    { name: 'minCgpa', label: 'Minimum CGPA', type: 'number', step: '0.1', min: 0, max: 10, required: true }, { name: 'maxBacklogs', label: 'Max active backlogs', type: 'number', min: 0 },
    { name: 'graduationYear', label: 'Graduation year', type: 'number' }, { name: 'branches', label: 'Eligible branches', type: 'multiselect', options: BRANCHES, required: true, full: true },
    { name: 'recruiterIds', label: companyId ? 'Assign recruiters (authorized for your college)' : 'Select a company first to see its recruiters', type: 'multiselect', options: recruiters, required: true, full: true },
    { name: 'description', label: 'Description', type: 'textarea', full: true },
  ];
  return (
    <div>
      <PageHeader title="Create Placement Drive" subtitle="Eligibility is evaluated deterministically: CGPA, branch, backlogs and graduation year." />
      <div className="card card-pad" style={{ maxWidth: 860 }}>
        {companies.length === 0 && <Alert type="warn">No company is approved for your college yet. Approve a verified company first.</Alert>}
        <Alert>{err}</Alert>
        <div className="field"><label>Company</label><select value={companyId} onChange={(e) => setCompanyId(e.target.value)}><option value="">Select company…</option>{companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
        <DynamicForm key={companyId} initial={{ companyId, maxBacklogs: 0, branches: [] }} fields={fields.filter((f) => f.name !== 'companyId')} submitLabel="Create draft drive" onCancel={() => navigate('/tpo/drives')}
          onSubmit={async (v) => {
            setErr('');
            if (!companyId) return setErr('Select a company');
            try {
              await driveApi.create({ companyId, title: v.title, description: v.description, package: v.package, location: v.location, deadline: new Date(v.deadline).toISOString(), recruiterIds: v.recruiterIds,
                criteria: { minCgpa: v.minCgpa, branches: v.branches, maxBacklogs: v.maxBacklogs || 0, graduationYear: v.graduationYear } });
              navigate('/tpo/drives');
            } catch (e) { setErr(errorMessage(e)); }
            return undefined;
          }} />
      </div>
    </div>
  );
}
