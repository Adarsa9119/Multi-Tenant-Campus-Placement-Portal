import { useState } from 'react';
import useApi from '../../hooks/useApi.js';
import { adminApi } from '../../api/adminApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Alert from '../../components/common/Alert.jsx';
import DynamicForm from '../../components/forms/DynamicForm.jsx';

export default function PlatformSettings() {
  const { data, loading, error } = useApi(adminApi.settings, []);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  if (loading) return <Spinner />;
  return (
    <div>
      <PageHeader title="Platform Settings" subtitle="Global switches managed by Super Admins (changes are audited)." />
      <Alert>{error || err}</Alert><Alert type="success">{msg}</Alert>
      <div className="card card-pad" style={{ maxWidth: 640 }}>
        <DynamicForm initial={data} submitLabel="Save settings" onSubmit={async (v) => { setErr(''); setMsg(''); try { await adminApi.saveSettings({ allowCollegeRegistration: !!v.allowCollegeRegistration, supportEmail: v.supportEmail, announcement: v.announcement || '' }); setMsg('Settings saved'); } catch (e) { setErr(errorMessage(e)); } }}
          fields={[{ name: 'allowCollegeRegistration', label: 'Allow new college registrations', type: 'checkbox', help: 'Allow new college registrations on the public form' }, { name: 'supportEmail', label: 'Support email', type: 'email', full: true }, { name: 'announcement', label: 'Platform announcement (shown on registration page)', type: 'textarea', full: true }]} />
      </div>
    </div>
  );
}
