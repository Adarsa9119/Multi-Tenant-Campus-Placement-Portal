import ResourcePage from '../../components/common/ResourcePage.jsx';
import { auditApi } from '../../api/auditApi.js';

export default function AuditLogs({ title = 'Audit Logs' }) {
  return (
    <ResourcePage
      title={title} subtitle="Every sensitive action is recorded with actor, role, tenant, resource and time."
      load={(p) => auditApi.list(p)} search filters={[{ name: 'role', label: 'All roles', options: ['SUPER_ADMIN', 'TPO', 'RECRUITER', 'STUDENT'] }]}
      columns={[{ key: 'timestamp', label: 'Time', type: 'datetime' }, { key: 'actorId.name', label: 'Actor', render: (r) => r.actorId?.name || r.metadata?.email || 'System' }, { key: 'role', label: 'Role' }, { key: 'action', label: 'Action' }, { key: 'resourceType', label: 'Resource' }, { key: 'ip', label: 'IP' },
        { key: 'metadata', label: 'Details', render: (r) => (r.metadata ? <code style={{ fontSize: 11 }}>{JSON.stringify(r.metadata).slice(0, 80)}</code> : '—') }]}
    />
  );
}
