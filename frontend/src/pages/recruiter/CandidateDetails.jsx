import { Link, useParams } from 'react-router-dom';
import useApi from '../../hooks/useApi.js';
import { recruiterApi } from '../../api/recruiterApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Panel from '../../components/cards/Panel.jsx';
import { fmtDateTime } from '../../utils/formatters.js';
import { criteriaChips } from '../../utils/eligibility.js';

export default function CandidateDetails() {
  const { applicationId } = useParams();
  const { data: c, loading, error } = useApi(() => recruiterApi.candidate(applicationId), [applicationId]);
  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;
  return (
    <div>
      <PageHeader title={c.name} subtitle={`${c.branch} · CGPA ${c.cgpa} · Batch ${c.graduationYear}`}>
        <StatusBadge value={c.status} /><Link className="btn btn-light" to="/recruiter/applications">← Back</Link>
        {c.hasResume && <Link className="btn" to={`/recruiter/candidates/${applicationId}/resume`}>🔒 View Resume</Link>}
      </PageHeader>
      <Alert type="info">Only the minimum data required for recruitment is shown. Personal contact details are not shared.</Alert>
      <div className="grid-2e">
        <Panel title="Profile" flush={false}>
          <dl className="kv"><dt>Drive</dt><dd>{c.drive}</dd><dt>Company</dt><dd>{c.company}</dd><dt>Applied</dt><dd>{fmtDateTime(c.appliedAt)}</dd><dt>Skills</dt><dd>{c.skills?.join(', ') || '—'}</dd>
            <dt>Drive criteria</dt><dd>{criteriaChips(c.criteria).join(' · ')}</dd></dl>
          <h4>Projects</h4>{c.projects?.length ? <ul>{c.projects.map((p, i) => <li key={i}><b>{p.title}</b> {p.description}</li>)}</ul> : <p className="empty">None listed</p>}
          <h4>Certifications</h4>{c.certifications?.length ? <ul>{c.certifications.map((p, i) => <li key={i}>{p.name} {p.issuer && `– ${p.issuer}`} {p.year}</li>)}</ul> : <p className="empty">None listed</p>}
        </Panel>
        <Panel title="Application history" flush={false}>
          <ul className="timeline">{c.history?.map((h, i) => <li key={i}><b>{h.to?.replace('_', ' ')}</b><small style={{ display: 'block', color: 'var(--muted)' }}>{fmtDateTime(h.at)} {h.remarks && `· ${h.remarks}`}</small></li>)}</ul>
        </Panel>
      </div>
    </div>
  );
}
