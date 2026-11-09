import { useState } from 'react';
import useApi from '../../hooks/useApi.js';
import { companyApi } from '../../api/companyApi.js';
import { recruiterApi } from '../../api/recruiterApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Panel from '../../components/cards/Panel.jsx';
import DynamicForm from '../../components/forms/DynamicForm.jsx';
import Modal from '../../components/modals/Modal.jsx';
import useAuth from '../../hooks/useAuth.js';

const STEPS = ['Company Registration', 'Super Admin Review', 'Verified / Rejected', 'College / TPO Authorization', 'Eligible for Placement Drives'];
const MODEL = [['🛡️', 'Verified Company', 'Company identity and documents are reviewed by Super Admin before any access is allowed.'], ['👤', 'Authorized Recruiter', 'Only authorized recruiters (not every employee) can access the portal. Each recruiter is a separate user.'], ['🏛️', 'Authorized College/Drive', 'Company must be separately authorized by each college/TPO before participating in their placement drives.'], ['🔒', 'Least-Privilege Access', 'Recruiters can only view candidates from authorized drives and cannot access all student data.'], ['📄', 'Protected Resumes', 'Student resumes are accessible only for candidates who applied to your authorized drives.'], ['📝', 'Audit Logging', 'All actions (login, profile access, drive creation, resume view, shortlisting) are recorded.']];

export default function CompanyProfile() {
  const { refresh } = useAuth();
  const { data: c, loading, error, reload } = useApi(companyApi.me, []);
  const { data: ov } = useApi(recruiterApi.companyOverview, []);
  const [edit, setEdit] = useState(false); const [err, setErr] = useState('');
  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;
  const step = c.verificationStatus === 'VERIFIED' ? (ov?.workflow?.collegeAuthorized ? 5 : 4) : c.verificationStatus === 'REJECTED' ? 3 : 2;
  const fields = [{ name: 'name', label: 'Company name', required: true }, { name: 'registrationType', label: 'Registration type' }, { name: 'registrationNo', label: 'CIN / Registration No.' }, { name: 'industry', label: 'Industry' },
    { name: 'website', label: 'Official website' }, { name: 'officialEmail', label: 'Official email', type: 'email' }, { name: 'phone', label: 'Phone' }, { name: 'description', label: 'Description', type: 'textarea', full: true }];
  return (
    <div>
      <PageHeader title="Company Dashboard" subtitle="Manage your company profile, recruiters, authorizations and placement activities">
        {c.isCompanyAdmin && <button className="btn" onClick={() => setEdit(true)}>✎ Edit Profile</button>}
      </PageHeader>
      <Alert>{err}</Alert>
      {ov && <div className="stats">{ov.stats.map((s) => <StatCard key={s.label} {...s} />)}</div>}
      <div className="grid-2">
        <Panel title="Company Profile" flush={false}>
          <dl className="kv">
            <dt>Company Name</dt><dd>{c.name}</dd><dt>Registration Type</dt><dd>{c.registrationType || '—'}</dd><dt>CIN / Registration No.</dt><dd>{c.registrationNo || '—'}</dd><dt>Industry</dt><dd>{c.industry || '—'}</dd>
            <dt>Description</dt><dd>{c.description || '—'}</dd><dt>Website</dt><dd>{c.website || '—'}</dd><dt>Official Email</dt><dd>{c.officialEmail || '—'}</dd><dt>Phone</dt><dd>{c.phone || '—'}</dd>
            <dt>Business Address</dt><dd>{[c.address?.line, c.address?.city, c.address?.state, c.address?.country].filter(Boolean).join(', ') || '—'}</dd>
            <dt>Verification Status</dt><dd><StatusBadge value={c.verificationStatus} /> <StatusBadge value={c.status} /></dd><dt>Reviewed By</dt><dd>{c.verifiedBy?.name || '—'}</dd><dt>Review Notes</dt><dd>{c.reviewNotes || '—'}</dd>
            <dt>Your authorization</dt><dd><StatusBadge value={c.recruiterAuthorization} /></dd>
          </dl>
        </Panel>
        <div>
          <Panel title="Company Verification Workflow" flush={false}>
            <div className="steps">{STEPS.map((s, i) => <div key={s} className={`s ${i + 1 < step ? 'done' : i + 1 === step ? 'cur' : ''}`}><i>{i + 1}</i><b>{s}</b></div>)}</div>
          </Panel>
          <Panel title="Security & Access Model" flush={false}><div className="sec-model">{MODEL.map(([i, t, d]) => <div key={t}><span style={{ fontSize: 22 }}>{i}</span><div><b>{t}</b><span>{d}</span></div></div>)}</div></Panel>
        </div>
      </div>
      {edit && <Modal title="Edit company profile" onClose={() => setEdit(false)} large>
        <Alert type="info">Changing the company name or registration number of a verified company sends it back for review.</Alert>
        <DynamicForm fields={fields} initial={c} onCancel={() => setEdit(false)} onSubmit={async (v) => { try { await companyApi.updateMe(v); setEdit(false); await reload(); await refresh(); } catch (e) { setErr(errorMessage(e)); setEdit(false); } }} />
      </Modal>}
    </div>
  );
}
