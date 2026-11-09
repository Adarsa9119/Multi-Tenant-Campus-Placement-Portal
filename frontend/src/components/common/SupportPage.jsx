import ResourcePage from './ResourcePage.jsx';
import { supportApi } from '../../api/supportApi.js';

// Shared by every role: raise tickets and see own tickets. `manage` lets TPO / Super Admin answer tickets.
export default function SupportPage({ manage = false, escalate = false, subtitle }) {
  const actions = manage ? [
    { label: 'In Progress', variant: 'light', show: (r) => r.status === 'OPEN', run: (r) => supportApi.update(r._id, { status: 'IN_PROGRESS' }), success: 'Ticket updated' },
    { label: 'Resolve', ask: 'Response to the requester', show: (r) => !['RESOLVED', 'CLOSED'].includes(r.status), run: (r, t) => supportApi.update(r._id, { status: 'RESOLVED', response: t }), success: 'Ticket resolved' },
    ...(escalate ? [{ label: 'Escalate', variant: 'danger', ask: 'Reason for escalation', show: (r) => r.scope === 'TENANT' && r.status !== 'RESOLVED', run: (r, t) => supportApi.update(r._id, { escalate: true, response: t }), success: 'Escalated to Super Admin' }] : []),
  ] : [];
  return (
    <ResourcePage
      title="Support & Help" subtitle={subtitle || 'Raise a ticket and track its status'}
      load={(p) => supportApi.list(p)}
      filters={[{ name: 'status', label: 'All statuses', options: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] }]}
      columns={[{ key: 'ticketNo', label: 'Ticket' }, { key: 'subject', label: 'Subject' }, { key: 'createdBy.name', label: 'Raised By' }, { key: 'createdByRole', label: 'Role' }, { key: 'status', label: 'Status', badge: true }, { key: 'response', label: 'Response' }, { key: 'createdAt', label: 'Created', type: 'date' }]}
      rowActions={actions}
      headerActions={[{ label: '+ New Ticket', title: 'Raise a support ticket', success: 'Ticket raised', submit: (v) => supportApi.create(v),
        fields: [{ name: 'subject', label: 'Subject', required: true, full: true }, { name: 'issue', label: 'Describe the issue', type: 'textarea', rows: 5, required: true, full: true }] }]}
    />
  );
}
