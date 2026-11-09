import { useState } from 'react';
import Modal from './Modal.jsx';
import DynamicForm from '../forms/DynamicForm.jsx';
import Alert from '../common/Alert.jsx';
import { errorMessage } from '../../api/axiosClient.js';

export default function FormModal({ title, fields, initial, submitLabel = 'Save', onSubmit, onClose }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (values) => {
    setBusy(true); setError('');
    try { await onSubmit(values); } catch (e) { setError(errorMessage(e)); setBusy(false); }
  };
  return (
    <Modal title={title} onClose={onClose} large={fields.length > 6}>
      <Alert>{error}</Alert>
      <DynamicForm fields={fields} initial={initial} submitLabel={busy ? 'Saving…' : submitLabel} disabled={busy} onSubmit={submit} onCancel={onClose} />
    </Modal>
  );
}
