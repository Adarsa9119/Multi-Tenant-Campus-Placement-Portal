// Shared test harness: in-memory MongoDB + a small two-tenant world. Must be required before the app.
const os = require('os');
const path = require('path');
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.MONGO_URI = 'mongodb://placeholder';
process.env.OTP_RESEND_COOLDOWN_SECONDS = '0';
process.env.UPLOAD_DIR = path.join(os.tmpdir(), `placement-test-${process.pid}`);

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../app');
const { signToken } = require('../utils/jwt');
const { hashPassword } = require('../utils/password');

let mongod;
const start = async () => { mongod = await MongoMemoryServer.create(); await mongoose.connect(mongod.getUri()); };
const stop = async () => { await mongoose.disconnect(); if (mongod) await mongod.stop(); };
const clear = async () => { for (const k of Object.keys(mongoose.connection.collections)) await mongoose.connection.collections[k].deleteMany({}); };
const M = (n) => require(`../models/${n}`);
const token = (u) => signToken(u);
const auth = (u) => ({ Authorization: `Bearer ${token(u)}` });
const PASSWORD = 'Str0ng@Pass1';

async function world() {
  const pw = await hashPassword(PASSWORD);
  const user = (o) => M('User').create({ passwordHash: pw, status: 'ACTIVE', ...o });
  const admin = await user({ name: 'Admin', email: 'admin@test.com', role: 'SUPER_ADMIN' });
  const t1 = await M('Tenant').create({ tenantCode: 'TEN001', collegeName: 'College One' });
  const t2 = await M('Tenant').create({ tenantCode: 'TEN002', collegeName: 'College Two' });
  const tpo1 = await user({ name: 'TPO1', email: 'tpo1@test.com', role: 'TPO', tenantId: t1._id });
  const tpo2 = await user({ name: 'TPO2', email: 'tpo2@test.com', role: 'TPO', tenantId: t2._id });
  const mkStudent = async (tenant, name, email, roll, cgpa = 8, backlogs = 0, verified = 'VERIFIED') => {
    const u = await user({ name, email, role: 'STUDENT', tenantId: tenant._id });
    const s = await M('Student').create({ tenantId: tenant._id, userId: u._id, name, email, rollNo: roll, branch: 'CSE', graduationYear: 2027, cgpa, backlogs, verificationStatus: verified, skills: ['React'] });
    return { u, s };
  };
  const s1 = await mkStudent(t1, 'Stu One', 's1@test.com', 'R1');
  const s1b = await mkStudent(t1, 'Stu Low', 's1b@test.com', 'R1B', 6, 2);
  const s1c = await mkStudent(t1, 'Stu Unverified', 's1c@test.com', 'R1C', 9, 0, 'PENDING');
  const s2 = await mkStudent(t2, 'Stu Two', 's2@test.com', 'R2');
  const company = await M('Company').create({ companyCode: 'COMP001', name: 'ABC Tech', verificationStatus: 'VERIFIED', status: 'ACTIVE' });
  const other = await M('Company').create({ companyCode: 'COMP002', name: 'Other Co', verificationStatus: 'VERIFIED', status: 'ACTIVE' });
  const rec = async (comp, email, o = {}) => {
    const u = await user({ name: email, email, role: 'RECRUITER' });
    const r = await M('Recruiter').create({ companyId: comp._id, userId: u._id, status: 'ACTIVE', authorizationStatus: 'AUTHORIZED', ...o });
    return { u, r };
  };
  const r1 = await rec(company, 'r1@test.com', { isCompanyAdmin: true });
  const rPending = await rec(company, 'rp@test.com', { authorizationStatus: 'PENDING' });
  const rOther = await rec(other, 'ro@test.com');
  await M('CollegeCompanyApproval').create({ tenantId: t1._id, companyId: company._id, status: 'APPROVED' });
  await M('CollegeCompanyApproval').create({ tenantId: t1._id, companyId: other._id, status: 'APPROVED' });
  await M('RecruiterAuthorization').create({ recruiterId: r1.r._id, companyId: company._id, tenantId: t1._id });
  await M('RecruiterAuthorization').create({ recruiterId: rOther.r._id, companyId: other._id, tenantId: t1._id });
  const drive = (tenant, comp, recruiters, o = {}) => M('PlacementDrive').create({ tenantId: tenant._id, companyId: comp._id, recruiterIds: recruiters, title: 'SDE', package: 8, criteria: { minCgpa: 7.5, branches: ['CSE'], maxBacklogs: 0, graduationYear: 2027 }, deadline: new Date(Date.now() + 864e5 * 10), status: 'PUBLISHED', ...o });
  const d1 = await drive(t1, company, [r1.r._id]);
  const dOther = await drive(t1, other, [rOther.r._id]);
  const dExpired = await drive(t1, company, [r1.r._id], { deadline: new Date(Date.now() - 864e5) });
  const d2 = await drive(t2, company, [r1.r._id]);
  return { admin, t1, t2, tpo1, tpo2, s1, s1b, s1c, s2, company, other, r1, rPending, rOther, d1, dOther, dExpired, d2 };
}
const apply = (student, driveId) => request(app).post('/api/applications').set(auth(student.u)).send({ driveId });
module.exports = { app, request, start, stop, clear, M, token, auth, world, apply, PASSWORD };
