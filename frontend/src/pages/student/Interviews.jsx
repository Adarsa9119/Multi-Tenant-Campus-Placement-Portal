import ResourcePage from '../../components/common/ResourcePage.jsx';
import { interviewApi } from '../../api/interviewApi.js';

export default function Interviews() {
  return (
    <ResourcePage
      title="Tests & Interviews" subtitle="Your scheduled tests and interviews"
      load={(p) => interviewApi.list(p)}
      columns={[{ key: 'scheduledAt', label: 'Date & Time', type: 'datetime' }, { key: 'company', label: 'Company' }, { key: 'drive', label: 'Role' }, { key: 'stage', label: 'Stage', badge: true }, { key: 'mode', label: 'Mode' }, { key: 'location', label: 'Location / Link' }, { key: 'result', label: 'Result', badge: true }]}
    />
  );
}
