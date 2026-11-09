const h = require('./setup');
const mail = require('../services/mailService');

let w;
beforeAll(async () => { await h.start(); jest.spyOn(mail, 'sendOtp').mockResolvedValue(); });
afterAll(h.stop);
beforeEach(async () => { await h.clear(); w = await h.world(); });

describe('company and recruiter suspension', () => {
  test('suspending a company blocks recruiters, pauses drives and keeps history', async () => {
    const a = await h.M('Application').create({ tenantId: w.t1._id, studentId: w.s1.s._id, driveId: w.d1._id, companyId: w.company._id });
    const r = await h.request(h.app).post(`/api/companies/${w.company._id}/suspend`).set(h.auth(w.admin)).send({ reason: 'policy' });
    expect(r.status).toBe(200);
    expect((await h.request(h.app).get(`/api/recruiters/portal/drives/${w.d1._id}`).set(h.auth(w.r1.u))).status).toBe(403);
    expect((await h.request(h.app).get('/api/recruiters').set(h.auth(w.r1.u))).status).toBe(403);
    expect((await h.request(h.app).post('/api/auth/login').send({ email: 'r1@test.com', password: h.PASSWORD })).status).toBe(403);
    expect((await h.M('PlacementDrive').findById(w.d1._id)).status).toBe('SUSPENDED');
    expect(await h.M('Application').findById(a._id)).toBeTruthy(); // history preserved
    expect((await h.apply(w.s1, w.d1._id)).status).toBe(409);
    expect(await h.M('AuditLog').countDocuments({ action: 'SUSPEND_COMPANY' })).toBe(1);
  });
  test('reinstating the company restores its drives', async () => {
    await h.request(h.app).post(`/api/companies/${w.company._id}/suspend`).set(h.auth(w.admin)).send({});
    await h.request(h.app).post(`/api/companies/${w.company._id}/reinstate`).set(h.auth(w.admin));
    expect((await h.M('PlacementDrive').findById(w.d1._id)).status).toBe('PUBLISHED');
    expect((await h.request(h.app).get(`/api/recruiters/portal/drives/${w.d1._id}`).set(h.auth(w.r1.u))).status).toBe(200);
  });
  test('de-verifying a company pauses drives and removes them from student views until re-verified', async () => {
    const rejected = await h.request(h.app)
      .post(`/api/companies/${w.company._id}/reject`)
      .set(h.auth(w.admin))
      .send({ notes: 'Documents need review' });

    expect(rejected.status).toBe(200);
    expect((await h.M('PlacementDrive').findById(w.d1._id)).status).toBe('SUSPENDED');
    const eligibilityBeforeReverification = (await h.request(h.app).get('/api/student/eligibility').set(h.auth(w.s1.u))).body.data;
    expect(eligibilityBeforeReverification).toHaveLength(1);
    expect(eligibilityBeforeReverification[0]).toMatchObject({ _id: String(w.dOther._id), company: 'Other Co' });
    expect((await h.request(h.app).get(`/api/student/drives/${w.d1._id}`).set(h.auth(w.s1.u))).status).toBe(404);
    expect((await h.apply(w.s1, w.d1._id)).status).toBe(409);

    const verified = await h.request(h.app)
      .post(`/api/companies/${w.company._id}/verify`)
      .set(h.auth(w.admin))
      .send({});

    expect(verified.status).toBe(200);
    expect((await h.M('PlacementDrive').findById(w.d1._id)).status).toBe('PUBLISHED');
    expect((await h.M('PlacementDrive').findById(w.dExpired._id)).status).toBe('CLOSED');
    const eligibilityAfterReverification = (await h.request(h.app).get('/api/student/eligibility').set(h.auth(w.s1.u))).body.data;
    expect(eligibilityAfterReverification).toHaveLength(2);
    expect(eligibilityAfterReverification.map((drive) => drive._id)).toContain(String(w.d1._id));
    expect((await h.request(h.app).get(`/api/student/drives/${w.d1._id}`).set(h.auth(w.s1.u))).status).toBe(200);
  });
  test('suspending one recruiter blocks only that recruiter', async () => {
    const r = await h.request(h.app).post(`/api/recruiters/${w.r1.r._id}/suspend`).set(h.auth(w.admin)).send({ reason: 'abuse' });
    expect(r.status).toBe(200);
    expect((await h.request(h.app).post('/api/auth/login').send({ email: 'r1@test.com', password: h.PASSWORD })).status).toBe(403);
    expect((await h.request(h.app).get('/api/recruiters/portal/drives').set(h.auth(w.r1.u))).status).toBe(401); // user suspended: token no longer valid
    expect(await h.M('AuditLog').countDocuments({ action: 'SUSPEND_RECRUITER' })).toBe(1);
  });
  test('only the super admin can suspend', async () => {
    expect((await h.request(h.app).post(`/api/companies/${w.company._id}/suspend`).set(h.auth(w.tpo1)).send({})).status).toBe(403);
    expect((await h.request(h.app).post(`/api/recruiters/${w.r1.r._id}/suspend`).set(h.auth(w.r1.u)).send({})).status).toBe(403);
  });
});
