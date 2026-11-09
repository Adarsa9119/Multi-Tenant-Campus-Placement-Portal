const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Recruiter = require('../models/Recruiter');
const CollegeRegistration = require('../models/CollegeRegistration');
const CollegeCompanyApproval = require('../models/CollegeCompanyApproval');
const PlacementDrive = require('../models/PlacementDrive');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Offer = require('../models/Offer');
const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');
const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');
const ras = require('./recruiterAuthorizationService');
const appService = require('./applicationService');
const { AppError } = require('../utils/response');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function lastMonths(n = 6) {
  const out = [];
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - (n - 1));
  for (let i = 0; i < n; i += 1) { out.push({ y: d.getFullYear(), m: d.getMonth() + 1, label: MONTHS[d.getMonth()] }); d.setMonth(d.getMonth() + 1); }
  return out;
}
async function monthly(Model, match = {}, cond = null) {
  const months = lastMonths();
  const start = new Date(months[0].y, months[0].m - 1, 1);
  const inc = cond ? { $cond: [cond, 1, 0] } : 1;
  const agg = await Model.aggregate([{ $match: { ...match, createdAt: { $gte: start } } }, { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, n: { $sum: inc } } }]);
  return months.map((mo) => agg.find((a) => a._id.y === mo.y && a._id.m === mo.m)?.n || 0);
}
const labels = () => lastMonths().map((m) => m.label);
const count = (agg, k) => agg.find((a) => a._id === k)?.n || 0;
const byStatus = (Model, match) => Model.aggregate([{ $match: match }, { $group: { _id: '$status', n: { $sum: 1 } } }]);
const ge = (list) => ({ $in: ['$status', list] });
const SHORTLIST_UP = ['SHORTLISTED', 'TEST', 'INTERVIEW', 'SELECTED', 'OFFER', 'PLACED'];
const INTERVIEW_UP = ['INTERVIEW', 'SELECTED', 'OFFER', 'PLACED'];

