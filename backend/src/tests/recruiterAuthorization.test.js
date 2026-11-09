const h = require('./setup');

let w; let app1;
beforeAll(async () => { await h.start(); });
afterAll(h.stop);
beforeEach(async () => {
  await h.clear(); w = await h.world();
  app1 = await h.M('Application').create({ tenantId: w.t1._id, studentId: w.s1.s._id, driveId: w.d1._id, companyId: w.company._id, status: 'APPLIED' });
  await h.M('Application').create({ tenantId: w.t1._id, studentId: w.s1b.s._id, driveId: w.dOther._id, companyId: w.other._id, status: 'APPLIED' });
});

describe('recruiter least-privilege access', () => {
  test('authorized recruiter sees candidates of an assigned drive with minimal data', async () => {
    const r = await h.request(h.app).get(`/api/recruiters/portal/drives/${w.d1._id}/candidates`).set(h.auth(w.r1.u));
    expect(r.status).toBe(200);
    expect(r.body.data).toHaveLength(1);
    const c = r.body.data[0];
    expect(c.name).toBe('Stu One');
    expect(c.email).toBeUndefined(); expect(c.phone).toBeUndefined(); expect(c.rollNo).toBeUndefined();
  });
  test('recruiter cannot open drives of another company (object id manipulation)', async () => {
    expect((await h.request(h.app).get(`/api/recruiters/portal/drives/${w.dOther._id}/candidates`).set(h.auth(w.r1.u))).status).toBe(403);
    expect((await h.request(h.app).get(`/api/recruiters/portal/drives/${w.d2._id}`).set(h.auth(w.r1.u))).status).toBe(403);
  });
  test('recruiter cannot read an application of another drive/company', async () => {
    const foreign = await h.M('Application').findOne({ driveId: w.dOther._id });
    expect((await h.request(h.app).get(`/api/recruiters/portal/candidates/${foreign._id}`).set(h.auth(w.r1.u))).status).toBe(403);
    expect((await h.request(h.app).get(`/api/applications/${foreign._id}`).set(h.auth(w.r1.u))).status).toBe(403);
    expect((await h.request(h.app).get(`/api/recruiters/portal/candidates/${app1._id}`).set(h.auth(w.r1.u))).status).toBe(200);
  });
  test('recruiter list endpoint is limited to authorized drives', async () => {
    const r = await h.request(h.app).get('/api/applications').set(h.auth(w.r1.u));
    expect(r.body.data.map((a) => String(a._id))).toEqual([String(app1._id)]);
  });
  test('platform-unauthorized recruiter gets nothing', async () => {
    expect((await h.request(h.app).get('/api/recruiters/portal/drives').set(h.auth(w.rPending.u))).status).toBe(403);
  });
  test('recruiter without college authorization is denied', async () => {
    await h.M('RecruiterAuthorization').updateOne({ recruiterId: w.r1.r._id }, { status: 'REVOKED' });
    expect((await h.request(h.app).get(`/api/recruiters/portal/drives/${w.d1._id}`).set(h.auth(w.r1.u))).status).toBe(403);
  });
  test('revoked college approval removes access', async () => {
    await h.M('CollegeCompanyApproval').updateOne({ companyId: w.company._id }, { status: 'REVOKED' });
    expect((await h.request(h.app).get(`/api/recruiters/portal/drives/${w.d1._id}`).set(h.auth(w.r1.u))).status).toBe(403);
  });
  test('recruiter cannot use TPO/admin/student endpoints', async () => {
    expect((await h.request(h.app).get('/api/tpo/students').set(h.auth(w.r1.u))).status).toBe(403);
    expect((await h.request(h.app).get('/api/admin/tenants').set(h.auth(w.r1.u))).status).toBe(403);
    expect((await h.request(h.app).get('/api/student/profile').set(h.auth(w.r1.u))).status).toBe(403);
  });
  test('denials are audited', async () => {
    await h.request(h.app).get(`/api/recruiters/portal/drives/${w.dOther._id}`).set(h.auth(w.r1.u));
    expect(await h.M('AuditLog').countDocuments({ action: 'AUTHORIZATION_DENIED' })).toBeGreaterThan(0);
  });
});
