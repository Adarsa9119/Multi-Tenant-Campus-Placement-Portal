import ResourcePage from '../../components/common/ResourcePage.jsx';
import { studentApi } from '../../api/studentApi.js';

export default function StudentVerification() {
  const v = (status) => (r, t) => studentApi.verify(r._id, { status, notes: t });
  return (
    <ResourcePage
      title="Student Verification" subtitle="Verify academic records before students can apply to drives"
      load={(p) => studentApi.list(p)} search
      filters={[{ name: 'verificationStatus', label: 'All', options: ['PENDING', 'DOCUMENT_ISSUE', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'], default: 'PENDING' }]}
      columns={[{ key: 'rollNo', label: 'Roll No' }, { key: 'name', label: 'Student Name' }, { key: 'branch', label: 'Branch' }, { key: 'graduationYear', label: 'Year' }, { key: 'cgpa', label: 'CGPA' }, { key: 'backlogs', label: 'Backlogs' }, { key: 'verificationStatus', label: 'Status', badge: true }]}
      rowActions={[
        { label: 'Verify', variant: 'success', show: (r) => r.verificationStatus !== 'VERIFIED', run: v('VERIFIED'), success: 'Student verified' },
        { label: 'Document issue', variant: 'light', show: (r) => r.verificationStatus !== 'VERIFIED', ask: 'What is wrong with the documents?', run: v('DOCUMENT_ISSUE'), success: 'Marked as document issue' },
        { label: 'Reject', variant: 'danger', show: (r) => r.verificationStatus !== 'REJECTED', ask: 'Reason', run: v('REJECTED'), success: 'Verification rejected' },
      ]}
    />
  );
}
