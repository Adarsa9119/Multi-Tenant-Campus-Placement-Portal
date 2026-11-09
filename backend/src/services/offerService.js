const Offer = require('../models/Offer');
const Student = require('../models/Student');
const Application = require('../models/Application');
const appService = require('./applicationService');
const notify = require('./notificationService');
const audit = require('./auditService');
const { AppError } = require('../utils/response');
const { paginate } = require('../utils/pagination');
const ras = require('./recruiterAuthorizationService');

async function create(user, b, ctx) {
  if (!['TPO', 'RECRUITER'].includes(user.role)) throw new AppError(403, 'Not allowed');
  const app = await appService.loadForUser(user, b.applicationId, ctx);
  if (app.status !== 'SELECTED') throw new AppError(409, 'Offers can only be created for selected candidates');
  const drive = await require('../models/PlacementDrive').findById(app.driveId);
  const offer = await Offer.create({
    applicationId: app._id, tenantId: app.tenantId, studentId: app.studentId, companyId: app.companyId, driveId: app.driveId,
    role: b.role || drive.title, package: b.package || drive.package, joiningDate: b.joiningDate, createdBy: user.id,
  });
  await appService.transition(app, 'OFFER', user, 'Offer released', ctx);
  const s = await Student.findById(app.studentId).select('userId').lean();
  await notify.notify(s.userId, { type: 'OFFER', message: `You received an offer for ${offer.role}`, link: '/student/offers', tenantId: app.tenantId });
  await audit.log(ctx, 'CREATE_OFFER', 'Offer', offer._id, { applicationId: app._id });
  return offer;
}

async function list(user, q, ctx) {
  const filter = {};
  if (q.status) filter.status = q.status;
  if (user.role === 'TPO') filter.tenantId = user.tenantId;
  else if (user.role === 'STUDENT') {
    const s = await Student.findOne({ userId: user.id, tenantId: user.tenantId }).select('_id');
    filter.studentId = s?._id;
  } else if (user.role === 'RECRUITER') filter.driveId = { $in: (await ras.accessibleDriveIds(user, ctx)).driveIds };
  else throw new AppError(403, 'Not allowed');
  const populate = [{ path: 'companyId', select: 'name' }];
  if (user.role !== 'STUDENT') populate.push({ path: 'studentId', select: 'name branch' });
  const out = await paginate(Offer, filter, q, { populate });
  out.items = out.items.map((o) => ({ ...o, company: o.companyId?.name, candidate: o.studentId?.name }));
  return out;
}

async function respond(user, id, { accept }, ctx) {
  const s = await Student.findOne({ userId: user.id, tenantId: user.tenantId });
  const offer = await Offer.findOne({ _id: id, studentId: s?._id });
  if (!offer) throw new AppError(404, 'Offer not found');
  if (offer.status !== 'OFFERED') throw new AppError(409, 'Offer already answered');
  const app = await Application.findById(offer.applicationId);
  offer.status = accept ? 'ACCEPTED' : 'DECLINED';
  offer.respondedAt = new Date();
  await offer.save();
  if (accept) {
    await appService.transition(app, 'PLACED', user, 'Offer accepted', ctx);
    s.placementStatus = 'PLACED';
    await s.save();
  } else {
    await appService.transition(app, 'REJECTED', user, 'Offer declined', ctx);
  }
  await audit.log(ctx, 'RESPOND_OFFER', 'Offer', offer._id, { accept });
  return offer;
}

module.exports = { create, list, respond };
