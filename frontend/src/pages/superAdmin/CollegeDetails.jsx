import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useApi from '../../hooks/useApi.js';
import { adminApi } from '../../api/adminApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Panel from '../../components/cards/Panel.jsx';
import ConfirmModal from '../../components/modals/ConfirmModal.jsx';
import { fmtDateTime } from '../../utils/formatters.js';

const Row = ({ k, v }) => <><dt>{k}</dt><dd>{v || '—'}</dd></>;
export default function CollegeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: r, loading, error, reload } = useApi(() => adminApi.registration(id), [id]);
  const [modal, setModal] = useState(null); const [err, setErr] = useState('');
  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;
  const open = ['PENDING', 'UNDER_REVIEW'].includes(r.status);
  const run = async (action, notes) => { try { await adminApi.decideRegistration(id, action, notes); setModal(null); await reload(); if (action !== 'review') navigate('/admin/college-requests'); } catch (e) { setErr(errorMessage(e)); setModal(null); } };
  return (
    <div>
      <PageHeader title={r.collegeName} subtitle={`Submitted ${fmtDateTime(r.createdAt)}`}>
        <StatusBadge value={r.status} /><Link className="btn btn-light" to="/admin/college-requests">← Back</Link>
        {r.status === 'PENDING' && <button className="btn btn-light" onClick={() => run('review')}>Mark under review</button>}
        {open && <><button className="btn btn-success" onClick={() => setModal('approve')}>Approve</button><button className="btn btn-danger" onClick={() => setModal('reject')}>Reject</button></>}
      </PageHeader>
      <Alert>{err}</Alert>
      <div className="grid-2e">
        <Panel title="College details" flush={false}><dl className="kv"><Row k="College code" v={r.collegeCode} /><Row k="Affiliation" v={r.affiliation} /><Row k="Type" v={r.collegeType} /><Row k="Official email" v={`${r.officialEmail} ${r.emailVerified ? '(verified by OTP)' : ''}`} /><Row k="Website" v={r.website} /><Row k="Address" v={`${r.address}, ${r.city}, ${r.state} - ${r.pincode}`} /></dl></Panel>
        <Panel title="Contact & proposed TPO" flush={false}><dl className="kv"><Row k="Contact person" v={`${r.contact?.name} (${r.contact?.designation})`} /><Row k="Contact email" v={r.contact?.email} /><Row k="Contact phone" v={r.contact?.phone} /><Row k="Proposed TPO" v={r.proposedTpo?.name} /><Row k="TPO email" v={r.proposedTpo?.email} /><Row k="TPO phone" v={r.proposedTpo?.phone} /><Row k="Review notes" v={r.reviewNotes} /></dl></Panel>
      </div>
      {modal && <ConfirmModal title={modal === 'approve' ? 'Approve college' : 'Reject college'} message={modal === 'approve' ? 'A unique tenant will be created and the proposed TPO will be invited.' : 'The college will be notified by email.'} ask="Notes" danger={modal === 'reject'} confirmLabel={modal === 'approve' ? 'Approve' : 'Reject'} onClose={() => setModal(null)} onConfirm={(t) => run(modal, t)} />}
    </div>
  );
}
