const h = require('./setup');

let w; let app1;
const pdf = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF');
beforeAll(async () => { await h.start(); });
afterAll(h.stop);
beforeEach(async () => {
  await h.clear(); w = await h.world();
  app1 = await h.M('Application').create({ tenantId: w.t1._id, studentId: w.s1.s._id, driveId: w.d1._id, companyId: w.company._id, status: 'SHORTLISTED' });
  const up = await h.request(h.app).post('/api/files/resume').set(h.auth(w.s1.u)).attach('resume', pdf, { filename: 'cv.pdf', contentType: 'application/pdf' });
  expect(up.status).toBe(201);
});

describe('protected resumes', () => {
  test('rejects wrong type and forged content', async () => {
    const txt = await h.request(h.app).post('/api/files/resume').set(h.auth(w.s1.u)).attach('resume', Buffer.from('hello'), { filename: 'cv.txt', contentType: 'text/plain' });
    expect(txt.status).toBe(400);
    const fake = await h.request(h.app).post('/api/files/resume').set(h.auth(w.s1.u)).attach('resume', Buffer.from('not a pdf'), { filename: 'cv.pdf', contentType: 'application/pdf' });
    expect(fake.status).toBe(400);
  });
  test('rejects oversized files', async () => {
    const big = Buffer.concat([Buffer.from('%PDF-'), Buffer.alloc(6 * 1024 * 1024)]);
    const r = await h.request(h.app).post('/api/files/resume').set(h.auth(w.s1.u)).attach('resume', big, { filename: 'big.pdf', contentType: 'application/pdf' });
    expect(r.status).toBe(400);
  });
  test('authorized recruiter can fetch the resume and it is audited', async () => {
    const r = await h.request(h.app).get(`/api/files/applications/${app1._id}/resume`).set(h.auth(w.r1.u));
    expect(r.status).toBe(200);
    expect(r.headers['content-type']).toContain('pdf');
    expect(r.headers['cache-control']).toContain('no-store');
    expect(await h.M('AuditLog').countDocuments({ action: 'VIEW_RESUME' })).toBe(1);
  });
  test('recruiter of another company is denied', async () => {
    expect((await h.request(h.app).get(`/api/files/applications/${app1._id}/resume`).set(h.auth(w.rOther.u))).status).toBe(403);
  });
  test('unauthorized recruiter and other roles are denied', async () => {
    expect((await h.request(h.app).get(`/api/files/applications/${app1._id}/resume`).set(h.auth(w.rPending.u))).status).toBe(403);
    expect((await h.request(h.app).get(`/api/files/applications/${app1._id}/resume`).set(h.auth(w.s1b.u))).status).toBe(403);
  });
  test('TPO of another tenant is denied; own TPO allowed', async () => {
    expect((await h.request(h.app).get(`/api/files/applications/${app1._id}/resume`).set(h.auth(w.tpo2))).status).toBe(404);
    expect((await h.request(h.app).get(`/api/files/applications/${app1._id}/resume`).set(h.auth(w.tpo1))).status).toBe(200);
  });
  test('no public/predictable resume URL exists', async () => {
    expect((await h.request(h.app).get('/resumes/R1.pdf')).status).toBe(404);
    expect((await h.request(h.app).get('/public/resumes/R1.pdf')).status).toBe(404);
    expect((await h.request(h.app).get('/api/files/resume/me')).status).toBe(401);
  });
});
