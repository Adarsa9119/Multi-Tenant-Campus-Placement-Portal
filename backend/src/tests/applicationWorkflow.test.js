const h = require('./setup');

let w;
beforeAll(async () => { await h.start(); });
afterAll(h.stop);
beforeEach(async () => { await h.clear(); w = await h.world(); });

describe('application workflow', () => {
  test('eligible verified student can apply once', async () => {
    const r = await h.apply(w.s1, w.d1._id);
    expect(r.status).toBe(201);
    expect((await h.apply(w.s1, w.d1._id)).status).toBe(409);
  });
  test('ineligible, unverified and expired applications are blocked', async () => {
    expect((await h.apply(w.s1b, w.d1._id)).status).toBe(403);
    expect((await h.apply(w.s1c, w.d1._id)).status).toBe(403);
    expect((await h.apply(w.s1, w.dExpired._id)).status).toBe(409);
  });
  test('drive that is not published cannot receive applications', async () => {
    await h.M('PlacementDrive').updateOne({ _id: w.d1._id }, { status: 'DRAFT' });
    expect((await h.apply(w.s1, w.d1._id)).status).toBe(409);
  });
  test('invalid transitions are rejected, valid ones accepted', async () => {
    const a = (await h.apply(w.s1, w.d1._id)).body.data;
    const st = (status) => h.request(h.app).post(`/api/applications/${a._id}/status`).set(h.auth(w.r1.u)).send({ status });
    expect((await st('SELECTED')).status).toBe(409);
    expect((await st('UNDER_REVIEW')).status).toBe(200);
    expect((await st('SHORTLISTED')).status).toBe(200);
    expect((await st('PLACED')).status).toBe(422);
  });
  test('interview scheduling moves the application and offer acceptance places the student', async () => {
    const a = (await h.apply(w.s1, w.d1._id)).body.data;
    const st = (status) => h.request(h.app).post(`/api/applications/${a._id}/status`).set(h.auth(w.r1.u)).send({ status });
    await st('UNDER_REVIEW'); await st('SHORTLISTED');
    const iv = await h.request(h.app).post('/api/interviews').set(h.auth(w.r1.u)).send({ applicationId: a._id, stage: 'INTERVIEW', scheduledAt: new Date(Date.now() + 864e5).toISOString() });
    expect(iv.status).toBe(201);
    expect((await h.M('Application').findById(a._id)).status).toBe('INTERVIEW');
    expect((await st('SELECTED')).status).toBe(200);
    const offer = await h.request(h.app).post('/api/offers').set(h.auth(w.r1.u)).send({ applicationId: a._id, joiningDate: '2027-07-01' });
    expect(offer.status).toBe(201);
    const acc = await h.request(h.app).post(`/api/offers/${offer.body.data._id}/respond`).set(h.auth(w.s1.u)).send({ accept: true });
    expect(acc.status).toBe(200);
    expect((await h.M('Application').findById(a._id)).status).toBe('PLACED');
    expect((await h.M('Student').findById(w.s1.s._id)).placementStatus).toBe('PLACED');
  });
  test('audit records are written for sensitive actions', async () => {
    await h.apply(w.s1, w.d1._id);
    expect(await h.M('AuditLog').countDocuments({ action: 'APPLY_DRIVE' })).toBe(1);
  });
});
