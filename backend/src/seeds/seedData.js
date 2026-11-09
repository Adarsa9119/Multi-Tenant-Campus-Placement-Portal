const day = 24 * 3600 * 1000;
const inDays = (n) => new Date(Date.now() + n * day);

module.exports = {
  tenants: [
    { key: 't1', collegeName: 'ABC Institute of Engineering & Technology', code: 'ABC01', affiliation: 'State Technical University', collegeType: 'Engineering', officialEmail: 'info@abc.edu.in', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', address: '1 College Road' },
    { key: 't2', collegeName: 'Greenfield Engineering College', code: 'GFC02', affiliation: 'National Technical University', collegeType: 'Engineering', officialEmail: 'info@greenfield.edu.in', city: 'Hyderabad', state: 'Telangana', pincode: '500001', address: '22 Green Avenue' },
  ],
  pendingRegistrations: [
    { collegeName: 'Rai University', city: 'Ahmedabad', state: 'Gujarat', officialEmail: 'info@rai.edu.in', tpo: 'Dr. Mehta', tpoEmail: 'tpo@rai.edu.in', status: 'PENDING' },
    { collegeName: 'Sahyadri Institute', city: 'Mangalore', state: 'Karnataka', officialEmail: 'info@sahyadri.edu.in', tpo: 'Prof. Rao', tpoEmail: 'tpo@sahyadri.edu.in', status: 'UNDER_REVIEW' },
  ],
  tpos: [
    { tenant: 't1', name: 'Rahul Kumar', email: 'tpo1@abc.edu.in' },
    { tenant: 't2', name: 'Prof. Kavya', email: 'tpo2@greenfield.edu.in' },
  ],
  departments: ['CSE', 'IT', 'ECE', 'ME'],
  // cgpa/backlogs vary on purpose to give eligible and ineligible cases
  students: [
    { tenant: 't1', name: 'Rahul Student', email: 'rahul.student@abc.edu.in', rollNo: 'CSE2027001', branch: 'CSE', cgpa: 8.4, backlogs: 0, verified: 'VERIFIED' },
    { tenant: 't1', name: 'Aadhya Sharma', email: 'aadhya@abc.edu.in', rollNo: 'CSE2027002', branch: 'CSE', cgpa: 9.1, backlogs: 0, verified: 'VERIFIED' },
    { tenant: 't1', name: 'Rohit Mehta', email: 'rohit@abc.edu.in', rollNo: 'ECE2027003', branch: 'ECE', cgpa: 7.8, backlogs: 0, verified: 'VERIFIED' },
    { tenant: 't1', name: 'Sneha Patel', email: 'sneha@abc.edu.in', rollNo: 'IT2027004', branch: 'IT', cgpa: 8.9, backlogs: 0, verified: 'PENDING' },
    { tenant: 't1', name: 'Vikas Singh', email: 'vikas@abc.edu.in', rollNo: 'ME2027005', branch: 'ME', cgpa: 7.2, backlogs: 1, verified: 'DOCUMENT_ISSUE' },
    { tenant: 't1', name: 'Karan Low', email: 'karan@abc.edu.in', rollNo: 'CSE2027006', branch: 'CSE', cgpa: 6.1, backlogs: 2, verified: 'VERIFIED' },
    { tenant: 't2', name: 'Priya Verma', email: 'priya.v@greenfield.edu.in', rollNo: 'IT2027101', branch: 'IT', cgpa: 8.2, backlogs: 0, verified: 'VERIFIED' },
    { tenant: 't2', name: 'Neha Gupta', email: 'neha@greenfield.edu.in', rollNo: 'CSE2027102', branch: 'CSE', cgpa: 8.9, backlogs: 0, verified: 'VERIFIED' },
    { tenant: 't2', name: 'Arjun Das', email: 'arjun@greenfield.edu.in', rollNo: 'ECE2027103', branch: 'ECE', cgpa: 7.0, backlogs: 0, verified: 'PENDING' },
  ],
  companies: [
    { key: 'abc', name: 'ABC Tech Solutions', industry: 'Information Technology', officialEmail: 'hr@abctech.com', verification: 'VERIFIED', status: 'ACTIVE' },
    { key: 'tcs', name: 'TCS', industry: 'IT Services', officialEmail: 'campus@tcs.example', verification: 'VERIFIED', status: 'ACTIVE' },
    { key: 'wipro', name: 'Wipro (pending)', industry: 'IT Services', officialEmail: 'campus@wipro.example', verification: 'PENDING', status: 'ACTIVE' },
    { key: 'fake', name: 'QuickHire Fake Co', industry: 'Unknown', officialEmail: 'hr@quickhire.example', verification: 'REJECTED', status: 'ACTIVE' },
    { key: 'globex', name: 'Globex Systems (suspended)', industry: 'Consulting', officialEmail: 'hr@globex.example', verification: 'VERIFIED', status: 'SUSPENDED' },
  ],
  recruiters: [
    { key: 'rahulm', company: 'abc', name: 'Rahul Mehta', email: 'rahul.mehta@abctech.com', admin: true, auth: 'AUTHORIZED', status: 'ACTIVE' },
    { key: 'priya', company: 'abc', name: 'Priya Sharma', email: 'priya@abctech.com', admin: false, auth: 'AUTHORIZED', status: 'ACTIVE' },
    { key: 'amit', company: 'abc', name: 'Amit Verma (suspended)', email: 'amit@abctech.com', admin: false, auth: 'AUTHORIZED', status: 'SUSPENDED' },
    { key: 'neha', company: 'abc', name: 'Neha Kapoor (unauthorized)', email: 'neha@abctech.com', admin: false, auth: 'PENDING', status: 'ACTIVE' },
    { key: 'anita', company: 'tcs', name: 'Anita Rao', email: 'anita@tcs.example', admin: true, auth: 'AUTHORIZED', status: 'ACTIVE' },
  ],
  approvals: [
    { tenant: 't1', company: 'abc', status: 'APPROVED' }, { tenant: 't1', company: 'tcs', status: 'APPROVED' },
    { tenant: 't2', company: 'abc', status: 'APPROVED' }, { tenant: 't1', company: 'globex', status: 'REQUESTED' },
  ],
  recruiterAuths: [
    { recruiter: 'rahulm', tenant: 't1' }, { recruiter: 'rahulm', tenant: 't2' }, { recruiter: 'priya', tenant: 't1' }, { recruiter: 'anita', tenant: 't1' },
  ],
  drives: [
    { key: 'd1', tenant: 't1', company: 'abc', recruiters: ['rahulm', 'priya'], title: 'Software Engineer', package: 8, location: 'Bengaluru', criteria: { minCgpa: 7.5, branches: ['CSE', 'IT'], maxBacklogs: 0, graduationYear: 2027 }, deadline: inDays(30), status: 'PUBLISHED' },
    { key: 'd2', tenant: 't1', company: 'tcs', recruiters: ['anita'], title: 'Systems Engineer', package: 7, location: 'Pune', criteria: { minCgpa: 6.0, branches: ['ALL'], maxBacklogs: 1, graduationYear: 2027 }, deadline: inDays(20), status: 'PUBLISHED' },
    { key: 'd3', tenant: 't1', company: 'abc', recruiters: ['rahulm'], title: 'Data Analyst (draft)', package: 6, location: 'Remote', criteria: { minCgpa: 7.0, branches: ['CSE', 'IT', 'ECE'], maxBacklogs: 0, graduationYear: 2027 }, deadline: inDays(40), status: 'DRAFT' },
    { key: 'd4', tenant: 't1', company: 'abc', recruiters: ['rahulm'], title: 'Cloud Support (closed)', package: 5.5, location: 'Bengaluru', criteria: { minCgpa: 6.5, branches: ['CSE'], maxBacklogs: 0, graduationYear: 2027 }, deadline: inDays(-5), status: 'CLOSED' },
    { key: 'd5', tenant: 't2', company: 'abc', recruiters: ['rahulm'], title: 'Business Analyst', package: 7, location: 'Hyderabad', criteria: { minCgpa: 7.0, branches: ['ALL'], maxBacklogs: 0, graduationYear: 2027 }, deadline: inDays(25), status: 'PUBLISHED' },
  ],
  // application statuses across the lifecycle
  applications: [
    { student: 'rahul.student@abc.edu.in', drive: 'd1', status: 'SHORTLISTED' },
    { student: 'aadhya@abc.edu.in', drive: 'd1', status: 'INTERVIEW' },
    { student: 'rohit@abc.edu.in', drive: 'd2', status: 'SELECTED' },
    { student: 'rahul.student@abc.edu.in', drive: 'd2', status: 'UNDER_REVIEW' },
    { student: 'aadhya@abc.edu.in', drive: 'd2', status: 'OFFER' },
    { student: 'priya.v@greenfield.edu.in', drive: 'd5', status: 'APPLIED' },
  ],
};
