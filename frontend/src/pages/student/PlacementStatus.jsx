import useApi from '../../hooks/useApi.js';
import { studentApi } from '../../api/studentApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Panel from '../../components/cards/Panel.jsx';
import { fmtDate } from '../../utils/formatters.js';

export default function PlacementStatus() {
  const { data: s, loading, error } = useApi(studentApi.placementStatus, []);
  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;
  const placed = s.placementStatus === 'PLACED';
  return (
    <div>
      <PageHeader title="Placement Status" subtitle="Your overall placement outcome" />
      <div className="stats"><StatCard label="Placement" value={placed ? 'Placed 🎉' : 'Not placed yet'} tone={placed ? 'green' : 'amber'} /><StatCard label="Applications" value={s.applications} tone="blue" /></div>
      {placed && s.offer && <Panel title="Accepted offer" flush={false}><dl className="kv"><dt>Company</dt><dd>{s.offer.companyId?.name}</dd><dt>Role</dt><dd>{s.offer.role}</dd><dt>Package</dt><dd>{s.offer.package} LPA</dd><dt>Joining date</dt><dd>{fmtDate(s.offer.joiningDate)}</dd></dl></Panel>}
      {!placed && <Alert type="info">Keep applying to eligible drives. Offers appear under Offers.</Alert>}
    </div>
  );
}
