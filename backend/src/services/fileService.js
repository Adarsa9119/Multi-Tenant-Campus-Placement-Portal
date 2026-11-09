const fs = require('fs');
const path = require('path');
const FileAsset = require('../models/FileAsset');
const Student = require('../models/Student');
const Application = require('../models/Application');
const ras = require('./recruiterAuthorizationService');
const audit = require('./auditService');
const { validateResume, randomKey, safeResolve } = require('../utils/fileSecurity');
const { AppError } = require('../utils/response');

async function saveResume(user, file, ctx) {
  const err = validateResume(file);
  if (err) throw new AppError(400, err);
  const student = await Student.findOne({ userId: user.id, tenantId: user.tenantId });
  if (!student) throw new AppError(404, 'Student profile not found');
  const ext = path.extname(file.originalname).toLowerCase();
  const key = randomKey(ext);
  fs.mkdirSync(safeResolve(String(user.tenantId)), { recursive: true });
  fs.writeFileSync(safeResolve(String(user.tenantId), key), file.buffer, { mode: 0o600 });
  const asset = await FileAsset.create({ tenantId: user.tenantId, studentId: student._id, storageKey: key, originalName: path.basename(file.originalname).slice(0, 120), mimeType: file.mimetype, size: file.size });
  if (student.resumeFileId) {
    const old = await FileAsset.findById(student.resumeFileId);
    if (old) { old.active = false; await old.save(); try { fs.unlinkSync(safeResolve(String(old.tenantId), old.storageKey)); } catch (e) { /* already removed */ } }
  }
  student.resumeFileId = asset._id;
  await student.save();
  await audit.log(ctx, 'UPLOAD_RESUME', 'FileAsset', asset._id, { size: file.size });
  return { id: asset._id, name: asset.originalName, size: asset.size };
}

async function resumeMeta(user) {
  const s = await Student.findOne({ userId: user.id, tenantId: user.tenantId }).populate('resumeFileId', 'originalName size createdAt active').lean();
  const a = s?.resumeFileId;
  return a && a.active ? { hasResume: true, name: a.originalName, size: a.size, uploadedAt: a.createdAt } : { hasResume: false };
}

function stream(res, asset, download) {
  const full = safeResolve(String(asset.tenantId), asset.storageKey);
  if (!fs.existsSync(full)) throw new AppError(404, 'Resume file not found');
  const safeName = String(asset.originalName || 'resume').replace(/[^\w.\- ]/g, '_');
  res.setHeader('Content-Type', asset.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `${download ? 'attachment' : 'inline'}; filename="${safeName}"`);
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  fs.createReadStream(full).pipe(res);
}

async function activeAsset(studentId) {
  const s = await Student.findById(studentId).select('resumeFileId');
  const a = s?.resumeFileId ? await FileAsset.findById(s.resumeFileId) : null;
  if (!a || !a.active) throw new AppError(404, 'No resume uploaded');
  return a;
}

async function sendOwn(user, res, ctx) {
  const s = await Student.findOne({ userId: user.id, tenantId: user.tenantId }).select('_id');
  stream(res, await activeAsset(s?._id), false);
}

// Recruiter / TPO access through the application relationship. Every access is authorized and audited.
async function sendForApplication(user, applicationId, res, ctx, download) {
  let app;
  if (user.role === 'RECRUITER') app = (await ras.assertCandidateAccess(user, applicationId, ctx)).application;
  else if (user.role === 'TPO') {
    app = await Application.findOne({ _id: applicationId, tenantId: user.tenantId });
    if (!app) throw new AppError(404, 'Application not found');
  } else throw new AppError(403, 'Not allowed');
  const asset = await activeAsset(app.studentId);
  if (String(asset.tenantId) !== String(app.tenantId)) throw new AppError(403, 'Access denied');
  await audit.log(ctx, download ? 'DOWNLOAD_RESUME' : 'VIEW_RESUME', 'FileAsset', asset._id, { applicationId: app._id });
  stream(res, asset, download);
}

module.exports = { saveResume, resumeMeta, sendOwn, sendForApplication };