async function adminDashboard(user) {
  const [pendingRegs, tenants, tpos, pendingCompanies, alerts, tickets, regs, tenantList, queue, audits, alertList, notes] = await Promise.all([
    CollegeRegistration.countDocuments({ status: { $in: ['PENDING', 'UNDER_REVIEW'] } }),
    Tenant.countDocuments({ status: 'ACTIVE' }),
    User.countDocuments({ role: 'TPO', status: 'ACTIVE' }),
    Company.countDocuments({ verificationStatus: { $in: ['PENDING', 'UNDER_REVIEW'] } }),
    SecurityAlert.countDocuments({ status: { $in: ['OPEN', 'INVESTIGATING'] } }),
    SupportTicket.countDocuments({ scope: 'PLATFORM', status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
    CollegeRegistration.find().sort({ createdAt: -1 }).limit(5).lean(),
    Tenant.find().sort({ createdAt: 1 }).limit(5).lean(),
    Company.find({ verificationStatus: { $in: ['PENDING', 'UNDER_REVIEW'] } }).sort({ createdAt: -1 }).limit(5).lean(),
    AuditLog.find().sort({ timestamp: -1 }).limit(5).populate('actorId', 'name').lean(),
    SecurityAlert.find().sort({ createdAt: -1 }).limit(5).lean(),
    Notification.find({ userId: user.id }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  const students = await Student.aggregate([{ $match: { tenantId: { $in: tenantList.map((t) => t._id) } } }, { $group: { _id: '$tenantId', n: { $sum: 1 } } }]);
  const tpoUsers = await User.find({ role: 'TPO', tenantId: { $in: tenantList.map((t) => t._id) } }).select('name tenantId').lean();
  const [mc, ms, mco, mr] = await Promise.all([monthly(Tenant), monthly(Student), monthly(Company), monthly(Recruiter)]);
  return {
    stats: [
      { label: 'Pending College Registrations', value: pendingRegs, tone: 'blue', link: 'View Requests', to: '/admin/college-requests' },
      { label: 'Active Tenants (Colleges)', value: tenants, tone: 'green', link: 'Manage Tenants', to: '/admin/tenants' },
      { label: 'Active TPOs', value: tpos, tone: 'purple', link: 'View TPOs', to: '/admin/tpos' },
      { label: 'Pending Company Verifications', value: pendingCompanies, tone: 'orange', link: 'Verify Companies', to: '/admin/companies' },
      { label: 'Security Alerts', value: alerts, tone: 'red', link: 'View Alerts', to: '/admin/security-alerts' },
      { label: 'Support Tickets', value: tickets, tone: 'teal', link: 'View Tickets', to: '/admin/support' },
    ],
    sections: [
      { title: 'College Registration Requests', to: '/admin/college-requests', columns: [{ key: 'name', label: 'College Name' }, { key: 'location', label: 'Location' }, { key: 'submitted', label: 'Submitted On', type: 'date' }, { key: 'status', label: 'Status', badge: true }, { key: 'id', label: 'Action', type: 'link', to: '/admin/college-requests/', text: 'Review' }],
        rows: regs.map((r) => ({ id: r._id, name: r.collegeName, location: `${r.city}, ${r.state}`, submitted: r.createdAt, status: r.status })) },
      { title: 'Active Tenants (Colleges)', to: '/admin/tenants', columns: [{ key: 'code', label: 'Tenant ID' }, { key: 'name', label: 'College Name' }, { key: 'tpo', label: 'TPO' }, { key: 'students', label: 'Students' }, { key: 'status', label: 'Status', badge: true }],
        rows: tenantList.map((t) => ({ id: t._id, code: t.tenantCode, name: t.collegeName, tpo: tpoUsers.find((u) => String(u.tenantId) === String(t._id))?.name, students: count(students, t._id) || students.find((s) => String(s._id) === String(t._id))?.n || 0, status: t.status })) },
      { title: 'Company Verification Queue', to: '/admin/companies', columns: [{ key: 'name', label: 'Company Name' }, { key: 'industry', label: 'Industry' }, { key: 'submitted', label: 'Submitted On', type: 'date' }, { key: 'status', label: 'Status', badge: true }],
        rows: queue.map((c) => ({ id: c._id, name: c.name, industry: c.industry, submitted: c.createdAt, status: c.verificationStatus })) },
      { title: 'Recent Audit Activity', to: '/admin/audit-logs', columns: [{ key: 'time', label: 'Time', type: 'datetime' }, { key: 'user', label: 'User' }, { key: 'action', label: 'Action' }],
        rows: audits.map((a) => ({ id: a._id, time: a.timestamp, user: a.actorId?.name || a.role || 'System', action: a.action })) },
      { title: 'Security Alerts', to: '/admin/security-alerts', columns: [{ key: 'time', label: 'Time', type: 'datetime' }, { key: 'alert', label: 'Alert' }, { key: 'severity', label: 'Severity', badge: true }, { key: 'status', label: 'Status', badge: true }],
        rows: alertList.map((a) => ({ id: a._id, time: a.createdAt, alert: a.eventType.replace(/_/g, ' '), severity: a.severity, status: a.status })) },
    ],
    chart: { title: 'Platform Statistics', labels: labels(), series: [{ name: 'Colleges', values: mc }, { name: 'Students', values: ms }, { name: 'Companies', values: mco }, { name: 'Recruiters', values: mr }] },
    notices: { title: 'Recent Notifications', items: notes.map((n) => ({ text: n.message, at: n.createdAt })) },
  };
}

async function tpoDashboard(user) {
  const t = user.tenantId;
  const [total, verified, activeDrives, apps, offers, interviews, pending, drives, upcoming, approvals, audits, notes, tickets, stat, tenant] = await Promise.all([
    Student.countDocuments({ tenantId: t }),
    Student.countDocuments({ tenantId: t, verificationStatus: 'VERIFIED' }),
    PlacementDrive.countDocuments({ tenantId: t, status: 'PUBLISHED' }),
    byStatus(Application, { tenantId: t }),
    Offer.countDocuments({ tenantId: t }),
    Interview.countDocuments({ tenantId: t }),
    Student.find({ tenantId: t, verificationStatus: { $in: ['PENDING', 'DOCUMENT_ISSUE'] } }).sort({ createdAt: -1 }).limit(5).lean(),
    PlacementDrive.find({ tenantId: t, status: { $in: ['PUBLISHED', 'APPROVED'] } }).sort({ deadline: 1 }).limit(5).populate('companyId', 'name').lean(),
    Interview.find({ tenantId: t, scheduledAt: { $gte: new Date() } }).sort({ scheduledAt: 1 }).limit(5).populate({ path: 'driveId', select: 'title companyId', populate: { path: 'companyId', select: 'name' } }).lean(),
    CollegeCompanyApproval.find({ tenantId: t }).sort({ updatedAt: -1 }).limit(5).populate('companyId', 'name').lean(),
    AuditLog.find({ tenantId: t }).sort({ timestamp: -1 }).limit(5).lean(),
    Notification.find({ userId: user.id }).sort({ createdAt: -1 }).limit(5).lean(),
    SupportTicket.find({ tenantId: t }).sort({ createdAt: -1 }).limit(5).populate('createdBy', 'name').lean(),
    Application.aggregate([{ $match: { tenantId: t } }, { $group: { _id: null, n: { $sum: 1 }, sl: { $sum: { $cond: [ge(SHORTLIST_UP), 1, 0] } } } }]),
    Tenant.findById(t).select('tenantCode collegeName').lean(),
  ]);
  const totalApps = apps.reduce((s, a) => s + a.n, 0);
  const placed = count(apps, 'PLACED');
  const shortlisted = stat[0]?.sl || 0;
  const [ma, msl, mi, mp] = await Promise.all([
    monthly(Application, { tenantId: t }), monthly(Application, { tenantId: t }, ge(SHORTLIST_UP)), monthly(Application, { tenantId: t }, ge(INTERVIEW_UP)), monthly(Application, { tenantId: t }, { $eq: ['$status', 'PLACED'] }),
  ]);
  return {
    meta: { tenant },
    stats: [
      { label: 'Total Students', value: total, tone: 'blue', link: 'View All', to: '/tpo/students' },
      { label: 'Verified Students', value: verified, hint: total ? `${Math.round((verified / total) * 100)}%` : '0%', tone: 'green', link: 'View All', to: '/tpo/students' },
      { label: 'Active Drives', value: activeDrives, tone: 'orange', link: 'Manage', to: '/tpo/drives' },
      { label: 'Total Applications', value: totalApps, tone: 'purple', link: 'View All', to: '/tpo/applications' },
      { label: 'Shortlisted', value: shortlisted, tone: 'blue', link: 'View All', to: '/tpo/shortlists' },
      { label: 'Interviews', value: interviews, tone: 'red', link: 'View All', to: '/tpo/interviews' },
      { label: 'Offers / Placed', value: `${offers} / ${placed}`, tone: 'green', link: 'View All', to: '/tpo/offers' },
    ],
    sections: [
      { title: 'Student Verification Queue', to: '/tpo/verification', columns: [{ key: 'name', label: 'Student Name' }, { key: 'branch', label: 'Branch' }, { key: 'year', label: 'Year' }, { key: 'cgpa', label: 'CGPA' }, { key: 'status', label: 'Status', badge: true }],
        rows: pending.map((s) => ({ id: s._id, name: s.name, branch: s.branch, year: s.graduationYear, cgpa: s.cgpa, status: s.verificationStatus })) },
      { title: 'Active Placement Drives', to: '/tpo/drives', columns: [{ key: 'company', label: 'Company' }, { key: 'role', label: 'Role' }, { key: 'eligible', label: 'Eligible' }, { key: 'deadline', label: 'Deadline', type: 'date' }, { key: 'status', label: 'Status', badge: true }],
        rows: drives.map((d) => ({ id: d._id, company: d.companyId?.name, role: d.title, eligible: `${d.criteria.branches.join(', ') || 'All'} · CGPA ≥ ${d.criteria.minCgpa}`, deadline: d.deadline, status: d.status })) },
      { title: 'Upcoming Interviews', to: '/tpo/interviews', columns: [{ key: 'when', label: 'Date & Time', type: 'datetime' }, { key: 'company', label: 'Company' }, { key: 'role', label: 'Role' }, { key: 'mode', label: 'Mode' }],
        rows: upcoming.map((i) => ({ id: i._id, when: i.scheduledAt, company: i.driveId?.companyId?.name, role: i.driveId?.title, mode: i.mode })) },
      { title: 'Company & Recruiter Status', to: '/tpo/companies', columns: [{ key: 'name', label: 'Company' }, { key: 'status', label: 'College Approval', badge: true }],
        rows: approvals.map((a) => ({ id: a._id, name: a.companyId?.name, status: a.status })) },
      { title: 'Support Tickets', to: '/tpo/support', columns: [{ key: 'subject', label: 'Subject' }, { key: 'by', label: 'Raised By' }, { key: 'status', label: 'Status', badge: true }, { key: 'created', label: 'Created', type: 'date' }],
        rows: tickets.map((t) => ({ id: t._id, subject: t.subject, by: t.createdByRole, status: t.status, created: t.createdAt })) },
      { title: 'Recent Activity (Audit Log)', to: '/tpo/audit', columns: [{ key: 'time', label: 'Time', type: 'datetime' }, { key: 'action', label: 'Action' }, { key: 'resource', label: 'Resource' }],
        rows: audits.map((a) => ({ id: a._id, time: a.timestamp, action: a.action, resource: a.resourceType })) },
    ],
    pipeline: [
      { label: 'Total Applications', value: totalApps }, { label: 'Under Review', value: count(apps, 'UNDER_REVIEW') + count(apps, 'APPLIED') },
      { label: 'Shortlisted', value: shortlisted }, { label: 'Interview Scheduled', value: count(apps, 'TEST') + count(apps, 'INTERVIEW') },
      { label: 'Selected', value: count(apps, 'SELECTED') + count(apps, 'OFFER') + placed }, { label: 'Offers Made', value: offers },
    ],
    chart: { title: 'Placement Statistics', labels: labels(), series: [{ name: 'Applications', values: ma }, { name: 'Shortlisted', values: msl }, { name: 'Interviewed', values: mi }, { name: 'Placed', values: mp }] },
    notices: { title: 'Recent Notifications', items: notes.map((n) => ({ text: n.message, at: n.createdAt })) },
  };
}

async function recruiterDashboard(user, ctx) {
  const recruiter = await Recruiter.findOne({ userId: user.id }).lean();
  if (!recruiter) throw new AppError(404, 'Recruiter profile not found');
  const company = await Company.findById(recruiter.companyId).lean();
  if (recruiter.authorizationStatus !== 'AUTHORIZED' || recruiter.status !== 'ACTIVE' || company.verificationStatus !== 'VERIFIED' || company.status !== 'ACTIVE') {
    return {
      restricted: true,
      message: 'Recruitment access is not active yet. A verified company, an authorized recruiter and college authorization are all required.',
      checks: [
        { label: 'Company verified', ok: company.verificationStatus === 'VERIFIED' }, { label: 'Company active', ok: company.status === 'ACTIVE' },
        { label: 'Recruiter authorized by platform', ok: recruiter.authorizationStatus === 'AUTHORIZED' }, { label: 'Recruiter account active', ok: recruiter.status === 'ACTIVE' },
      ],
      stats: [], sections: [],
    };
  }
  const { tenantIds, driveIds } = await ras.accessibleDriveIds(user, ctx);
  const [apps, interviewsCount, offers, drives, recent, upcoming, tenants, activity, notes] = await Promise.all([
    byStatus(Application, { driveId: { $in: driveIds } }),
    Interview.countDocuments({ driveId: { $in: driveIds } }),
    Offer.countDocuments({ driveId: { $in: driveIds } }),
    PlacementDrive.find({ _id: { $in: driveIds } }).sort({ deadline: 1 }).limit(5).populate('tenantId', 'collegeName').lean(),
    Application.find({ driveId: { $in: driveIds } }).sort({ createdAt: -1 }).limit(5).populate('studentId', appService.RECRUITER_FIELDS).populate('driveId', 'title').lean(),
    Interview.find({ driveId: { $in: driveIds }, scheduledAt: { $gte: new Date() } }).sort({ scheduledAt: 1 }).limit(3).populate({ path: 'applicationId', select: 'studentId', populate: { path: 'studentId', select: 'name' } }).populate('driveId', 'title').lean(),
    Tenant.find({ _id: { $in: tenantIds } }).select('collegeName').lean(),
    AuditLog.find({ actorId: user.id }).sort({ timestamp: -1 }).limit(4).lean(),
    Notification.find({ userId: user.id }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  const total = apps.reduce((s, a) => s + a.n, 0);
  const n = (k) => count(apps, k);
  const shortlisted = n('SHORTLISTED') + n('TEST') + n('INTERVIEW') + n('SELECTED') + n('OFFER') + n('PLACED');
  return {
    meta: { company: { name: company.name, verified: true }, colleges: tenants.map((t) => t.collegeName) },
    stats: [
      { label: 'Authorized Drives', value: driveIds.length, hint: 'Only approved drives', tone: 'blue', to: '/recruiter/drives' },
      { label: 'Total Applications', value: total, hint: 'Across all drives', tone: 'green', to: '/recruiter/applications' },
      { label: 'Shortlisted', value: shortlisted, hint: 'In screening process', tone: 'purple', to: '/recruiter/shortlist' },
      { label: 'Interviews', value: interviewsCount, hint: 'Upcoming + Completed', tone: 'orange', to: '/recruiter/interviews' },
      { label: 'Offers', value: offers, hint: 'Released to candidates', tone: 'red', to: '/recruiter/offers' },
    ],
    sections: [
      { title: 'Authorized Drives', subtitle: '(Only drives you are authorized for)', to: '/recruiter/drives', columns: [{ key: 'title', label: 'Job Title' }, { key: 'package', label: 'Package (LPA)' }, { key: 'branches', label: 'Eligible Branches' }, { key: 'college', label: 'College' }, { key: 'deadline', label: 'Application Deadline', type: 'date' }, { key: 'status', label: 'Status', badge: true }, { key: 'id', label: 'Candidates', type: 'link', to: '/recruiter/applications?driveId=', text: 'Candidates' }],
        rows: drives.map((d) => ({ id: d._id, title: d.title, package: d.package, branches: d.criteria.branches.join(', ') || 'Any', college: d.tenantId?.collegeName, deadline: d.deadline, status: d.status })) },
      { title: 'Recent Candidates', subtitle: '(Drive-wise access only)', to: '/recruiter/applications', columns: [{ key: 'name', label: 'Name' }, { key: 'branch', label: 'Branch' }, { key: 'cgpa', label: 'CGPA' }, { key: 'year', label: 'Grad Year' }, { key: 'skills', label: 'Skills' }, { key: 'status', label: 'Application Status', badge: true }, { key: 'id', label: 'Resume', type: 'link', to: '/recruiter/candidates/', text: 'View Resume' }],
        rows: recent.map((a) => ({ id: a._id, name: a.studentId?.name, branch: a.studentId?.branch, cgpa: a.studentId?.cgpa, year: a.studentId?.graduationYear, skills: (a.studentId?.skills || []).slice(0, 3).join(', '), status: a.status })) },
      { title: 'Upcoming Interviews', to: '/recruiter/interviews', columns: [{ key: 'name', label: 'Candidate' }, { key: 'role', label: 'Role' }, { key: 'when', label: 'When', type: 'datetime' }, { key: 'mode', label: 'Mode' }],
        rows: upcoming.map((i) => ({ id: i._id, name: i.applicationId?.studentId?.name, role: i.driveId?.title, when: i.scheduledAt, mode: i.mode })) },
    ],
    pipeline: [{ label: 'Applied', value: total }, { label: 'Under Review', value: n('APPLIED') + n('UNDER_REVIEW') }, { label: 'Shortlisted', value: shortlisted }, { label: 'Test', value: n('TEST') }, { label: 'Interview', value: n('INTERVIEW') }, { label: 'Selected', value: n('SELECTED') + n('OFFER') + n('PLACED') }, { label: 'Offer', value: offers }],
    notices: { title: 'Recent Activity', items: activity.map((a) => ({ text: `${a.action.replace(/_/g, ' ').toLowerCase()} (${a.resourceType || 'system'})`, at: a.timestamp })) },
    info: ['You can see only candidates who applied to your authorized drives.', 'Resume access is limited to relevant candidates only.', 'You cannot view student data from other companies or unauthorized drives.', 'All actions are logged and auditable.', 'Student personal data is protected and only minimum required information is shown.'],
    extraNotices: { title: 'Notifications', items: notes.map((x) => ({ text: x.message, at: x.createdAt })) },
  };
}

async function companyOverview(user) {
  const me = await Recruiter.findOne({ userId: user.id }).lean();
  if (!me) throw new AppError(404, 'Recruiter profile not found');
  const cid = me.companyId;
  const [approvals, recruiters, drives, apps, company] = await Promise.all([
    CollegeCompanyApproval.find({ companyId: cid }).lean(), Recruiter.find({ companyId: cid }).lean(),
    PlacementDrive.find({ companyId: cid }).lean(), Application.countDocuments({ companyId: cid }), Company.findById(cid).lean(),
  ]);
  const step = company.verificationStatus === 'VERIFIED' ? 3 : company.verificationStatus === 'REJECTED' ? 3 : 2;
  return {
    stats: [
      { label: 'College Authorizations', value: approvals.filter((a) => a.status === 'APPROVED').length, hint: `of ${approvals.length} requested`, tone: 'green', to: '/recruiter/colleges' },
      { label: 'Active Recruiters', value: recruiters.filter((r) => r.status === 'ACTIVE').length, hint: `of ${recruiters.length} users`, tone: 'blue', to: '/recruiter/team' },
      { label: 'Active Drives', value: drives.filter((d) => d.status === 'PUBLISHED').length, hint: `${drives.filter((d) => d.status === 'APPROVED').length} upcoming`, tone: 'green', to: '/recruiter/drives' },
      { label: 'Total Applications', value: apps, hint: 'across all drives', tone: 'purple', to: '/recruiter/applications' },
    ],
    workflow: { current: step, status: company.verificationStatus, collegeAuthorized: approvals.some((a) => a.status === 'APPROVED') },
  };
}

// ---------- Reports ----------
const scope = (user) => { if (user.role === 'TPO') return { tenantId: user.tenantId }; if (user.role === 'SUPER_ADMIN') return {}; throw new AppError(403, 'Not allowed'); };

async function placementSummary(user) {
  const m = scope(user);
  const [students, placed, apps, offers] = await Promise.all([Student.countDocuments(m), Student.countDocuments({ ...m, placementStatus: 'PLACED' }), byStatus(Application, m), Offer.countDocuments(m)]);
  const rows = [{ metric: 'Total students', value: students }, { metric: 'Placed students', value: placed }, { metric: 'Placement %', value: students ? `${Math.round((placed / students) * 100)}%` : '0%' },
    ...['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'TEST', 'INTERVIEW', 'SELECTED', 'OFFER', 'PLACED', 'REJECTED'].map((s) => ({ metric: `Applications ${s.replace('_', ' ').toLowerCase()}`, value: count(apps, s) })), { metric: 'Offers released', value: offers }];
  return { title: 'Placement Status Summary', columns: [{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }], rows };
}
async function driveWise(user) {
  const m = scope(user);
  const drives = await PlacementDrive.find(m).populate('companyId', 'name').lean();
  const agg = await Application.aggregate([{ $match: m }, { $group: { _id: '$driveId', total: { $sum: 1 }, shortlisted: { $sum: { $cond: [ge(SHORTLIST_UP), 1, 0] } }, interviews: { $sum: { $cond: [ge(INTERVIEW_UP), 1, 0] } }, selected: { $sum: { $cond: [ge(['SELECTED', 'OFFER', 'PLACED']), 1, 0] } }, placed: { $sum: { $cond: [{ $eq: ['$status', 'PLACED'] }, 1, 0] } } } }]);
  return { title: 'Drive-wise Applications', columns: [{ key: 'drive', label: 'Drive' }, { key: 'company', label: 'Company' }, { key: 'status', label: 'Status', badge: true }, { key: 'total', label: 'Applications' }, { key: 'shortlisted', label: 'Shortlisted' }, { key: 'interviews', label: 'Interviews' }, { key: 'selected', label: 'Selected' }, { key: 'placed', label: 'Placed' }],
    rows: drives.map((d) => { const a = agg.find((x) => String(x._id) === String(d._id)) || {}; return { drive: d.title, company: d.companyId?.name, status: d.status, total: a.total || 0, shortlisted: a.shortlisted || 0, interviews: a.interviews || 0, selected: a.selected || 0, placed: a.placed || 0 }; }) };
}
async function companyParticipation(user) {
  const m = scope(user);
  const agg = await PlacementDrive.aggregate([{ $match: m }, { $group: { _id: '$companyId', drives: { $sum: 1 } } }]);
  const apps = await Application.aggregate([{ $match: m }, { $group: { _id: '$companyId', applications: { $sum: 1 } } }]);
  const offers = await Offer.aggregate([{ $match: m }, { $group: { _id: '$companyId', offers: { $sum: 1 } } }]);
  const companies = await Company.find({ _id: { $in: agg.map((a) => a._id) } }).select('name').lean();
  return { title: 'Company Participation', columns: [{ key: 'company', label: 'Company' }, { key: 'drives', label: 'Drives' }, { key: 'applications', label: 'Applications' }, { key: 'offers', label: 'Offers' }],
    rows: agg.map((a) => ({ company: companies.find((c) => String(c._id) === String(a._id))?.name, drives: a.drives, applications: apps.find((x) => String(x._id) === String(a._id))?.applications || 0, offers: offers.find((x) => String(x._id) === String(a._id))?.offers || 0 })) };
}
async function departmentSummary(user) {
  const m = scope(user);
  const agg = await Student.aggregate([{ $match: m }, { $group: { _id: '$branch', students: { $sum: 1 }, verified: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'VERIFIED'] }, 1, 0] } }, placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'PLACED'] }, 1, 0] } }, avgCgpa: { $avg: '$cgpa' } } }, { $sort: { _id: 1 } }]);
  return { title: 'Department / Branch Summary', columns: [{ key: 'branch', label: 'Branch' }, { key: 'students', label: 'Students' }, { key: 'verified', label: 'Verified' }, { key: 'placed', label: 'Placed' }, { key: 'avgCgpa', label: 'Avg CGPA' }],
    rows: agg.map((a) => ({ branch: a._id, students: a.students, verified: a.verified, placed: a.placed, avgCgpa: Math.round(a.avgCgpa * 100) / 100 })) };
}
async function securitySummary(user) {
  const m = user.role === 'TPO' ? { tenantId: user.tenantId } : {};
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const [alerts, audits] = await Promise.all([
    SecurityAlert.aggregate([{ $match: m }, { $group: { _id: { t: '$eventType', s: '$status' }, n: { $sum: 1 } } }]),
    AuditLog.aggregate([{ $match: { ...m, timestamp: { $gte: since } } }, { $group: { _id: '$action', n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 10 }]),
  ]);
  return { title: 'Security & Audit Summary (7 days)', columns: [{ key: 'item', label: 'Item' }, { key: 'detail', label: 'Detail' }, { key: 'count', label: 'Count' }],
    rows: [...alerts.map((a) => ({ item: 'Alert', detail: `${a._id.t.replace(/_/g, ' ')} (${a._id.s})`, count: a.n })), ...audits.map((a) => ({ item: 'Audit action', detail: a._id, count: a.n }))] };
}

module.exports = { adminDashboard, tpoDashboard, recruiterDashboard, companyOverview, placementSummary, driveWise, companyParticipation, departmentSummary, securitySummary };
