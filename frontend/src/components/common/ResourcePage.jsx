import { useCallback, useEffect, useState } from 'react';
import PageHeader from './PageHeader.jsx';
import Alert from './Alert.jsx';
import Spinner from './Spinner.jsx';
import Pagination from './Pagination.jsx';
import Toast from './Toast.jsx';
import DataTable from '../tables/DataTable.jsx';
import Modal from '../modals/Modal.jsx';
import ConfirmModal from '../modals/ConfirmModal.jsx';
import FormModal from '../modals/FormModal.jsx';
import { errorMessage } from '../../api/axiosClient.js';
import { label as pretty, fmtDateTime } from '../../utils/formatters.js';

/**
 * Config-driven list page.
 *  load(params) -> {data, meta}; columns; filters:[{name,label,options,default}]; search
 *  rowActions:[{label, variant, show(row), run(row,text), ask, confirm, success, detail(row)->object}]
 *  headerActions:[{label, title, fields, initial, submit(values), success}]
 */
export default function ResourcePage({ title, subtitle, load, columns, filters = [], search = false, rowActions = [], headerActions = [], emptyText, extraHeader, before, refreshKey = 0, baseParams = {} }) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [values, setValues] = useState(() => Object.fromEntries(filters.map((f) => [f.name, f.default || ''])));
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);

  const params = JSON.stringify({ ...baseParams, ...values, search: q || undefined, page });
  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await load(JSON.parse(params));
      setRows(Array.isArray(res.data) ? res.data : []); setMeta(res.meta || null);
    } catch (e) { setError(errorMessage(e)); } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, refreshKey]);
  useEffect(() => { reload(); }, [reload]);

  const runAction = async (a, row, text) => {
    setBusy(true); setError('');
    try { await a.run(row, text); setToast(a.success || 'Done'); setModal(null); await reload(); } catch (e) { setError(errorMessage(e)); setModal(null); } finally { setBusy(false); }
  };
  const click = async (a, row) => {
    if (a.detail) { try { setModal({ type: 'detail', title: a.label, data: await a.detail(row) }); } catch (e) { setError(errorMessage(e)); } return; }
    if (a.ask || a.confirm) return setModal({ type: 'confirm', a, row });
    return runAction(a, row);
  };
  const submitHeader = (h) => async (vals) => { await h.submit(vals); setToast(h.success || 'Saved'); setModal(null); setPage(1); await reload(); };

  const actionCol = rowActions.length ? (row) => rowActions.filter((a) => !a.show || a.show(row)).map((a) => (
    <button key={a.label} className={`btn btn-sm ${a.variant === 'danger' ? 'btn-danger' : a.variant === 'light' ? 'btn-light' : a.variant === 'success' ? 'btn-success' : ''}`} onClick={() => click(a, row)}>{a.label}</button>
  )) : null;

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle}>
        {extraHeader}
        {headerActions.map((h) => <button key={h.label} className="btn" onClick={() => setModal({ type: 'form', h })}>{h.label}</button>)}
      </PageHeader>
      {before}
      <Alert>{error}</Alert>
      <section className="panel">
        {(filters.length > 0 || search) && (
          <div className="filters" style={{ paddingTop: 14 }}>
            {search && <input placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />}
            {filters.map((f) => (
              <select key={f.name} value={values[f.name]} onChange={(e) => { setValues((s) => ({ ...s, [f.name]: e.target.value })); setPage(1); }} aria-label={f.label}>
                <option value="">{f.label}</option>
                {f.options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{pretty(o)}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
            ))}
          </div>
        )}
        {loading ? <Spinner /> : <DataTable columns={columns} rows={rows} actions={actionCol} emptyText={emptyText} />}
        <div style={{ padding: '0 18px 12px' }}><Pagination meta={meta} onPage={setPage} /></div>
      </section>
      {modal?.type === 'confirm' && (
        <ConfirmModal title={modal.a.label} message={modal.a.confirm} ask={modal.a.ask} busy={busy} danger={modal.a.variant === 'danger'} confirmLabel={modal.a.label} onClose={() => setModal(null)} onConfirm={(t) => runAction(modal.a, modal.row, t)} />
      )}
      {modal?.type === 'form' && <FormModal title={modal.h.title || modal.h.label} fields={modal.h.fields} initial={modal.h.initial} onSubmit={submitHeader(modal.h)} onClose={() => setModal(null)} />}
      {modal?.type === 'detail' && (
        <Modal title={modal.title} onClose={() => setModal(null)} large>
          <dl className="kv">{Object.entries(modal.data).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => (
            <div key={k} style={{ display: 'contents' }}><dt>{pretty(k)}</dt><dd>{typeof v === 'object' ? (Array.isArray(v) ? v.map((x) => (typeof x === 'object' ? JSON.stringify(x) : x)).join(', ') : JSON.stringify(v)) : /At$|Date$/.test(k) ? fmtDateTime(v) : String(v)}</dd></div>
          ))}</dl>
        </Modal>
      )}
      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}
