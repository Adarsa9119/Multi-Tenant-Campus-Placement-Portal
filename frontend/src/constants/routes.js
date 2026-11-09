// Sidebar navigation per role (icon names resolved by components/common/Icon.jsx)
export const ADMIN_NAV = [
  { heading: 'Platform Management', items: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'home' },
    { to: '/admin/college-requests', label: 'College Registration Requests', icon: 'clipboard', badgeKey: 'regs' },
    { to: '/admin/tenants', label: 'All Tenants (Colleges)', icon: 'building' },
    { to: '/admin/tpos', label: 'TPO Management', icon: 'users' },
    { to: '/admin/admins', label: 'Platform Admins', icon: 'shield' },
    { to: '/admin/companies', label: 'Companies (Verification)', icon: 'briefcase' },
    { to: '/admin/recruiters', label: 'Recruiters & Access', icon: 'user' },
    { to: '/admin/students', label: 'Students (Overview)', icon: 'cap' },
  ] },
  { heading: 'Security & Governance', items: [
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: 'file' },
    { to: '/admin/security-alerts', label: 'Security Alerts', icon: 'alert' },
    { to: '/admin/support', label: 'Support Tickets', icon: 'help' },
    { to: '/admin/settings', label: 'Platform Settings', icon: 'gear' },
  ] },
];
export const TPO_NAV = [
  { heading: null, items: [{ to: '/tpo/dashboard', label: 'Dashboard', icon: 'home' }] },
  { heading: 'Students', items: [
    { to: '/tpo/students', label: 'All Students', icon: 'users' },
    { to: '/tpo/students/add', label: 'Add Student', icon: 'user' },
    { to: '/tpo/students/bulk', label: 'Bulk Import', icon: 'upload' },
    { to: '/tpo/verification', label: 'Pending Verification', icon: 'check' },
    { to: '/tpo/departments', label: 'Departments', icon: 'building' },
  ] },
  { heading: 'Placement Drives', items: [
    { to: '/tpo/drives/create', label: 'Create Drive', icon: 'plus' },
    { to: '/tpo/drives', label: 'All Drives', icon: 'briefcase' },
    { to: '/tpo/eligibility', label: 'Manage Eligibility', icon: 'filter' },
  ] },
  { heading: 'Companies', items: [
    { to: '/tpo/companies', label: 'Verified Companies', icon: 'building' },
    { to: '/tpo/company-approvals', label: 'College Approvals', icon: 'check' },
    { to: '/tpo/recruiters', label: 'Manage Recruiters', icon: 'users' },
    { to: '/tpo/recruiter-approvals', label: 'Recruiter Authorizations', icon: 'shield' },
  ] },
  { heading: 'Applications', items: [
    { to: '/tpo/applications', label: 'All Applications', icon: 'file' },
    { to: '/tpo/shortlists', label: 'Shortlisted', icon: 'star' },
    { to: '/tpo/interviews', label: 'Interview Schedule', icon: 'calendar' },
    { to: '/tpo/selections', label: 'Selections', icon: 'check' },
    { to: '/tpo/offers', label: 'Offers & Placements', icon: 'trophy' },
  ] },
  { heading: 'Insights', items: [
    { to: '/tpo/reports', label: 'Reports', icon: 'chart' },
    { to: '/tpo/notifications', label: 'Notifications', icon: 'bell', badgeKey: 'notifications' },
    { to: '/tpo/support', label: 'Support & Help', icon: 'help' },
  ] },
];
export const RECRUITER_NAV = [
  { heading: null, items: [
    { to: '/recruiter/dashboard', label: 'Dashboard', icon: 'home' },
    { to: '/recruiter/company', label: 'Company Profile', icon: 'building' },
    { to: '/recruiter/team', label: 'Recruiters & Users', icon: 'users', companyAdminOnly: true },
    { to: '/recruiter/colleges', label: 'College Authorizations', icon: 'shield', companyAdminOnly: true },
    { to: '/recruiter/drives', label: 'Authorized Drives', icon: 'briefcase' },
    { to: '/recruiter/applications', label: 'Applications', icon: 'file' },
    { to: '/recruiter/shortlist', label: 'Shortlist', icon: 'star' },
    { to: '/recruiter/tests', label: 'Tests', icon: 'clipboard' },
    { to: '/recruiter/interviews', label: 'Interviews', icon: 'calendar' },
    { to: '/recruiter/selections', label: 'Selections', icon: 'check' },
    { to: '/recruiter/offers', label: 'Offers', icon: 'mail' },
    { to: '/recruiter/notifications', label: 'Notifications', icon: 'bell', badgeKey: 'notifications' },
    { to: '/recruiter/support', label: 'Support', icon: 'help' },
  ] },
];
export const STUDENT_NAV = [
  { heading: null, items: [
    { to: '/student/dashboard', label: 'Dashboard', icon: 'home' },
    { to: '/student/profile', label: 'My Profile', icon: 'user' },
    { to: '/student/academics', label: 'Academics', icon: 'cap' },
    { to: '/student/resume', label: 'Resume', icon: 'file' },
    { to: '/student/skills', label: 'Skills', icon: 'gear' },
    { to: '/student/projects', label: 'Projects', icon: 'clipboard' },
    { to: '/student/certifications', label: 'Certifications', icon: 'star' },
    { to: '/student/drives', label: 'Placement Drives', icon: 'briefcase' },
    { to: '/student/eligibility', label: 'Eligibility', icon: 'filter' },
    { to: '/student/applications', label: 'My Applications', icon: 'file' },
    { to: '/student/interviews', label: 'Tests & Interviews', icon: 'calendar' },
    { to: '/student/offers', label: 'Offers', icon: 'trophy' },
    { to: '/student/placement-status', label: 'Placement Status', icon: 'check' },
    { to: '/student/notifications', label: 'Notifications', icon: 'bell', badgeKey: 'notifications' },
    { to: '/student/support', label: 'Support / Help', icon: 'help' },
  ] },
];
