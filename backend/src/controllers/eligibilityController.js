const PlacementDrive = require('../models/PlacementDrive');
const Company = require('../models/Company');
const Student = require('../models/Student');
const eligibility = require('../services/eligibilityService');
const students = require('../services/studentService');
const drives = require('../services/driveService');
const { handle, AppError } = require('../utils/response');

module.exports = {
  // TPO: evaluate every student of the TPO's own tenant against a drive
  forDrive: handle(async (req) => {
    const drive = await PlacementDrive.findOne({ _id: req.params.driveId, tenantId: req.tenantId }).lean();
    if (!drive) throw new AppError(404, 'Drive not found');
    const list = await Student.find({ tenantId: req.tenantId, status: 'ACTIVE' }).select('name rollNo branch cgpa backlogs graduationYear verificationStatus').lean();
    const rows = list.map((s) => { const e = eligibility.evaluate(s, drive.criteria); return { ...s, eligible: e.eligible, reasons: e.failures.join('; ') }; });
    return { items: rows, meta: { page: 1, limit: rows.length, total: rows.length, pages: 1, eligible: rows.filter((r) => r.eligible).length } };
  }),
  // Student: eligibility for every published drive with reasons
  mine: handle(async (req) => {
    const s = await students.mine(req.user);
    const companies = await Company.find({ status: 'ACTIVE', verificationStatus: 'VERIFIED' }).distinct('_id');
    const all = await PlacementDrive.find({ tenantId: req.user.tenantId, status: 'PUBLISHED', companyId: { $in: companies } }).populate('companyId', 'name').lean();
    const items = all.map((d) => ({ _id: d._id, company: d.companyId?.name, title: d.title, deadline: d.deadline, ...eligibility.evaluate(s, d.criteria), criteria: eligibility.describe(d.criteria) }));
    return { items, meta: { page: 1, limit: items.length, total: items.length, pages: 1 } };
  }),
  mineForDrive: handle((req) => drives.getForStudent(req.user, req.params.driveId)),
};
