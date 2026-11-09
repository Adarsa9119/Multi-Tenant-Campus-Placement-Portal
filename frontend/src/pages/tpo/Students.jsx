import { Link } from 'react-router-dom';
import ResourcePage from '../../components/common/ResourcePage.jsx';
import { studentApi } from '../../api/studentApi.js';
import { BRANCHES } from '../../constants/statuses.js';

export default function Students() {
  return (
    <ResourcePage
      title="All Students" subtitle="Students of your college only (tenant isolated)"
      load={(p) => studentApi.list(p)} search
      filters={[{ name: 'verificationStatus', label: 'All verification', options: ['PENDING', 'VERIFIED', 'REJECTED', 'DOCUMENT_ISSUE', 'UNDER_REVIEW'] }, { name: 'branch', label: 'All branches', options: BRANCHES.filter((b) => b !== 'ALL') }]}
      columns={[{ key: 'rollNo', label: 'Roll No' }, { key: 'name', label: 'Name' }, { key: 'branch', label: 'Branch' }, { key: 'graduationYear', label: 'Year' }, { key: 'cgpa', label: 'CGPA' }, { key: 'backlogs', label: 'Backlogs' }, { key: 'verificationStatus', label: 'Verification', badge: true }, { key: 'placementStatus', label: 'Placement', badge: true }]}
      rowActions={[{ label: 'Details', variant: 'light', detail: async (r) => { const s = (await studentApi.get(r._id)).data; return { name: s.name, email: s.email, phone: s.phone, rollNo: s.rollNo, branch: s.branch, department: s.departmentId?.name, graduationYear: s.graduationYear, cgpa: s.cgpa, backlogs: s.backlogs, tenthPercent: s.tenthPercent, twelfthPercent: s.twelfthPercent, skills: s.skills, verificationStatus: s.verificationStatus, placementStatus: s.placementStatus }; } }]}
      extraHeader={<><Link className="btn btn-light" to="/tpo/students/bulk">Bulk Import</Link><Link className="btn" to="/tpo/students/add">+ Add Student</Link></>}
    />
  );
}
