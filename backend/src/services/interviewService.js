const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Student = require('../models/Student');
const ras = require('./recruiterAuthorizationService');
const appService = require('./applicationService');
const notify = require('./notificationService');
const audit = require('./auditService');
const { AppError } = require('../utils/response');
const { paginate } = require('../utils/pagination');
const { assertTransition } = require('../utils/statusTransition');

const ALLOWED_FROM = { TEST: ['SHORTLISTED', 'TEST'], INTERVIEW: ['SHORTLISTED', 'TEST', 'INTERVIEW'] };

async function schedule(user, b, ctx) {
  const app = await appService.loadForUser(user, b.applicationId, ctx);
  if (!ALLOWED_FROM[b.stage]) throw new AppError(400, 'Stage must be TEST or INTERVIEW');
  if (!ALLOWED_FROM[b.stage].includes(app.status)) throw new AppError(409, `Cannot schedule a ${b.stage.toLowerCase()} for an application in ${app.status} state`);
  if (app.status !== b.stage) await appService.transition(app, b.stage, user, 'Scheduled', ctx);
  const iv = await Interview.create({
    applicationId: app._id, tenantId: app.tenantId, driveId: app.driveId, stage: b.stage, scheduledAt: b.scheduledAt, mode: b.mode || 'ONLINE', location: b.location, notes: b.notes, createdBy: user.id,
  });
  const s = await Student.findById(app.studentId).select('userId').lean();
  await notify.notify(s.userId, { type: 'INTERVIEW', message: `A ${b.stage.toLowerCase()} has been scheduled for ${new Date(b.scheduledAt).toDateString()}`, link: '/student/interviews', tenantId: app.tenantId });
  await audit.log(ctx, 'SCHEDULE_INTERVIEW', 'Interview', iv._id, { applicationId: app._id, stage: b.stage });
  return iv;
}

async function loadInterview(user, id, ctx) {
  const iv = await Interview.findById(id);
  if (!iv) throw new AppError(404, 'Interview not found');
  const app = await appService.loadForUser(user, iv.applicationId, ctx); // enforces tenant / recruiter scope
  return { iv, app };
}
async function update(user, id, b, ctx) {
  const { iv } = await loadInterview(user, id, ctx);
  ['scheduledAt', 'mode', 'location', 'notes'].forEach((k) => { if (b[k] !== undefined) iv[k] = b[k]; });
  await iv.save();
  await audit.log(ctx, 'UPDATE_INTERVIEW', 'Interview', iv._id, {});
  return iv;
}
async function setResult(user, id, { result, notes }, ctx) {
  if (!['PASSED', 'FAILED'].includes(result)) throw new AppError(400, 'Result must be PASSED or FAILED');
  const { iv, app } = await loadInterview(user, id, ctx);
  if (iv.result !== 'PENDING') throw new AppError(409, 'Interview result has already been recorded');
  if (['REJECTED', 'PLACED'].includes(app.status)) {
    throw new AppError(409, 'Cannot record an interview result for a closed application');
  }
  if (result === 'FAILED') assertTransition(app.status, 'REJECTED');
  iv.result = result;
  if (notes) iv.notes = notes;
  await iv.save();
  if (result === 'FAILED') await appService.transition(app, 'REJECTED', user, `${iv.stage} failed`, ctx);
  await audit.log(ctx, 'UPDATE_INTERVIEW', 'Interview', iv._id, { result });
  return iv;
}

async function list(user, q, ctx) {
  const filter = {};
  if (q.stage) filter.stage = q.stage;
  if (user.role === 'TPO') filter.tenantId = user.tenantId;
  else if (user.role === 'RECRUITER') filter.driveId = { $in: (await ras.accessibleDriveIds(user, ctx)).driveIds };
  else if (user.role === 'STUDENT') {
    const s = await Student.findOne({ userId: user.id, tenantId: user.tenantId }).select('_id');
    filter.applicationId = { $in: await Application.find({ studentId: s?._id }).distinct('_id') };
  } else throw new AppError(403, 'Not allowed');
  const out = await paginate(Interview, filter, q, {
    sort: { scheduledAt: 1 },
    populate: [{ path: 'driveId', select: 'title companyId', populate: { path: 'companyId', select: 'name' } },
      { path: 'applicationId', select: 'studentId status', populate: { path: 'studentId', select: user.role === 'STUDENT' ? 'name' : 'name branch' } }],
  });
  out.items = out.items.map((i) => ({ ...i, company: i.driveId?.companyId?.name, drive: i.driveId?.title, candidate: user.role === 'STUDENT' ? undefined : i.applicationId?.studentId?.name, applicationStatus: i.applicationId?.status, applicationId: i.applicationId?._id }));
  return out;
}

module.exports = { schedule, update, setResult, list };
