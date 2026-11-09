import ResourcePage from '../../components/common/ResourcePage.jsx';
import { securityApi } from '../../api/securityApi.js';

export default function SecurityAlerts() {
  const set = (s) => (r) => securityApi.setStatus(r._id, s);
  return (
    <ResourcePage
      title="Security Alerts" subtitle="Rule-based alerts: failed logins, OTP abuse, resume download spikes, bulk student access, unauthorized and cross-tenant attempts."
      load={(p) => securityApi.list(p)}
      filters={[{ name: 'status', label: 'All statuses', options: ['OPEN', 'INVESTIGATING', 'RESOLVED'] }, { name: 'severity', label: 'All severities', options: ['HIGH', 'MEDIUM', 'LOW'] }]}
      columns={[{ key: 'createdAt', label: 'Time', type: 'datetime' }, { key: 'eventType', label: 'Alert', render: (r) => r.eventType.replace(/_/g, ' ') }, { key: 'actorId.name', label: 'Actor' }, { key: 'details.count', label: 'Count' }, { key: 'severity', label: 'Severity', badge: true }, { key: 'status', label: 'Status', badge: true }]}
      rowActions={[
        { label: 'Details', variant: 'light', detail: async (r) => ({ eventType: r.eventType, severity: r.severity, status: r.status, ...r.details }) },
        { label: 'Investigate', variant: 'light', show: (r) => r.status === 'OPEN', run: set('INVESTIGATING'), success: 'Marked investigating' },
        { label: 'Resolve', variant: 'success', show: (r) => r.status !== 'RESOLVED', run: set('RESOLVED'), success: 'Alert resolved' },
      ]}
    />
  );
}
