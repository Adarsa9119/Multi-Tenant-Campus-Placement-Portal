import ResourcePage from '../../components/common/ResourcePage.jsx';
import { offerApi } from '../../api/offerApi.js';

export default function Offers() {
  return (
    <ResourcePage
      title="Offers" subtitle="Accepting an offer marks you as placed. Declining closes that application."
      load={(p) => offerApi.list(p)}
      columns={[{ key: 'company', label: 'Company' }, { key: 'role', label: 'Role' }, { key: 'package', label: 'Package', type: 'money' }, { key: 'joiningDate', label: 'Joining', type: 'date' }, { key: 'status', label: 'Status', badge: true }]}
      rowActions={[
        { label: 'Accept', variant: 'success', show: (r) => r.status === 'OFFERED', confirm: 'Accept this offer? You will be marked as placed.', run: (r) => offerApi.respond(r._id, true), success: 'Offer accepted. Congratulations!' },
        { label: 'Decline', variant: 'danger', show: (r) => r.status === 'OFFERED', confirm: 'Decline this offer?', run: (r) => offerApi.respond(r._id, false), success: 'Offer declined' },
      ]}
      emptyText="No offers yet. Keep participating in placement drives."
    />
  );
}
