import { useState } from 'react';
import { studentApi } from '../../api/studentApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Alert from '../../components/common/Alert.jsx';
import FileUpload from '../../components/files/FileUpload.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import { downloadBlob } from '../../utils/file.js';

const TEMPLATE = 'name,email,phone,rollNo,branch,graduationYear,cgpa,backlogs\nAsha Rao,asha@college.edu.in,9876543210,CSE2027010,CSE,2027,8.2,0\n';
const validate = (f) => (!f ? 'Choose a CSV file' : !f.name.toLowerCase().endsWith('.csv') ? 'Only .csv files are accepted' : f.size > 2 * 1024 * 1024 ? 'File must be under 2 MB' : null);

export default function BulkStudentImport() {
  const [result, setResult] = useState(null);
  return (
    <div>
      <PageHeader title="Bulk Student Import" subtitle="Upload a CSV. Every student is created in your college and invited by email. Max 1000 rows.">
        <button className="btn btn-light" onClick={() => downloadBlob(new Blob([TEMPLATE], { type: 'text/csv' }), 'students-template.csv')}>Download template</button>
      </PageHeader>
      <div className="card card-pad" style={{ maxWidth: 760 }}>
        <p style={{ marginTop: 0 }}>Columns: <code>name, email, phone, rollNo, branch, graduationYear, cgpa, backlogs</code></p>
        <FileUpload accept=".csv,text/csv" label="Import students" validate={validate} hint="CSV with header row · max 2 MB" onUpload={async (f) => setResult((await studentApi.bulk(f)).data)} />
        {result && (
          <div style={{ marginTop: 16 }}>
            <Alert type={result.failed.length ? 'warn' : 'success'}>{result.created} student(s) created, {result.failed.length} failed.</Alert>
            {result.failed.length > 0 && <DataTable columns={[{ key: 'row', label: 'Row' }, { key: 'email', label: 'Email' }, { key: 'error', label: 'Error' }]} rows={result.failed} rowKey="row" />}
          </div>
        )}
      </div>
    </div>
  );
}
