const h = require('./setup');

let w;
beforeAll(async () => { await h.start(); });
afterAll(h.stop);
beforeEach(async () => { await h.clear(); w = await h.world(); });

describe('tenant isolation (TEN001 vs TEN002)', () => {
  test('TPO cannot read a student of another tenant by changing the object id', async () => {
    const r = await h.request(h.app).get(`/api/tpo/students/${w.s2.s._id}`).set(h.auth(w.tpo1));
    expect(r.status).toBe(403);
    const own = await h.request(h.app).get(`/api/tpo/students/${w.s1.s._id}`).set(h.auth(w.tpo1));
    expect(own.status).toBe(200);
  });
  test('TPO cannot modify or verify another tenant student', async () => {
    expect((await h.request(h.app).put(`/api/tpo/students/${w.s2.s._id}`).set(h.auth(w.tpo1)).send({ cgpa: 10 })).status).toBe(403);
    expect((await h.request(h.app).post(`/api/tpo/students/${w.s2.s._id}/verify`).set(h.auth(w.tpo1)).send({ status: 'VERIFIED' })).status).toBe(403);
  });
  test('student list only returns own tenant', async () => {
    const r = await h.request(h.app).get('/api/tpo/students').set(h.auth(w.tpo1));
    expect(r.body.data.every((s) => String(s.tenantId) === String(w.t1._id))).toBe(true);
    expect(r.body.data.find((s) => s.email === 's2@test.com')).toBeUndefined();
  });
  test('tenantId in the body or query is ignored', async () => {
    const r = await h.request(h.app).post('/api/tpo/students').set(h.auth(w.tpo1)).send({ tenantId: String(w.t2._id), name: 'X', email: 'x@test.com', rollNo: 'X1', branch: 'CSE', graduationYear: 2027, cgpa: 8 });
    expect(r.status).toBe(201);
    expect(String(r.body.data.tenantId)).toBe(String(w.t1._id));
  });
  test('TPO cannot publish or view a drive of another tenant', async () => {
    expect((await h.request(h.app).post(`/api/drives/${w.d2._id}/close`).set(h.auth(w.tpo1))).status).toBe(403);
    expect((await h.request(h.app).get(`/api/drives/${w.d2._id}`).set(h.auth(w.tpo1))).status).toBe(404);
  });
  test('student cannot apply to a drive of another tenant', async () => {
    const r = await h.apply(w.s1, w.d2._id);
    expect(r.status).toBe(404);
  });
  test('cross-tenant attempts are audited and raise an alert', async () => {
    await h.request(h.app).get(`/api/tpo/students/${w.s2.s._id}`).set(h.auth(w.tpo1));
    expect(await h.M('AuditLog').countDocuments({ action: 'CROSS_TENANT_ACCESS_ATTEMPT' })).toBeGreaterThan(0);
    expect(await h.M('SecurityAlert').countDocuments({ eventType: 'CROSS_TENANT_ACCESS' })).toBe(1);
  });
  test('TPO cannot reach super admin routes', async () => {
    expect((await h.request(h.app).get('/api/admin/tenants').set(h.auth(w.tpo1))).status).toBe(403);
  });
});
