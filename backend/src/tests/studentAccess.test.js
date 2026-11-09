const h = require('./setup');

let w;
beforeAll(async () => { await h.start(); });
afterAll(h.stop);
beforeEach(async () => { await h.clear(); w = await h.world(); });

describe('student access control', () => {
  test('student sees own profile only', async () => {
    const r = await h.request(h.app).get('/api/student/profile').set(h.auth(w.s1.u));
    expect(r.body.data.email).toBe('s1@test.com');
  });
  test('student cannot use TPO, recruiter or admin routes', async () => {
    for (const p of ['/api/tpo/students', '/api/tpo/dashboard', '/api/recruiters/portal/dashboard', '/api/admin/dashboard', '/api/reports/placement-summary']) {
      expect((await h.request(h.app).get(p).set(h.auth(w.s1.u))).status).toBe(403);
    }
  });
  test('student cannot read another student application', async () => {
    const a = await h.M('Application').create({ tenantId: w.t1._id, studentId: w.s1b.s._id, driveId: w.d1._id, companyId: w.company._id });
    expect((await h.request(h.app).get(`/api/applications/${a._id}`).set(h.auth(w.s1.u))).status).toBe(403);
  });
  test('student cannot change role or tenant through profile update', async () => {
    await h.request(h.app).put('/api/student/profile').set(h.auth(w.s1.u)).send({ role: 'TPO', tenantId: String(w.t2._id), skills: ['Go'] });
    const u = await h.M('User').findById(w.s1.u._id); const s = await h.M('Student').findById(w.s1.s._id);
    expect(u.role).toBe('STUDENT'); expect(String(s.tenantId)).toBe(String(w.t1._id)); expect(s.skills).toEqual(['Go']);
  });
  test('changing CGPA triggers re-verification', async () => {
    await h.request(h.app).put('/api/student/profile').set(h.auth(w.s1.u)).send({ cgpa: 9.9 });
    expect((await h.M('Student').findById(w.s1.s._id)).verificationStatus).toBe('PENDING');
  });
  test('student only lists eligible published drives of own tenant', async () => {
    const r = await h.request(h.app).get('/api/student/drives').set(h.auth(w.s1.u));
    const ids = r.body.data.map((d) => String(d._id));
    expect(ids).toContain(String(w.d1._id)); expect(ids).not.toContain(String(w.d2._id));
    const low = await h.request(h.app).get('/api/student/drives').set(h.auth(w.s1b.u));
    expect(low.body.data).toHaveLength(0);
  });
});
