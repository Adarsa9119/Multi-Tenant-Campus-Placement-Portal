import { useState } from 'react';
import Modal from './Modal.jsx';

// Confirmation with an optional free-text reason/notes field (ask = label for the field).
export default function ConfirmModal({ title, message, ask, busy, onConfirm, onClose, confirmLabel = 'Confirm', danger }) {
  const [text, setText] = useState('');
  return (
    <Modal title={title} onClose={onClose} footer={<>
      <button className="btn btn-light" onClick={onClose}>Cancel</button>
      <button className={`btn ${danger ? 'btn-danger' : ''}`} disabled={busy} onClick={() => onConfirm(text)}>{busy ? 'Working…' : confirmLabel}</button>
    </>}>
      {message && <p style={{ marginTop: 0 }}>{message}</p>}
      {ask && <div className="field"><label>{ask}</label><textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} maxLength={500} /></div>}
    </Modal>
  );
}
