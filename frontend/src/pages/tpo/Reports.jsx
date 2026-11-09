import { useEffect, useState } from 'react';
import { reportApi } from '../../api/reportApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Alert from '../../components/common/Alert.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import { downloadBlob } from '../../utils/file.js';

const TABS = [['placement-summary', 'Placement Summary'], ['drive-wise', 'Drive-wise'], ['company-participation', 'Companies'], ['department-summary', 'Departments'], ['security-summary', 'Security & Audit']];
const csv = (r) => [r.columns.map((c) => c.label).join(','), ...r.rows.map((row) => r.columns.map((c) => `"${String(row[c.key] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');

export default function Reports() {
  const [tab, setTab] = useState(TABS[0][0]);
  const [data, setData] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { setData(null); setErr(''); reportApi.get(tab).then((r) => setData(r.data)).catch((e) => setErr(errorMessage(e))); }, [tab]);
  return (
    <div>
      <PageHeader title="Reports" subtitle="Placement, drive, company, department and security summaries">
        {data && <button className="btn btn-light" onClick={() => downloadBlob(new Blob([csv(data)], { type: 'text/csv' }), `${tab}.csv`)}>Export CSV</button>}
      </PageHeader>
      <div className="tabs">{TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
      <Alert>{err}</Alert>
      <section className="panel">{!data && !err ? <Spinner /> : data && <><div className="panel-head"><h3>{data.title}</h3></div><DataTable columns={data.columns} rows={data.rows} rowKey="_x" /></>}</section>
    </div>
  );
}
