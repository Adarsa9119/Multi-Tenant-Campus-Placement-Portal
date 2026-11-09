import { useEffect, useState } from 'react';
import ResourcePage from '../../components/common/ResourcePage.jsx';
import Alert from '../../components/common/Alert.jsx';
import { interviewApi } from '../../api/interviewApi.js';
import { applicationApi } from '../../api/applicationApi.js';
import { errorMessage } from '../../api/axiosClient.js';

// Shared by TPO and Recruiter pages (fixedStage limits to tests or interviews).
export default function Interviews({ fixedStage, title = 'Interview Schedule', subtitle = 'Tests and interviews for your college' }) {
  const [apps, setApps] = useState([]);
  const [tick, setTick] = useState(0);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    applicationApi.list({ statuses: 'SHORTLISTED,TEST,INTERVIEW', limit: 100 })
      .then((r) => { setApps(r.data); setLoadError(''); })
      .catch((e) => setLoadError(errorMessage(e)));
  }, [tick]);
  return (
    <ResourcePage
      title={title} subtitle={subtitle} before={loadError && <Alert>Unable to load shortlisted candidates: {loadError}</Alert>} baseParams={fixedStage ? { stage: fixedStage } : {}} refreshKey={tick}
      load={(p) => interviewApi.list(p)} filters={fixedStage ? [] : [{ name: 'stage', label: 'All stages', options: ['TEST', 'INTERVIEW'] }]}
      columns={[{ key: 'scheduledAt', label: 'Date & Time', type: 'datetime' }, { key: 'candidate', label: 'Candidate' }, { key: 'company', label: 'Company' }, { key: 'drive', label: 'Role' }, { key: 'stage', label: 'Stage', badge: true }, { key: 'mode', label: 'Mode' }, { key: 'location', label: 'Location' }, { key: 'result', label: 'Result', badge: true }]}
      rowActions={[
        { label: 'Passed', variant: 'success', show: (r) => r.result === 'PENDING', run: (r) => interviewApi.result(r._id, 'PASSED'), success: 'Result recorded' },
        { label: 'Failed', variant: 'danger', show: (r) => r.result === 'PENDING', confirm: 'Recording a failed result rejects the application.', run: (r) => interviewApi.result(r._id, 'FAILED'), success: 'Result recorded; application rejected' },
      ]}
      headerActions={[{ label: '+ Schedule', title: 'Schedule test / interview', success: 'Scheduled and candidate notified', submit: async (v) => { await interviewApi.schedule({ ...v, scheduledAt: new Date(v.scheduledAt).toISOString() }); setTick((t) => t + 1); },
        fields: [{ name: 'applicationId', label: 'Candidate (shortlisted)', type: 'select', required: true, full: true, options: apps.map((a) => ({ value: a._id, label: `${a.name} – ${a.drive} (${a.status})` })) },
          { name: 'stage', label: 'Stage', type: 'select', required: true, options: fixedStage ? [fixedStage] : ['TEST', 'INTERVIEW'], initial: fixedStage }, { name: 'scheduledAt', label: 'Date & time', type: 'datetime-local', required: true },
          { name: 'mode', label: 'Mode', type: 'select', options: ['ONLINE', 'ON_CAMPUS', 'VIRTUAL'] }, { name: 'location', label: 'Location / link' }, { name: 'notes', label: 'Notes', type: 'textarea', full: true }],
        initial: fixedStage ? { stage: fixedStage } : undefined }]}
    />
  );
}
