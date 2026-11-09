import { useState } from 'react';
import { studentApi } from '../../api/studentApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import useApi from '../../hooks/useApi.js';
import PageHeader from '../common/PageHeader.jsx';
import Alert from '../common/Alert.jsx';
import Spinner from '../common/Spinner.jsx';
import DynamicForm from './DynamicForm.jsx';
import Panel from '../cards/Panel.jsx';

// Generic editor for array fields on the student profile (skills / projects / certifications / internships).
export default function ProfileListEditor({ title, subtitle, field, itemFields, simple }) {
  const { data, loading, error, reload } = useApi(() => studentApi.profile(), []);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  if (loading) return <Spinner />;
  const list = data?.[field] || [];
  const save = async (next) => {
    setErr(''); setMsg('');
    try { await studentApi.updateProfile({ [field]: next }); setMsg('Saved'); await reload(); } catch (e) { setErr(errorMessage(e)); }
  };
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <Alert>{error || err}</Alert><Alert type="success">{msg}</Alert>
      <div className="grid-2e">
        <Panel title={`Your ${title.toLowerCase()}`} flush={false}>
          {!list.length && <p className="empty">Nothing added yet.</p>}
          {simple ? <div>{list.map((s) => <span key={s} className="chip">{s} <a href="#x" onClick={(e) => { e.preventDefault(); save(list.filter((x) => x !== s)); }}>×</a></span>)}</div>
            : <ul className="notice-list">{list.map((it, i) => (
              <li key={i}><div style={{ flex: 1 }}><b>{it[itemFields[0].name]}</b><small>{itemFields.slice(1).map((f) => it[f.name]).filter(Boolean).join(' · ')}</small></div>
                <button className="btn btn-danger btn-sm" onClick={() => save(list.filter((_, j) => j !== i))}>Remove</button></li>))}</ul>}
        </Panel>
        <Panel title="Add new" flush={false}>
          <DynamicForm key={list.length} fields={itemFields} submitLabel="Add" onSubmit={(v) => save([...list, simple ? v[itemFields[0].name] : v])} />
        </Panel>
      </div>
    </div>
  );
}
